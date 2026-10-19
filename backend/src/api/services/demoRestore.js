const { createHash, randomUUID } = require("node:crypto");
const mongoose = require("mongoose");
const State = require("../models/demoRestore.model");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const Reward = require("../models/reward.model");
const Redemption = require("../models/redemption.model");
const Penalty = require("../models/penalty.model");
const CreditTransaction = require("../models/creditTransaction.model");
const Sprint = require("../models/sprint.model");
const APIError = require("../utils/APIError");
const { ACCOUNTS, stableId, buildFixture } = require("./demoFixture");

const KEY = "taskflow-demo-v1";
const HOUR = 3600000;
const LEASE = 300000;
const MODELS = { User, Task, Reward, Redemption, Penalty, CreditTransaction, Sprint };
const isDemo = (user) => ACCOUNTS.some(([, email]) => email === user?.email);
const conflict = () => APIError.conflict("Demo data is shared with non-demo users; restoration stopped without changing application data");

// Cross-instance lock, also used by demo-team mutations. A dead invocation's
// lease expires; a partial restore leaves the old fingerprint and is retryable.
async function acquireDemoLock() {
  await State.updateOne({ _id: KEY }, { $setOnInsert: { userIds: [] } }, { upsert: true });
  const owner = randomUUID();
  const locked = await State.findOneAndUpdate({
    _id: KEY,
    $or: [{ leaseUntil: { $lt: new Date() } }, { leaseUntil: null }],
  }, { $set: { leaseOwner: owner, leaseUntil: new Date(Date.now() + LEASE) } });
  if (!locked) throw APIError.conflict("Demo data is busy. Please retry shortly.");
  let lost = false;
  const timer = setInterval(() => {
    State.updateOne({ _id: KEY, leaseOwner: owner }, { $set: { leaseUntil: new Date(Date.now() + LEASE) } })
      .then((r) => { if (!r.matchedCount) lost = true; }).catch(() => { lost = true; });
  }, LEASE / 3);
  timer.unref();
  return {
    async check() {
      if (lost || !await State.exists({ _id: KEY, leaseOwner: owner, leaseUntil: { $gt: new Date() } })) {
        throw APIError.conflict("Demo restoration lease expired. Please retry.");
      }
    },
    async release() {
      clearInterval(timer);
      await State.updateOne({ _id: KEY, leaseOwner: owner }, { $unset: { leaseOwner: 1, leaseUntil: 1 } });
    },
  };
}

function canonical(value) {
  if (value instanceof Date) return value.toISOString();
  if (value instanceof mongoose.Types.ObjectId) return String(value);
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((k) => [k, canonical(value[k])]));
  return value;
}
const fingerprint = (rows) => createHash("sha256").update(JSON.stringify(canonical(rows))).digest("hex");

async function readOwned(ids) {
  const inDemo = { $in: ids };
  const filters = {
    User: { _id: inDemo }, Task: { createdBy: inDemo }, Reward: { createdBy: inDemo },
    Redemption: { manager: inDemo }, Penalty: { issuedBy: inDemo },
    CreditTransaction: { user: inDemo }, Sprint: { demoOwner: inDemo },
  };
  const rows = {};
  for (const [name, Model] of Object.entries(MODELS)) {
    // Passwords, sessions and account timestamps are neither checked nor reset.
    rows[name] = await Model.find(filters[name]).select(name === "User" ? "-password -created_at -updated_at -__v" : "-__v").sort({ _id: 1 }).lean();
  }
  return rows;
}

async function assertExclusive(rows, ids, desired) {
  const demo = (id) => ids.some((v) => String(v) === String(id));
  if (rows.Task.some((t) => t.assignee && !demo(t.assignee)) ||
      rows.Redemption.some((r) => !demo(r.worker)) || rows.Penalty.some((p) => !demo(p.worker))) throw conflict();
  // Reverse references can make a demo-owned reward or task shared. Never
  // delete/replace those records or another user's ledger entry.
  const taskIds = rows.Task.map((r) => r._id);
  const rewardIds = rows.Reward.map((r) => r._id);
  const refs = [...taskIds, ...rows.Penalty.map((r) => r._id), ...rows.Redemption.map((r) => r._id)];
  if (await Redemption.exists({ reward: { $in: rewardIds }, worker: { $nin: ids } }) ||
      await CreditTransaction.exists({ ref: { $in: refs }, user: { $nin: ids } })) throw conflict();
  // Demo users may also have participated in real-owned work. Its ledger is
  // tied to that work's at-most-once payout and must not be removed.
  for (const [kind, Model, owner] of [["task_reward", Task, "createdBy"], ["reward_redeem", Redemption, "manager"], ["penalty_clear", Penalty, "issuedBy"]]) {
    const referenced = rows.CreditTransaction.filter((r) => r.kind === kind).map((r) => r.ref);
    if (referenced.length && await Model.exists({ _id: { $in: referenced }, [owner]: { $nin: ids } })) throw conflict();
  }
  const keep = new Set(desired.Task.map((t) => String(t._id)));
  const extra = taskIds.filter((id) => !keep.has(String(id)));
  if (extra.length && await Sprint.exists({ tasks: { $in: extra }, demoOwner: { $nin: ids } })) throw conflict();
  // A managed sprint containing someone else's task is shared too.
  const ownedTasks = new Set([...taskIds, ...desired.Task.map((t) => t._id)].map(String));
  if (rows.Sprint.some((s) => s.tasks.some((id) => !ownedTasks.has(String(id))))) throw conflict();
}

