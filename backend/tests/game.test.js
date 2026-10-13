require("./env");
const { describe, test, before, after, beforeEach } = require("node:test");
const { expect } = require("expect");
const CreditTransaction = require("../src/api/models/creditTransaction.model");
const Reward = require("../src/api/models/reward.model");
const Redemption = require("../src/api/models/redemption.model");
const Penalty = require("../src/api/models/penalty.model");
const Task = require("../src/api/models/task.model");
const User = require("../src/api/models/user.model");
const {
  startDb,
  stopDb,
  clearDb,
  api,
  signup,
  team,
  postTask,
  completeTask,
  setCredits,
  credits,
} = require("./helpers");

before(startDb);
after(stopDb);
beforeEach(clearDb);

/** Makes `model[method]` reject once with a simulated database error, then restores it. */
function failOnce(model, method) {
  const original = model[method];
  model[method] = function failing() {
    model[method] = original;
    return Promise.reject(new Error("simulated database failure"));
  };
  return () => {
    model[method] = original;
  };
}

describe("auth and profile", () => {
  test("signup picker lists managers with id and name only, without a token", async () => {
    const { manager } = await team(1);
    const res = await api().get("/api/users/managers").expect(200);
    expect(res.body).toEqual([{ _id: manager.user._id, name: manager.user.name }]);
  });

  test("signup stores role and manager, ignores game stats, and never returns the password", async () => {
    const manager = await signup({ role: "manager" });
    const res = await api()
      .post("/api/auth/register")
      .send({
        name: "Sneaky",
        email: "sneaky@test.dev",
        password: "password123",
        role: "worker",
        reportsTo: manager.user._id,
        credits: 9999,
        xp: 9999,
      })
      .expect(201);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.role).toBe("worker");
    expect(res.body.user.reportsTo).toBe(manager.user._id);
    expect(res.body.user.credits).toBe(0);
    expect(res.body.user.xp).toBe(0);
  });

  test("signup rejects a reportsTo that is not a manager", async () => {
    const { workers } = await team(1);
    const res = await api()
      .post("/api/auth/register")
      .send({ name: "W", email: "w@test.dev", password: "password123", reportsTo: workers[0].user._id })
      .expect(400);
    expect(res.body.message).toMatch(/manager/);
  });

  test("protected routes need a JWT and answer with a JSON message", async () => {
    const res = await api().get("/api/me").expect(401);
    expect(res.body).toEqual({ message: "Unauthorized" });
    await api().get("/api/users").expect(401);
    await api().get("/api/tasks").expect(401);
  });

  test("login with a wrong password is a 401 JSON error", async () => {
    const { manager } = await team(0);
    const res = await api()
      .post("/api/auth/login")
      .send({ email: manager.user.email, password: "nope" })
      .expect(401);
    expect(res.body.message).toBe("Incorrect email or password");
  });

  test("GET /me returns role, stats and manager", async () => {
    const { manager, workers } = await team(1);
    const res = await api().get("/api/me").set(workers[0].auth).expect(200);
    expect(res.body).toMatchObject({
      role: "worker",
      credits: 0,
      xp: 0,
      level: 1,
      streak: 0,
      manager: { _id: manager.user._id, name: manager.user.name },
    });
    expect(res.body.password).toBeUndefined();
  });

  test("user listings never include password hashes", async () => {
    const { workers } = await team(2);
    const res = await api().get("/api/users").set(workers[0].auth).expect(200);
    expect(res.body.length).toBe(3);
    res.body.forEach((u) => expect(u.password).toBeUndefined());
  });
});

