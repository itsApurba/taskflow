const mongoose = require("mongoose");
const { mongo, env } = require("./vars");

mongoose.connection.on("error", (err) => {
  console.log(`Database error ${err}.`);
  process.exit(-1);
});

if (env === "development") {
  mongoose.set("debug", true);
}

exports.connect = async () => {
  console.log(mongo.uri);
  await mongoose
    .connect(mongo.uri, {
      keepAlive: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connected");
    });
  return mongoose.connection;
};
