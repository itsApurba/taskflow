// Manual/local seeding uses the same bounded, idempotent restoration path as
// /restore and the hourly scheduler. Never run this against live data to test.
const mongoose = require("mongoose");
const db = require("./config/mongoose");
const { restoreDemo } = require("./api/services/demoRestore");

async function seed() {
  await db.connect();
  mongoose.set("debug", false);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
  console.log(await restoreDemo());
  console.log("Demo accounts use taskflow123; existing passwords and sessions are preserved.");
}
seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