describe("market lifecycle", () => {
  test("claim -> submit -> approve pays credits and XP once and records the ledger", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const task = await postTask(manager, { reward: 120 });
    expect(task.status).toBe("open");

    const market = await api().get("/api/market").set(worker.auth).expect(200);
    expect(market.body.map((t) => t._id)).toEqual([task._id]);

    const claimed = await api().post(`/api/tasks/${task._id}/claim`).set(worker.auth).expect(200);
    expect(claimed.body).toMatchObject({ status: "in progress", assignee: worker.user._id });
    expect((await api().get("/api/market").set(worker.auth)).body).toEqual([]);

    // No pay before approval.
    await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).send({ note: "PR is up" }).expect(200);
    expect(await credits(worker)).toBe(0);

    const queue = await api().get("/api/tasks/review").set(manager.auth).expect(200);
    expect(queue.body.map((t) => t._id)).toEqual([task._id]);

    const approved = await api().post(`/api/tasks/${task._id}/approve`).set(manager.auth).expect(200);
    expect(approved.body.status).toBe("done");

    const me = await api().get("/api/me").set(worker.auth).expect(200);
    expect(me.body).toMatchObject({ credits: 120, xp: 120, level: 2, streak: 1 });

    const wallet = await api().get("/api/wallet").set(worker.auth).expect(200);
    expect(wallet.body.balance).toBe(120);
    expect(wallet.body.transactions).toHaveLength(1);
    expect(wallet.body.transactions[0]).toMatchObject({ amount: 120, kind: "task_reward", ref: task._id });

    const mine = await api().get("/api/tasks/mine").set(worker.auth).expect(200);
    expect(mine.body.map((t) => t.status)).toEqual(["done"]);
  });

  test("approving twice does not pay twice, even concurrently", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const task = await postTask(manager, { reward: 40 });
    await api().post(`/api/tasks/${task._id}/claim`).set(worker.auth).expect(200);
    await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).expect(200);

    const results = await Promise.all(
      [1, 2, 3].map(() => api().post(`/api/tasks/${task._id}/approve`).set(manager.auth))
    );
    expect(results.map((r) => r.status).sort()).toEqual([200, 409, 409]);

    const again = await api().post(`/api/tasks/${task._id}/approve`).set(manager.auth).expect(409);
    expect(again.body.message).toBe("Task is not awaiting review");

    expect(await credits(worker)).toBe(40);
    expect(await CreditTransaction.countDocuments({ user: worker.user._id })).toBe(1);
  });

  test("only one worker can claim a task", async () => {
    const { manager, workers } = await team(2);
    const task = await postTask(manager);
    const results = await Promise.all(workers.map((w) => api().post(`/api/tasks/${task._id}/claim`).set(w.auth)));
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  });

  test("reject sends work back with a required note", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const task = await postTask(manager);
    await api().post(`/api/tasks/${task._id}/claim`).set(worker.auth).expect(200);
    await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).expect(200);

    await api().post(`/api/tasks/${task._id}/reject`).set(manager.auth).send({}).expect(400);
    const rejected = await api()
      .post(`/api/tasks/${task._id}/reject`)
      .set(manager.auth)
      .send({ note: "Add tests" })
      .expect(200);
    expect(rejected.body).toMatchObject({ status: "in progress", reviewNote: "Add tests" });
    expect(await credits(worker)).toBe(0);

    await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).expect(200);
    const approved = await api().post(`/api/tasks/${task._id}/approve`).set(manager.auth).expect(200);
    expect(approved.body.reviewNote).toBeUndefined();
  });

  test("submitting a task that is not in progress is a conflict", async () => {
    const { manager, workers } = await team(1);
    const task = await postTask(manager);
    await api().post(`/api/tasks/${task._id}/claim`).set(workers[0].auth).expect(200);
    await api().post(`/api/tasks/${task._id}/submit`).set(workers[0].auth).expect(200);
    await api().post(`/api/tasks/${task._id}/submit`).set(workers[0].auth).expect(409);
  });

  test("market tasks cannot skip the lifecycle through the generic task routes", async () => {
    const { manager, workers } = await team(1);
    const task = await postTask(manager);
    await api().post(`/api/tasks/status/${task._id}`).set(manager.auth).send({ status: "done" }).expect(409);
    await api().patch(`/api/tasks/${task._id}`).set(workers[0].auth).send({ title: "mine" }).expect(403);
    await api()
      .post(`/api/tasks/assignee/${workers[0].user._id}/${task._id}`)
      .set(manager.auth)
      .expect(409);
  });

  test("a claimed or in-review market task cannot be deleted or have its reward changed", async () => {
    const { manager, workers } = await team(1);
    const task = await postTask(manager, { reward: 50 });
    await api().post(`/api/tasks/${task._id}/claim`).set(workers[0].auth).expect(200);
    for (const step of ["claimed", "submitted"]) {
      if (step === "submitted") {
        await api().post(`/api/tasks/${task._id}/submit`).set(workers[0].auth).send({ note: "done" }).expect(200);
      }
      await api().patch(`/api/tasks/${task._id}`).set(manager.auth).send({ reward: 5 }).expect(409);
      await api().delete(`/api/tasks/${task._id}`).set(manager.auth).expect(409);
      const stored = await Task.findById(task._id);
      expect(stored.reward).toBe(50);
      expect(String(stored.assignee)).toBe(workers[0].user._id);
    }
  });

  test("an open market task can still be edited and deleted by its manager", async () => {
    const { manager } = await team(0);
    const task = await postTask(manager, { reward: 50 });
    const edited = await api().patch(`/api/tasks/${task._id}`).set(manager.auth).send({ reward: 80 }).expect(200);
    expect(edited.body.reward).toBe(80);
    await api().delete(`/api/tasks/${task._id}`).set(manager.auth).expect(200);
    expect(await Task.findById(task._id)).toBeNull();
  });

  test("invalid ids and validation failures are 400 JSON errors", async () => {
    const { manager } = await team(0);
    const bad = await api().post("/api/tasks/not-an-id/approve").set(manager.auth).expect(400);
    expect(bad.body.message).toMatch(/Invalid _id/);
    const negative = await api().post("/api/tasks").set(manager.auth).send({ title: "x", reward: -5 }).expect(400);
    expect(negative.body.message).toBeTruthy();
  });
});

