// The established seed dataset, built without database writes. IDs and dates are
// supplied by the restore service so unchanged data stays byte-for-byte stable.
const mongoose = require("mongoose");
const { createHash } = require("node:crypto");
const { levelForXp, nextStreak } = require("../utils/gamification");
const User = require("../models/user.model");
const Task = require("../models/task.model");
const Reward = require("../models/reward.model");
const Penalty = require("../models/penalty.model");
const Redemption = require("../models/redemption.model");
const CreditTransaction = require("../models/creditTransaction.model");
const Sprint = require("../models/sprint.model");

const ACCOUNTS = [
  ["Rohit Sharma", "rohit@taskflow.demo", "manager"],
  ["Asha Verma", "asha@taskflow.demo", "worker"],
  ["Vikram Singh", "vikram@taskflow.demo", "worker"],
  ["Meera Iyer", "meera@taskflow.demo", "worker"],
];
const stableId = (key) => new mongoose.Types.ObjectId(createHash("sha256").update(`taskflow-demo-v1:${key}`).digest("hex").slice(0, 24));

function buildFixture(ids, at, taskIds = {}) {
  const rows = { User: [], Task: [], Reward: [], Penalty: [], Redemption: [], CreditTransaction: [], Sprint: [] };
  const daysAgo = (n) => new Date(at.getTime() - n * 86400000);
  const add = (Model, key, data) => {
    const doc = new Model({ _id: stableId(key), ...data });
    // Explicit timestamps: model defaults must not make each check dirty.
    for (const field of ["created_at", "updated_at", "createdAt", "updatedAt"]) {
      if (Model.schema.path(field) && data[field] === undefined) doc.set(field, at);
    }
    const raw = doc.toObject();
    rows[Model.modelName].push(raw);
    return raw;
  };
  const [manager, asha, vikram, meera] = ACCOUNTS.map(([name, email, role], i) => add(User, email, {
    _id: ids[i], name, email, role, reportsTo: i ? ids[0] : null,
  }));
  const ledger = (user, amount, kind, ref, note, createdAt = at) => {
    add(CreditTransaction, `${kind}:${ref}`, { user: user._id, amount, kind, ref, note, createdAt });
    user.credits += amount;
  };
  const task = (title, type, reward, assignee, status = "open", ago = 0, extra = {}) => {
    const doc = add(Task, title, {
      _id: taskIds[title] || stableId(title), title, type, reward, createdBy: manager._id, status,
      created_at: daysAgo(ago + 2), ...extra,
      ...(assignee ? { assignee: assignee._id, claimedAt: daysAgo(ago + 1) } : {}),
      ...(["in review", "done"].includes(status) ? { submittedAt: daysAgo(ago), submissionNote: "Ready for review" } : {}),
      ...(status === "done" ? { approvedAt: daysAgo(ago) } : {}),
    });
    if (status === "done") {
      ledger(assignee, reward, "task_reward", doc._id, `Task approved: ${title}`, doc.approvedAt);
      assignee.xp += reward;
      assignee.level = levelForXp(assignee.xp);
      assignee.streak = nextStreak(assignee.streak, assignee.lastApprovedAt, doc.approvedAt);
      assignee.lastApprovedAt = doc.approvedAt;
    }
    return doc;
  };
  task("Set up CI pipeline", "feature", 150, asha, "done", 9);
  task("Fix flaky login test", "bug", 60, vikram, "done", 5);
  task("Write onboarding guide", "story", 90, asha, "done", 2);
  const darkMode = task("Dark mode for dashboard", "feature", 120, asha, "done", 1);
  const burndown = task("Sprint burndown chart", "feature", 200, meera, "done");
  const datePicker = task("Fix date picker timezone", "bug", 70, vikram, "in review");
  const search = task("Improve search relevance", "story", 110, meera, "in progress", 0, { reviewNote: "Please add tests for empty queries" });
  const csvExport = task("Add CSV export to reports", "feature", 80, null, "open", 0, { description: "Managers want to download sprint reports." });
  const emptySprint = task("Crash when sprint has no tasks", "bug", 50, null, "open", 0, { description: "Opening an empty sprint throws." });
  task("Keyboard shortcuts for the board", "story", 100);
  task("Audit npm dependencies", "bug", 40);
  task("Profile page avatars", "feature", 70);
  add(Sprint, "sprint", {
    name: "Demo sprint", demoOwner: manager._id, startDate: daysAgo(3), endDate: daysAgo(-11),
    tasks: [darkMode, burndown, datePicker, search, csvExport, emptySprint].map((t) => t._id),
  });
  const reward = (title, description, cost, stock = null) => add(Reward, title, { title, description, cost, stock, createdBy: manager._id });
  reward("Join a special weekend with Rohit sir", "A weekend outing with the team lead. Limited seats.", 500, 2);
  reward("Skip a boring festival", "Sit out one office festival of your choice, no questions asked.", 250);
  const ticket = reward("Event ticket: DevFest 2026", "One pass to the city's developer conference.", 300, 4);
  const coffee = reward("Coffee with the team", "Team buys you coffee.", 50);
  for (const [worker, item, status] of [[asha, ticket, "fulfilled"], [meera, coffee, "pending"]]) {
    const redemption = add(Redemption, `redeem:${item.title}`, {
      worker: worker._id, reward: item._id, rewardTitle: item.title, manager: manager._id,
      cost: item.cost, status, ...(status === "fulfilled" ? { fulfilledAt: at } : {}),
    });
    ledger(worker, -item.cost, "reward_redeem", redemption._id, `Redeemed: ${item.title}`);
  }
  add(Penalty, "active penalty", { worker: vikram._id, issuedBy: manager._id, reason: "Missed the sprint demo", cost: 40 });
  const paid = add(Penalty, "cleared penalty", {
    worker: meera._id, issuedBy: manager._id, reason: "Pushed directly to main", cost: 30, status: "cleared", clearedAt: at,
  });
  ledger(meera, -paid.cost, "penalty_clear", paid._id, `Penalty cleared: ${paid.reason}`);
  // Credentials and account creation timestamps are deliberately not fixture data.
  rows.User.forEach((u) => { delete u.password; delete u.created_at; delete u.updated_at; });
  return rows;
}

module.exports = { ACCOUNTS, stableId, buildFixture };
