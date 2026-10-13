// Vercel function entry: vercel.json rewrites every request here, and the
// Express app keeps its /api routes. Locally, src/index.js listens instead.
const app = require("../src/config/express");
const corsMiddleware = require("../src/config/cors");
const db = require("../src/config/mongoose");
const { missingConfig } = require("../src/config/vars");

const fail = (res, status, message) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ message }));
};

module.exports = (req, res) =>
  // CORS first, so preflights skip the database and errors below stay readable in the browser.
  corsMiddleware(req, res, async () => {
    const missing = missingConfig();
    if (missing.length) {
      console.error(`Missing configuration: set ${missing.join(", ")}`);
      return fail(res, 500, "Server is not configured");
    }
    try {
      await db.connect();
    } catch {
      return fail(res, 503, "Database unavailable");
    }
    return app(req, res);
  });
