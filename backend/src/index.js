const { port, env, missingConfig } = require("./config/vars");
const app = require("./config/express");
const mongoose = require("./config/mongoose");

const missing = missingConfig();
if (missing.length) {
  console.error(`Missing configuration: set ${missing.join(", ")} (see .env.example)`);
  process.exit(1);
}

mongoose.connect().catch(() => process.exit(1));

app.listen(port, (err) => {
  if (err) {
    console.error(`Failed to start server on port ${port}: ${err.message}`);
    process.exit(1);
  }
  console.log(`App listening on port ${port} (${env})`);
});

module.exports = app;