async function restoreDemo({ hourly = false, now = new Date() } = {}) {
  const lock = await acquireDemoLock();
  try {
    let state = await State.findById(KEY);
    if (hourly && state.lastHourlyCheck && now - state.lastHourlyCheck < HOUR) {
      return { restored: false, reason: "not-due" };
    }
    const accounts = await User.find({ email: { $in: ACCOUNTS.map(([, email]) => email) } });
    const ids = state.userIds.length ? state.userIds : ACCOUNTS.map(([, email]) => accounts.find((u) => u.email === email)?._id || stableId(email));
    for (const [i, [, email, role]] of ACCOUNTS.entries()) {
      const byEmail = accounts.find((u) => u.email === email);
      const byId = await User.findById(ids[i]);
      if ((byEmail && (String(byEmail._id) !== String(ids[i]) || byEmail.role !== role)) ||
          (byId && byId.email !== email)) throw conflict();
    }
    const current = await readOwned(ids);
    // Adopt existing seed task IDs once, preserving references in legacy shared
    // sprints. Never claim an unowned sprint just because its name matches.
    const taskIds = state.taskIds || Object.fromEntries(current.Task.map((t) => [t.title, t._id]));
    const baselineAt = state.baselineAt || now;
    let desired = buildFixture(ids, baselineAt, taskIds);
    const before = fingerprint(current);
    if (state.fingerprint && before === state.fingerprint) {
      if (hourly) await State.updateOne({ _id: KEY }, { $set: { lastHourlyCheck: now } });
      return { restored: false, reason: "unchanged" };
    }
    await assertExclusive(current, ids, desired);
    // Persist identity before any application writes so a crash can recover the
    // same missing users and record IDs. This is not a clean marker.
    await lock.check();
    await State.updateOne({ _id: KEY }, { $set: { userIds: ids, taskIds, baselineAt } });
    // Refresh relative history only when there really is work to restore.
    desired = buildFixture(ids, now, taskIds);
    // Fail closed on fixture-ID collisions rather than overwrite unrelated data.
    for (const [name, Model] of Object.entries(MODELS)) {
      const allowed = new Set(current[name].map((d) => String(d._id)));
      const collisions = await Model.find({ _id: { $in: desired[name].map((d) => d._id) } }).select("_id").lean();
      if (collisions.some((d) => !allowed.has(String(d._id)))) throw conflict();
    }
    for (const [name, Model] of Object.entries(MODELS)) {
      const wanted = new Set(desired[name].map((d) => String(d._id)));
      const extras = current[name].filter((d) => !wanted.has(String(d._id))).map((d) => d._id);
      await lock.check();
      if (extras.length) await Model.deleteMany({ _id: { $in: extras } });
      for (const doc of desired[name]) {
        await lock.check();
        if (name === "User") {
          if (!current.User.some((u) => String(u._id) === String(doc._id))) {
            await User.create({ ...doc, password: "taskflow123" });
          } else {
            await User.updateOne({ _id: doc._id }, { $set: doc });
          }
        } else {
          await Model.replaceOne({ _id: doc._id }, doc, { upsert: true, timestamps: false });
        }
      }
    }
    const after = await readOwned(ids);
    await lock.check();
    await State.updateOne({ _id: KEY }, { $set: {
      fingerprint: fingerprint(after), baselineAt: now, ...(hourly ? { lastHourlyCheck: now } : {}),
    } });
    return { restored: true, reason: "restored" };
  } finally {
    await lock.release();
  }
}

// Existing routes mutate multiple documents without transactions. Hold the same
// lease for their full response so restore cannot interleave with payouts.
async function guardDemoMutation(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  try {
    const manager = req.user?.reportsTo && await User.findById(req.user.reportsTo).select("email");
    const taskId = req.path.match(/^\/tasks\/([a-f0-9]{24})(?:\/|$)/i)?.[1];
    const task = taskId && await Task.findById(taskId).select("assignee createdBy");
    const participants = task && await User.exists({
      _id: { $in: [task.assignee, task.createdBy].filter(Boolean) },
      email: { $in: ACCOUNTS.map(([, email]) => email) },
    });
    if (!isDemo(req.user) && !isDemo(manager) && !participants && !req.baseUrl.includes("sprints") && !req.path.startsWith("/sprints")) return next();
    const lock = await acquireDemoLock();
    // Release before ending the response: serverless runtimes may freeze the
    // invocation immediately afterward, before a 'finish' async handler runs.
    const end = res.end;
    let ending = false;
    res.end = function (...args) {
      if (ending) return this;
      ending = true;
      lock.release().catch((err) => console.error("Demo lock release failed", err.message))
        .finally(() => end.apply(this, args));
      return this;
    };
    return next();
  } catch (err) { return next(err); }
}

module.exports = { restoreDemo, acquireDemoLock, guardDemoMutation, isDemo };
