/**
 * Demo data: a manager, three workers, an open market, task history, store
 * items, a redemption and penalties. Run with `npm run seed`.
 *
 * Only accounts on the @taskflow.demo domain (and their tasks, ledger,
 * penalties, rewards and redemptions) are replaced; other data is left alone.
 */
const mongoose = require("mongoose");
const db = require("./config/mongoose");
const User = require("./api/models/user.model");
const Task = require("./api/models/task.model");
const Sprint = require("./api/models/sprint.model");
const RefreshToken = require("./api/models/refreshToken.model");
const CreditTransaction = require("./api/models/creditTransaction.model");
const Penalty = require("./api/models/penalty.model");
const Reward = require("./api/models/reward.model");
const Redemption = require("./api/models/redemption.model");
const { payTaskReward, debit, recordSpend } = require("./api/services/credits");

const DEMO_EMAIL = /@taskflow\.demo$/;
const PASSWORD = "taskflow123";
const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY_MS);

async function removeDemoData() {
  const ids = (await User.find({ email: DEMO_EMAIL }).select("_id")).map((u) => u._id);
  const tasks = await Task.find({ $or: [{ createdBy: { $in: ids } }, { assignee: { $in: ids } }] }).select("_id");
  const taskIds = tasks.map((t) => t._id);
  await Promise.all([
    Sprint.updateMany({}, { $pull: { tasks: { $in: taskIds } } }),
    Task.deleteMany({ _id: { $in: taskIds } }),
    CreditTransaction.deleteMany({ user: { $in: ids } }),
    Penalty.deleteMany({ $or: [{ worker: { $in: ids } }, { issuedBy: { $in: ids } }] }),
    Reward.deleteMany({ createdBy: { $in: ids } }),
    Redemption.deleteMany({ $or: [{ worker: { $in: ids } }, { manager: { $in: ids } }] }),
    RefreshToken.deleteMany({ userId: { $in: ids } }),
  ]);
  await User.deleteMany({ _id: { $in: ids } });
}

/** Posts a task and walks it to `status`, approving it `approvedDaysAgo` days ago when done. */
async function seedTask(manager, data, { assignee, status = "open", approvedDaysAgo, reviewNote } = {}) {
  const created = daysAgo((approvedDaysAgo || 0) + 2);
  const task = await Task.create({ ...data, createdBy: manager._id, status: "open", created_at: created });
  if (status === "open") return task;

  task.assignee = assignee._id;
  task.claimedAt = daysAgo((approvedDaysAgo || 0) + 1);
  task.status = status;
  if (reviewNote) task.reviewNote = reviewNote;
  if (status === "in review" || status === "done") {
    task.submittedAt = daysAgo(approvedDaysAgo || 0);
    task.submissionNote = "Ready for review";
  }
  if (status === "done") task.approvedAt = daysAgo(approvedDaysAgo);
  await task.save();
  if (status === "done") await payTaskReward(task, task.approvedAt);
  return task;
}

