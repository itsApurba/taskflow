const { describe, test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { startDb, stopDb, clearDb, api, signup } = require("./helpers");
const User = require("../src/api/models/user.model");
const Task = require("../src/api/models/task.model");
const Reward = require("../src/api/models/reward.model");
const Penalty = require("../src/api/models/penalty.model");
const Redemption = require("../src/api/models/redemption.model");
const CreditTransaction = require("../src/api/models/creditTransaction.model");
const Sprint = require("../src/api/models/sprint.model");
const RefreshToken = require("../src/api/models/refreshToken.model");
const State = require("../src/api/models/demoRestore.model");
const { restoreDemo, acquireDemoLock } = require("../src/api/services/demoRestore");
const { ACCOUNTS } = require("../src/api/services/demoFixture");

const NOW = new Date("2026-10-20T10:00:00Z");
const models = [User, Task, Reward, Penalty, Redemption, CreditTransaction, Sprint, RefreshToken];
const snapshot = async () => JSON.stringify(await Promise.all(models.map((m) => m.collection.find({}).sort({ _id: 1 }).toArray())));
const demo = () => User.findOne({ email: ACCOUNTS[0][1] });
const auth = async () => ({ Authorization: `Bearer ${(await demo()).token()}` });

describe("bounded demo restoration", () => {
  before(startDb);
  after(stopDb);
  beforeEach(clearDb);

  test("reuses the established dataset and is a byte-stable no-op on repeat", async () => {
    assert.equal((await restoreDemo({ now: NOW })).restored, true);
    assert.equal(await User.countDocuments(), 4);
    assert.equal(await Task.countDocuments(), 12);
    assert.equal(await Reward.countDocuments(), 4);
    assert.equal(await Penalty.countDocuments(), 2);
    assert.equal(await Redemption.countDocuments(), 2);
    assert.equal(await CreditTransaction.countDocuments(), 8);
    const asha = await User.findOne({ email: ACCOUNTS[1][1] });
    assert.equal(asha.credits, 60);
    assert.equal(asha.xp, 360);
    assert.equal(asha.streak, 2);
    assert.ok(await asha.passwordMatches("taskflow123"));
    const before = await snapshot();
    assert.deepEqual(await restoreDemo({ now: new Date(+NOW + 86400000) }), { restored: false, reason: "unchanged" });
    assert.equal(await snapshot(), before);
  });

  test("restores changed, missing and extra records, preserving IDs, passwords and sessions", async () => {
    await restoreDemo({ now: NOW });
    const manager = await demo();
    manager.password = "a-preserved-password";
    await manager.save();
    // Session data is intentionally opaque to restoration.
    await RefreshToken.collection.insertOne({ userId: manager._id, token: "preserved-session" });
    const originalPassword = (await demo()).password;
    const beforeTasks = await Task.find().sort({ _id: 1 }).select("_id").lean();
    const missing = await User.findOne({ email: ACCOUNTS[2][1] });
    await User.deleteOne({ _id: missing._id });
    await User.updateOne({ _id: manager._id }, { $set: { name: "Changed", credits: 999 } });
    await Task.updateOne({ status: "open" }, { $set: { title: "Changed task" } });
    await Task.deleteOne({ status: "in review" });
    await Task.create({ title: "Extra demo task", createdBy: manager._id });
    await Reward.updateOne({}, { $set: { cost: 999 } });
    await Reward.deleteOne({ title: "Coffee with the team" });
    await Reward.create({ title: "Extra demo reward", cost: 1, createdBy: manager._id });
    await Penalty.deleteMany({});
    await Redemption.deleteMany({});
    await CreditTransaction.deleteMany({});
    await Sprint.updateOne({ demoOwner: manager._id }, { $set: { name: "Changed sprint", tasks: [] } });
    assert.equal((await restoreDemo({ now: NOW })).restored, true);
    assert.deepEqual(await Task.find().sort({ _id: 1 }).select("_id").lean(), beforeTasks);
    assert.equal((await demo()).name, "Rohit Sharma");
    assert.equal((await demo()).password, originalPassword);
    assert.equal((await User.findById(missing._id)).email, missing.email);
    assert.equal(await RefreshToken.countDocuments({ token: "preserved-session" }), 1);
    assert.equal(await Reward.countDocuments(), 4);
    assert.equal(await Penalty.countDocuments(), 2);
    assert.equal(await Redemption.countDocuments(), 2);
    assert.equal(await CreditTransaction.countDocuments(), 8);
    assert.equal((await Sprint.findOne({ demoOwner: manager._id })).name, "Demo sprint");
    assert.equal((await restoreDemo({ now: NOW })).reason, "unchanged");
  });

  test("preserves unrelated users, real-owned content assigned to demos, and legacy shared sprints", async () => {
    const real = await signup({ role: "manager" });
    const suffixUser = await User.create({ name: "Not a demo fixture", email: "other@taskflow.demo", password: "keep" });
    const legacy = await Sprint.create({ name: "Demo sprint", tasks: [] });
    await restoreDemo({ now: NOW });
    const manager = await demo();
    const realTask = await Task.create({ title: "Real task", createdBy: real.user._id, assignee: manager._id });
    const reward = await Reward.create({ title: "Real reward", createdBy: real.user._id, cost: 5 });
    const penalty = await Penalty.create({ worker: manager._id, issuedBy: real.user._id, reason: "Real", cost: 1 });
    const records = [await User.findById(real.user._id).lean(), await User.findById(suffixUser._id).lean(), realTask.toObject(), reward.toObject(), penalty.toObject(), legacy.toObject()];
    await Task.create({ title: "Extra", createdBy: manager._id });
    await restoreDemo({ now: NOW });
    const after = [await User.findById(real.user._id).lean(), await User.findById(suffixUser._id).lean(), await Task.findById(realTask._id).lean(), await Reward.findById(reward._id).lean(), await Penalty.findById(penalty._id).lean(), await Sprint.findById(legacy._id).lean()];
    assert.deepEqual(after, records);
  });

  test("adopts existing seed task IDs without claiming or rewriting an unowned sprint", async () => {
    const manager = await User.create({ name: "Rohit Sharma", email: ACCOUNTS[0][1], password: "keep", role: "manager" });
    const oldTask = await Task.create({ title: "Dark mode for dashboard", createdBy: manager._id });
    const legacy = await Sprint.create({ name: "Demo sprint", tasks: [oldTask._id] });
    await restoreDemo({ now: NOW });
    assert.equal((await Task.findOne({ title: oldTask.title }))._id.toString(), oldTask._id.toString());
    assert.deepEqual(await Sprint.findById(legacy._id).lean(), legacy.toObject());
    assert.ok(await (await demo()).passwordMatches("keep"));
  });

  test("fails closed on mixed real/demo ownership without application writes", async () => {
    await restoreDemo({ now: NOW });
    const real = await signup();
    await Task.updateOne({ status: "open" }, { $set: { assignee: real.user._id } });
    const before = await snapshot();
    await assert.rejects(restoreDemo({ now: NOW }), /shared with non-demo/);
    assert.equal(await snapshot(), before);
  });

  test("shared reward redemptions and extra tasks in unowned sprints are protected", async () => {
    await restoreDemo({ now: NOW });
    const real = await signup();
    const reward = await Reward.findOne();
    const redemption = await Redemption.create({ worker: real.user._id, manager: (await demo())._id, reward: reward._id, rewardTitle: reward.title, cost: reward.cost });
    let before = await snapshot();
    await assert.rejects(restoreDemo({ now: NOW }), /shared with non-demo/);
    assert.equal(await snapshot(), before);
    await Redemption.deleteOne({ _id: redemption._id });
    const extra = await Task.create({ title: "Extra shared", createdBy: (await demo())._id });
    await Sprint.create({ name: "Real shared sprint", tasks: [extra._id] });
    before = await snapshot();
    await assert.rejects(restoreDemo({ now: NOW }), /shared with non-demo/);
    assert.equal(await snapshot(), before);
  });

  test("concurrent invocations serialize via the cross-instance lease", async () => {
    const results = await Promise.allSettled([restoreDemo({ now: NOW }), restoreDemo({ now: NOW }), restoreDemo({ now: NOW })]);
    assert.ok(results.some((r) => r.status === "fulfilled"));
    for (const r of results.filter((v) => v.status === "rejected")) assert.match(r.reason.message, /busy/);
    assert.equal(await Task.countDocuments(), 12);
    assert.equal(await CreditTransaction.countDocuments(), 8);
    assert.equal((await restoreDemo({ now: NOW })).reason, "unchanged");
  });

  test("an interrupted restore remains dirty and is repaired on retry", async () => {
    await restoreDemo({ now: NOW });
    await Task.deleteOne({});
    const original = Task.replaceOne;
    Task.replaceOne = async () => { throw new Error("simulated write failure"); };
    try { await assert.rejects(restoreDemo({ now: NOW }), /simulated write failure/); }
    finally { Task.replaceOne = original; }
    assert.equal((await restoreDemo({ now: NOW })).restored, true);
    assert.equal(await Task.countDocuments(), 12);
    assert.equal((await restoreDemo({ now: NOW })).reason, "unchanged");
  });

  test("hourly checks are due once per hour, skip clean data, and manual restoration is immediate", async () => {
    await restoreDemo({ now: NOW });
    assert.equal((await restoreDemo({ hourly: true, now: NOW })).reason, "unchanged");
    await Task.deleteOne({});
    assert.equal((await restoreDemo({ hourly: true, now: new Date(+NOW + 3599999) })).reason, "not-due");
    assert.equal(await Task.countDocuments(), 11);
    assert.equal((await restoreDemo({ hourly: true, now: new Date(+NOW + 3600000) })).restored, true);
    const before = await snapshot();
    assert.equal((await restoreDemo({ hourly: true, now: new Date(+NOW + 7200000) })).reason, "unchanged");
    assert.equal(await snapshot(), before);
    await Task.deleteOne({});
    assert.equal((await restoreDemo({ now: new Date(+NOW + 7200001) })).restored, true);
  });

  test("REST endpoint requires demo JWT plus explicit JSON confirmation, never account selectors", async () => {
    await restoreDemo({ now: NOW });
    const demoAuth = await auth();
    const real = await signup();
    await api().post("/api/restore").send({ confirm: true }).expect(401);
    await api().post("/api/restore").set(real.auth).send({ confirm: true }).expect(403);
    await api().post("/api/restore").set(demoAuth).send({}).expect(400);
    await api().post("/api/restore").set(demoAuth).send({ confirm: true, user: real.user._id }).expect(400);
    const before = await snapshot();
    await api().get("/api/restore").set(demoAuth).expect(200, { canRestore: true });
    assert.equal(await snapshot(), before);
    await Task.deleteOne({});
    await api().post("/api/restore").set(demoAuth).send({ confirm: true }).expect(200, { restored: true, reason: "restored" });
    // Existing JWTs survive restoration.
    await api().get("/api/me").set(demoAuth).expect(200);
  });

  test("scheduler requires its own server secret; JWTs do not grant scheduler access", async () => {
    await restoreDemo({ now: NOW });
    delete process.env.DEMO_RESTORE_SECRET;
    await api().post("/api/restore/hourly").expect(403);
    process.env.DEMO_RESTORE_SECRET = "test-secret";
    try {
      await api().post("/api/restore/hourly").set(await auth()).expect(401);
      await api().post("/api/restore/hourly").set("Authorization", "Bearer wrong").expect(401);
      await Task.deleteOne({});
      await api().post("/api/restore/hourly").set("Authorization", "Bearer test-secret").expect(200, { restored: true, reason: "restored" });
      await api().post("/api/restore/hourly").set("Authorization", "Bearer test-secret").expect(200, { restored: false, reason: "not-due" });
    } finally { delete process.env.DEMO_RESTORE_SECRET; }
  });

  test("demo mutations cannot interleave with a restore, while unrelated teams remain usable", async () => {
    await restoreDemo({ now: NOW });
    const demoAuth = await auth();
    const real = await signup({ role: "manager" });
    const lock = await acquireDemoLock();
    try {
      await api().post("/api/tasks").set(demoAuth).send({ title: "Blocked" }).expect(409);
      await api().post("/api/tasks").set(real.auth).send({ title: "Allowed" }).expect(201);
      await api().post("/api/restore").set(demoAuth).send({ confirm: true }).expect(409);
    } finally { await lock.release(); }
    await api().post("/api/tasks").set(demoAuth).send({ title: "Allowed again" }).expect(201);
  });

  test("public mutations cannot forge demo account identities or sprint ownership", async () => {
    await restoreDemo({ now: NOW });
    const real = await signup({ role: "manager" });
    await api().put(`/api/users/${real.user._id}`).set(real.auth).send({ email: ACCOUNTS[0][1] }).expect(403);
    const manager = await demo();
    const demoAuth = await auth();
    await api().put(`/api/users/${manager._id}`).set(demoAuth).send({ email: "changed@example.com" }).expect(403);
    const response = await api().post("/api/sprints").set(real.auth).send({ name: "Not demo", demoOwner: String(manager._id) }).expect(201);
    assert.equal(response.body.demoOwner, undefined);
    await User.deleteOne({ _id: manager._id });
    await api().post("/api/auth/register").send({ name: "Imposter", email: ACCOUNTS[0][1], password: "other", role: "manager" }).expect(403);
    await restoreDemo({ now: NOW });
    assert.equal((await demo())._id.toString(), manager._id.toString());
  });

  test("real-owned payouts to demo participants are preserved and use the same mutation lock", async () => {
    await restoreDemo({ now: NOW });
    const real = await signup({ role: "manager" });
    const worker = await User.findOne({ email: ACCOUNTS[1][1] });
    const task = await Task.create({ title: "Real manager task", createdBy: real.user._id, assignee: worker._id, status: "in review", reward: 25 });
    const lock = await acquireDemoLock();
    try {
      await api().post(`/api/tasks/${task._id}/approve`).set(real.auth).expect(409);
    } finally { await lock.release(); }
    await api().post(`/api/tasks/${task._id}/approve`).set(real.auth).expect(200);
    const before = await snapshot();
    await assert.rejects(restoreDemo({ now: NOW }), /shared with non-demo/);
    assert.equal(await snapshot(), before);
  });

  test("a fixture ID collision with real data never overwrites it", async () => {
    const { stableId } = require("../src/api/services/demoFixture");
    const real = await signup({ role: "manager" });
    await Task.create({ _id: stableId("Set up CI pipeline"), title: "Real content", createdBy: real.user._id });
    const before = await snapshot();
    await assert.rejects(restoreDemo({ now: NOW }), /shared with non-demo/);
    assert.equal(await snapshot(), before);
    assert.equal(await State.countDocuments(), 1);
  });
});