describe("store and redemptions", () => {
  async function stockReward(manager, body = {}) {
    const res = await api()
      .post("/api/rewards")
      .set(manager.auth)
      .send({ title: "Skip a boring festival", cost: 80, ...body })
      .expect(201);
    return res.body;
  }

  test("redeeming with too few credits fails and changes nothing", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const reward = await stockReward(manager, { cost: 80, stock: 2 });
    await setCredits(worker, 50);

    const res = await api().post(`/api/rewards/${reward._id}/redeem`).set(worker.auth).expect(409);
    expect(res.body.message).toBe("Insufficient credits");
    expect(await credits(worker)).toBe(50);
    expect((await Reward.findById(reward._id)).stock).toBe(2);
    expect(await CreditTransaction.countDocuments()).toBe(0);
  });

  test("redeeming debits the wallet, uses stock, and the manager fulfills it", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const reward = await stockReward(manager, { cost: 80, stock: 1 });
    await completeTask(manager, worker, { reward: 100 });

    const redeemed = await api().post(`/api/rewards/${reward._id}/redeem`).set(worker.auth).expect(201);
    expect(redeemed.body).toMatchObject({ status: "pending", cost: 80, rewardTitle: "Skip a boring festival" });

    const wallet = await api().get("/api/wallet").set(worker.auth).expect(200);
    expect(wallet.body).toMatchObject({ balance: 20, earned: 100, spent: 80 });
    expect(wallet.body.transactions[0]).toMatchObject({ amount: -80, kind: "reward_redeem", ref: redeemed.body._id });

    // Out of stock now.
    await setCredits(worker, 500);
    const out = await api().post(`/api/rewards/${reward._id}/redeem`).set(worker.auth).expect(409);
    expect(out.body.message).toBe("This reward is out of stock");

    const teamRedemptions = await api().get("/api/redemptions").set(manager.auth).expect(200);
    expect(teamRedemptions.body).toHaveLength(1);
    await api().post(`/api/redemptions/${redeemed.body._id}/fulfill`).set(worker.auth).expect(403);
    const fulfilled = await api()
      .post(`/api/redemptions/${redeemed.body._id}/fulfill`)
      .set(manager.auth)
      .expect(200);
    expect(fulfilled.body.status).toBe("fulfilled");
    await api().post(`/api/redemptions/${redeemed.body._id}/fulfill`).set(manager.auth).expect(409);
  });

  test("concurrent redemptions never take the balance below zero", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const reward = await stockReward(manager, { cost: 80 });
    await setCredits(worker, 100);

    const results = await Promise.all(
      [1, 2, 3].map(() => api().post(`/api/rewards/${reward._id}/redeem`).set(worker.auth))
    );
    expect(results.map((r) => r.status).sort()).toEqual([201, 409, 409]);
    expect(await credits(worker)).toBe(20);
  });

  test("workers only see and redeem their own manager's active rewards", async () => {
    const { manager, workers } = await team(1);
    const other = await team(1);
    const reward = await stockReward(manager);
    await stockReward(manager, { title: "Hidden", active: false });

    const list = await api().get("/api/rewards").set(workers[0].auth).expect(200);
    expect(list.body.map((r) => r.title)).toEqual(["Skip a boring festival"]);
    expect((await api().get("/api/rewards").set(manager.auth)).body).toHaveLength(2);
    expect((await api().get("/api/rewards").set(other.workers[0].auth)).body).toEqual([]);

    await setCredits(other.workers[0], 500);
    await api().post(`/api/rewards/${reward._id}/redeem`).set(other.workers[0].auth).expect(403);
  });

  test("managers edit and delete only their own rewards", async () => {
    const { manager } = await team(0);
    const other = await team(0);
    const reward = await stockReward(manager);
    await api().patch(`/api/rewards/${reward._id}`).set(other.manager.auth).send({ cost: 1 }).expect(403);
    const updated = await api().patch(`/api/rewards/${reward._id}`).set(manager.auth).send({ cost: 90 }).expect(200);
    expect(updated.body.cost).toBe(90);
    await api().delete(`/api/rewards/${reward._id}`).set(manager.auth).expect(200);
    await api().delete(`/api/rewards/${reward._id}`).set(manager.auth).expect(404);
  });
});