async function seed() {
  await db.connect();
  mongoose.set("debug", false);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  await removeDemoData();

  const manager = await User.create({
    name: "Rohit Sharma",
    email: "rohit@taskflow.demo",
    password: PASSWORD,
    role: "manager",
  });
  const [asha, vikram, meera] = await Promise.all(
    [
      ["Asha Verma", "asha@taskflow.demo"],
      ["Vikram Singh", "vikram@taskflow.demo"],
      ["Meera Iyer", "meera@taskflow.demo"],
    ].map(([name, email]) => User.create({ name, email, password: PASSWORD, role: "worker", reportsTo: manager._id }))
  );

  // History, oldest approval first so streaks build up.
  await seedTask(manager, { title: "Set up CI pipeline", type: "feature", reward: 150 }, { assignee: asha, status: "done", approvedDaysAgo: 9 });
  await seedTask(manager, { title: "Fix flaky login test", type: "bug", reward: 60 }, { assignee: vikram, status: "done", approvedDaysAgo: 5 });
  await seedTask(manager, { title: "Write onboarding guide", type: "story", reward: 90 }, { assignee: asha, status: "done", approvedDaysAgo: 2 });
  await seedTask(manager, { title: "Dark mode for dashboard", type: "feature", reward: 120 }, { assignee: asha, status: "done", approvedDaysAgo: 1 });
  await seedTask(manager, { title: "Sprint burndown chart", type: "feature", reward: 200 }, { assignee: meera, status: "done", approvedDaysAgo: 0 });
  await seedTask(manager, { title: "Fix date picker timezone", type: "bug", reward: 70 }, { assignee: vikram, status: "in review" });
  await seedTask(
    manager,
    { title: "Improve search relevance", type: "story", reward: 110 },
    { assignee: meera, status: "in progress", reviewNote: "Please add tests for empty queries" }
  );

  // Open market.
  await Task.create(
    [
      { title: "Add CSV export to reports", type: "feature", reward: 80, description: "Managers want to download sprint reports." },
      { title: "Crash when sprint has no tasks", type: "bug", reward: 50, description: "Opening an empty sprint throws." },
      { title: "Keyboard shortcuts for the board", type: "story", reward: 100 },
      { title: "Audit npm dependencies", type: "bug", reward: 40 },
      { title: "Profile page avatars", type: "feature", reward: 70 },
    ].map((task) => ({ ...task, createdBy: manager._id, status: "open" }))
  );

  // Store.
  const [, , ticket, coffee] = await Reward.create([
    {
      title: "Join a special weekend with Rohit sir",
      description: "A weekend outing with the team lead. Limited seats.",
      cost: 500,
      stock: 2,
      createdBy: manager._id,
    },
    {
      title: "Skip a boring festival",
      description: "Sit out one office festival of your choice, no questions asked.",
      cost: 250,
      createdBy: manager._id,
    },
    {
      title: "Event ticket: DevFest 2026",
      description: "One pass to the city's developer conference.",
      cost: 300,
      stock: 5,
      createdBy: manager._id,
    },
    { title: "Coffee with the team", description: "Team buys you coffee.", cost: 50, createdBy: manager._id },
  ]);

  // Asha already got an event ticket, Meera's coffee is waiting to be fulfilled.
  for (const [worker, reward, status] of [
    [asha, ticket, "fulfilled"],
    [meera, coffee, "pending"],
  ]) {
    const redemptionId = new mongoose.Types.ObjectId();
    await debit(worker._id, reward.cost);
    if (reward.stock !== null) await Reward.updateOne({ _id: reward._id }, { $inc: { stock: -1 } });
    await recordSpend({ user: worker._id, cost: reward.cost, kind: "reward_redeem", ref: redemptionId, note: `Redeemed: ${reward.title}` });
    await Redemption.create({
      _id: redemptionId,
      worker: worker._id,
      reward: reward._id,
      rewardTitle: reward.title,
      manager: manager._id,
      cost: reward.cost,
      status,
      fulfilledAt: status === "fulfilled" ? new Date() : undefined,
    });
  }

  // Penalties: Vikram has one to clear, Meera already paid one off.
  await Penalty.create({ worker: vikram._id, issuedBy: manager._id, reason: "Missed the sprint demo", cost: 40 });
  const paid = await Penalty.create({
    worker: meera._id,
    issuedBy: manager._id,
    reason: "Pushed directly to main",
    cost: 30,
    status: "cleared",
    clearedAt: new Date(),
  });
  await debit(meera._id, paid.cost);
  await recordSpend({ user: meera._id, cost: paid.cost, kind: "penalty_clear", ref: paid._id, note: `Penalty cleared: ${paid.reason}` });

  console.log("Seeded demo data. Log in with password", PASSWORD);
  console.log("  manager: rohit@taskflow.demo");
  console.log("  workers: asha@taskflow.demo, vikram@taskflow.demo, meera@taskflow.demo");
}

seed()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
  });
