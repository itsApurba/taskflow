const path = require("path");

// A local .env is optional: on Vercel every value comes from the project's environment variables.
require("dotenv").config({ path: path.join(__dirname, "../../.env"), quiet: true });

const env = process.env.NODE_ENV || "development";

/** Comma-separated allowed origins; unset allows every origin. */
const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const vars = {
  env,
  port: process.env.PORT || 3939,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: Number(process.env.JWT_EXPIRATION_MINUTES) || 15,
  corsOrigins,
  mongo: {
    // MONGODB_URI is the name the Vercel MongoDB Atlas integration injects.
    uri: env === "test" ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI || process.env.MONGODB_URI,
  },
};

/** Names of the required variables that are not set. */
vars.missingConfig = () => [
  ...(vars.mongo.uri ? [] : ["MONGO_URI (or MONGODB_URI)"]),
  ...(vars.jwtSecret ? [] : ["JWT_SECRET"]),
];

module.exports = vars;