describe("penalties", () => {
  test("a worker pays a penalty's cost to clear it, once", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    await setCredits(worker, 100);
    const issued = await api()
      .post("/api/penalties")
      .set(manager.auth)
      .send({ worker: worker.user._id, reason: "Missed standup", cost: 30 })
      .expect(201);
    expect(issued.body.status).toBe("active");

    const mine = await api().get("/api/penalties").set(worker.auth).expect(200);
    expect(mine.body.map((p) => p._id)).toEqual([issued.body._id]);

    const cleared = await api().post(`/api/penalties/${issued.body._id}/clear`).set(worker.auth).expect(200);
    expect(cleared.body.status).toBe("cleared");
    expect(await credits(worker)).toBe(70);
    const entry = await CreditTransaction.findOne({ kind: "penalty_clear" });
    expect(entry).toMatchObject({ amount: -30 });

    await api().post(`/api/penalties/${issued.body._id}/clear`).set(worker.auth).expect(409);
    expect(await credits(worker)).toBe(70);
  });

  test("clearing a penalty without enough credits fails and keeps it active", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    await setCredits(worker, 10);
    const issued = await api()
      .post("/api/penalties")
      .set(manager.auth)
      .send({ worker: worker.user._id, reason: "Broke the build", cost: 30 })
      .expect(201);
    const res = await api().post(`/api/penalties/${issued.body._id}/clear`).set(worker.auth).expect(409);
    expect(res.body.message).toBe("Insufficient credits");
    expect(await credits(worker)).toBe(10);
    const list = await api().get("/api/penalties").set(manager.auth).expect(200);
    expect(list.body[0].status).toBe("active");
  });

  test("managers can only penalise their own team and workers only clear their own", async () => {
    const { manager, workers } = await team(2);
    const other = await team(1);
    await api()
      .post("/api/penalties")
      .set(manager.auth)
      .send({ worker: other.workers[0].user._id, reason: "Nope", cost: 5 })
      .expect(404);
    const issued = await api()
      .post("/api/penalties")
      .set(manager.auth)
      .send({ worker: workers[0].user._id, reason: "Late", cost: 5 })
      .expect(201);
    await setCredits(workers[1], 100);
    await api().post(`/api/penalties/${issued.body._id}/clear`).set(workers[1].auth).expect(403);
  });
});

