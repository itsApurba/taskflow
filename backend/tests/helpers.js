require("./env");
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/config/express");
const User = require("../src/api/models/user.model");

let mongod;

/** Starts an in-memory MongoDB and builds every model's indexes. */
async function startDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

async function stopDb() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

async function clearDb() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

const api = () => request(app);

let counter = 0;

/** Signs a user up through the API and returns `{ user, token, auth }`. */
async function signup({ role = "worker", reportsTo, name } = {}) {
  counter += 1;
  const res = await api()
    .post("/api/auth/register")
    .send({
      name: name || `${role} ${counter}`,
      email: `${role}${counter}@test.dev`,
      password: "password123",
      role,
      reportsTo: reportsTo ? String(reportsTo) : undefined,
    });
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  const token = res.body.token.accessToken;
  return { user: res.body.user, token, auth: { Authorization: `Bearer ${token}` } };
}

/** A manager with `workers` reports. */
async function team(workers = 2) {
  const manager = await signup({ role: "manager" });
  const members = [];
  for (let i = 0; i < workers; i += 1) {
    members.push(await signup({ role: "worker", reportsTo: manager.user._id }));
  }
  return { manager, workers: members };
}

async function postTask(manager, body = {}) {
  const res = await api()
    .post("/api/tasks")
    .set(manager.auth)
    .send({ title: "Fix the login bug", type: "bug", reward: 50, ...body });
  if (res.status !== 201) throw new Error(`post task failed: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body;
}

/** Runs a task through claim -> submit -> approve. */
async function completeTask(manager, worker, body) {
  const task = await postTask(manager, body);
  await api().post(`/api/tasks/${task._id}/claim`).set(worker.auth).expect(200);
  await api().post(`/api/tasks/${task._id}/submit`).set(worker.auth).send({ note: "done" }).expect(200);
  await api().post(`/api/tasks/${task._id}/approve`).set(manager.auth).expect(200);
  return task;
}

const setCredits = (user, credits) => User.updateOne({ _id: user.user._id }, { $set: { credits } });

const credits = async (user) => (await User.findById(user.user._id)).credits;

module.exports = { startDb, stopDb, clearDb, api, signup, team, postTask, completeTask, setCredits, credits };
