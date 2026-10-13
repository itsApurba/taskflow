const mongoose = require("mongoose");
const { mongo, env } = require("./vars");

// Never log the URI: it carries the database password.
mongoose.connection.on("error", (err) => {
  console.error(`Database error: ${err.message}`);
});

if (env === "development") {
  mongoose.set("debug", true);
}

let connecting = null;

/**
 * Connects once per process and reuses the connection, so warm serverless
 * invocations skip the handshake. A failed attempt is forgotten so the next
 * call retries.
 */
exports.connect = () => {
  if (!connecting) {
    if (!mongo.uri) return Promise.reject(new Error("MONGO_URI (or MONGODB_URI) is not set"));
    connecting = mongoose
      .connect(mongo.uri)
      .then(() => {
        console.log("Database connected");
        return mongoose.connection;
      })
      .catch((err) => {
        connecting = null;
        console.error(`Database connection failed: ${err.message}`);
        throw err;
      });
  }
  return connecting;
};