describe("role checks", () => {
  test("workers cannot use manager endpoints", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const task = await postTask(manager);
    await api().post(`/api/tasks/${task._id}/claim`).set(worker.auth).expect(200);
    await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).expect(200);

    const forbidden = await api().post("/api/tasks").set(worker.auth).send({ title: "x", reward: 5 }).expect(403);
    expect(forbidden.body.message).toBe("Only managers can do this");
    await api().post(`/api/tasks/${task._id}/approve`).set(worker.auth).expect(403);
    await api().post(`/api/tasks/${task._id}/reject`).set(worker.auth).send({ note: "x" }).expect(403);
    await api().get("/api/tasks/review").set(worker.auth).expect(403);
    await api().get("/api/users/team").set(worker.auth).expect(403);
    await api().post("/api/rewards").set(worker.auth).send({ title: "x", cost: 1 }).expect(403);
    await api()
      .post("/api/penalties")
      .set(worker.auth)
      .send({ worker: worker.user._id, reason: "x", cost: 1 })
      .expect(403);
    expect(await credits(worker)).toBe(0);
  });

  test("managers cannot use worker endpoints", async () => {
    const { manager } = await team(0);
    const task = await postTask(manager);
    const res = await api().post(`/api/tasks/${task._id}/claim`).set(manager.auth).expect(403);
    expect(res.body.message).toBe("Only workers can do this");
  });

  test("another manager cannot approve a task they did not post", async () => {
    const { manager, workers } = await team(1);
    const other = await team(0);
    const task = await postTask(manager);
    await api().post(`/api/tasks/${task._id}/claim`).set(workers[0].auth).expect(200);
    await api().post(`/api/tasks/${task._id}/submit`).set(workers[0].auth).expect(200);
    await api().post(`/api/tasks/${task._id}/approve`).set(other.manager.auth).expect(403);
  });

  test("workers cannot claim from another team's market", async () => {
    const { manager } = await team(0);
    const other = await team(1);
    const task = await postTask(manager);
    expect((await api().get("/api/market").set(other.workers[0].auth)).body).toEqual([]);
    await api().post(`/api/tasks/${task._id}/claim`).set(other.workers[0].auth).expect(403);
  });
});

describe("team and leaderboard", () => {
  test("the manager's team view lists reports with stats", async () => {
    const { manager, workers } = await team(2);
    await completeTask(manager, workers[0], { reward: 30 });
    const res = await api().get("/api/users/team").set(manager.auth).expect(200);
    const first = res.body.find((m) => m._id === workers[0].user._id);
    expect(first).toMatchObject({ credits: 30, xp: 30, tasksDone: 1, activePenalties: 0 });
    expect(first.password).toBeUndefined();
  });

  test("leaderboard ranks the team by credits earned, all time and this week", async () => {
    const { manager, workers } = await team(3);
    const other = await team(1);
    await completeTask(manager, workers[0], { reward: 30 });
    await completeTask(manager, workers[1], { reward: 90 });
    await completeTask(other.manager, other.workers[0], { reward: 500 });

    // An old reward only counts all time.
    await CreditTransaction.create({
      user: workers[0].user._id,
      amount: 100,
      kind: "task_reward",
      ref: workers[0].user._id,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });
    await User.updateOne({ _id: workers[0].user._id }, { $inc: { xp: 100, credits: 100 } });

    const all = await api().get("/api/leaderboard?period=all").set(workers[2].auth).expect(200);
    expect(all.body.period).toBe("all");
    expect(all.body.entries.map((e) => [e.rank, e.user.name, e.points])).toEqual([
      [1, workers[0].user.name, 130],
      [2, workers[1].user.name, 90],
      [3, workers[2].user.name, 0],
    ]);

    const week = await api().get("/api/leaderboard?period=week").set(manager.auth).expect(200);
    expect(week.body.entries.map((e) => [e.user.name, e.points])).toEqual([
      [workers[1].user.name, 90],
      [workers[0].user.name, 30],
      [workers[2].user.name, 0],
    ]);

    await api().get("/api/leaderboard?period=year").set(manager.auth).expect(400);
  });
});

