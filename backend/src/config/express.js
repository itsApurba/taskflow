const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const compression = require("compression");
const routes = require("../api/routes/index");
const passport = require('passport')
const strategies = require("./passport");
const error = require("../api/middleware/error");

const app = express();

if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(compression());
app.use(cors());

app.use(passport.initialize())
passport.use('jwt', strategies.jwt)

app.use("/api", routes);

// catch 404 and forward to error handler
app.use(error.notFound);

app.use(error.handler);

module.exports = app;