describe("team scoping of board endpoints", () => {
  test("users, tasks and searches only show the caller's team", async () => {
    const { manager, workers } = await team(1);
    const other = await team(1);
    const ours = await postTask(manager, { title: "Our task" });
    const theirs = await postTask(other.manager, { title: "Their task" });
    // A legacy task (no createdBy) assigned in the other team.
    const legacy = await Task.create({ title: "Their legacy task", assignee: other.workers[0].user._id });

    for (const viewer of [manager, workers[0]]) {
      const users = await api().get("/api/users").set(viewer.auth).expect(200);
      expect(users.body.map((u) => u._id).sort()).toEqual([manager.user._id, workers[0].user._id].sort());
      users.body.forEach((u) => expect(u.password).toBeUndefined());
      await api().get(`/api/users/${other.workers[0].user._id}`).set(viewer.auth).expect(404);
      await api().get(`/api/users/${workers[0].user._id}`).set(viewer.auth).expect(200);
      const found = await api().get(`/api/users/search?name=${encodeURIComponent(other.workers[0].user.name)}`).set(viewer.auth).expect(200);
      expect(found.body).toEqual([]);

      const tasks = await api().get("/api/tasks").set(viewer.auth).expect(200);
      expect(tasks.body.map((t) => t._id)).toEqual([ours._id]);
      await api().get(`/api/tasks/${theirs._id}`).set(viewer.auth).expect(404);
      await api().get(`/api/tasks/${legacy._id}`).set(viewer.auth).expect(404);
      await api().get(`/api/tasks/${ours._id}`).set(viewer.auth).expect(200);
      const byUser = await api().get(`/api/tasks/user/${other.workers[0].user._id}`).set(viewer.auth).expect(200);
      expect(byUser.body).toEqual([]);
      const search = await api().get("/api/tasks/search?name=task").set(viewer.auth).expect(200);
      expect(search.body.map((t) => t._id)).toEqual([ours._id]);
    }

    const theirView = await api().get("/api/tasks").set(other.workers[0].auth).expect(200);
    expect(theirView.body.map((t) => t._id).sort()).toEqual([theirs._id, String(legacy._id)].sort());
  });

  test("board edits cannot reach another team's tasks", async () => {
    const { manager } = await team(1);
    const other = await team(1);
    const legacy = await Task.create({ title: "Their legacy task", assignee: other.workers[0].user._id });
    await api().patch(`/api/tasks/${legacy._id}`).set(manager.auth).send({ title: "hijacked" }).expect(404);
    await api().post(`/api/tasks/status/${legacy._id}`).set(manager.auth).send({ status: "closed" }).expect(404);
    await api().delete(`/api/tasks/${legacy._id}`).set(manager.auth).expect(404);
    expect((await Task.findById(legacy._id)).title).toBe("Their legacy task");
  });
  test("legacy tasks cannot be reassigned to another team", async () => {
    const { manager, workers } = await team(2);
    const other = await team(1);
    const legacy = await Task.create({ title: "Our legacy task", assignee: workers[0].user._id });
    for (const send of [
      (r) => r.patch(`/api/tasks/${legacy._id}`).send({ assignee: other.workers[0].user._id }),
      (r) => r.post(`/api/tasks/assignee/${other.workers[0].user._id}/${legacy._id}`),
    ]) {
      const res = await send(api()).set(manager.auth).expect(404);
      expect(res.body.message).toBe("User not found in your team");
    }
    expect(String((await Task.findById(legacy._id)).assignee)).toBe(workers[0].user._id);
    await api().get(`/api/tasks/${legacy._id}`).set(other.workers[0].auth).expect(404);

    const moved = await api().patch(`/api/tasks/${legacy._id}`).set(workers[0].auth).send({ assignee: workers[1].user._id }).expect(200);
    expect(moved.body.assignee).toBe(workers[1].user._id);
  });
});

describe("failure recovery", () => {
  test("a failed payout leaves the task in review with nothing paid, and approval can be retried", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const task = await postTask(manager, { reward: 70 });
    await api().post(`/api/tasks/${task._id}/claim`).set(worker.auth).expect(200);
    await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).expect(200);

    const restore = failOnce(User, "updateOne");
    try {
      await api().post(`/api/tasks/${task._id}/approve`).set(manager.auth).expect(500);
    } finally {
      restore();
    }
    expect((await Task.findById(task._id)).status).toBe("in review");
    expect(await CreditTransaction.countDocuments()).toBe(0);
    expect(await credits(worker)).toBe(0);

    await api().post(`/api/tasks/${task._id}/approve`).set(manager.auth).expect(200);
    expect(await credits(worker)).toBe(70);
    expect(await CreditTransaction.countDocuments()).toBe(1);
  });

  test("concurrent approvals for one worker add up XP, level and credits exactly", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const tasks = [];
    for (let i = 0; i < 4; i += 1) {
      const task = await postTask(manager, { reward: 50 });
      await api().post(`/api/tasks/${task._id}/claim`).set(worker.auth).expect(200);
      await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).expect(200);
      tasks.push(task);
    }
    const results = await Promise.all(tasks.map((t) => api().post(`/api/tasks/${t._id}/approve`).set(manager.auth)));
    expect(results.map((r) => r.status)).toEqual([200, 200, 200, 200]);
    const me = await api().get("/api/me").set(worker.auth).expect(200);
    expect(me.body).toMatchObject({ credits: 200, xp: 200, level: 2, streak: 1 });
  });

  test("a failed penalty ledger write refunds the credits and keeps the penalty active", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    await setCredits(worker, 100);
    const issued = await api()
      .post("/api/penalties")
      .set(manager.auth)
      .send({ worker: worker.user._id, reason: "Late", cost: 30 })
      .expect(201);

    const restore = failOnce(CreditTransaction, "create");
    try {
      await api().post(`/api/penalties/${issued.body._id}/clear`).set(worker.auth).expect(500);
    } finally {
      restore();
    }
    expect(await credits(worker)).toBe(100);
    expect((await Penalty.findById(issued.body._id)).status).toBe("active");

    await api().post(`/api/penalties/${issued.body._id}/clear`).set(worker.auth).expect(200);
    expect(await credits(worker)).toBe(70);
  });

  test("a failed redemption write refunds credits, restores stock and drops the ledger entry", async () => {
    const { manager, workers } = await team(1);
    const [worker] = workers;
    const reward = await api()
      .post("/api/rewards")
      .set(manager.auth)
      .send({ title: "Event ticket", cost: 40, stock: 1 })
      .expect(201);
    await setCredits(worker, 100);

    const restore = failOnce(Redemption, "create");
    try {
      await api().post(`/api/rewards/${reward.body._id}/redeem`).set(worker.auth).expect(500);
    } finally {
      restore();
    }
    expect(await credits(worker)).toBe(100);
    expect((await Reward.findById(reward.body._id)).stock).toBe(1);
    expect(await CreditTransaction.countDocuments()).toBe(0);
  });
});
