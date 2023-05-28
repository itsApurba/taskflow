const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");
const httpStatus = require("http-status");
const jwt = require("jwt-simple");
const { jwtExpirationInterval, jwtSecret } = require("../../config/vars");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  password: {
    type: String,
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  try {
    this.updated_at = Date.now();
    if (!this.isModified("password")) return next();
    // const rounds = env === "test" ? 1 : 10;
    const rounds = 2;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

UserSchema.method({
  token() {
    const payload = {
      exp: moment().add(jwtExpirationInterval, "minutes").unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.encode(payload, jwtSecret);
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

UserSchema.statics = {
  async get(id) {
    let user;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await this.findById(id).exec();
    }
    if (user) {
      return user;
    }
    throw new Error({
      message: "User does not exist",
      status: httpStatus.NOT_FOUND,
    });
  },
  async findAndGenerateToken(options) {
    try {
      const { email, password, refreshObject } = options;
      if (!email) throw new Error({ message: "An email is required to generate a token" });

      const user = await this.findOne({ email }).exec();
      const err = {
        status: httpStatus.UNAUTHORIZED,
        isPublic: true,
      };
      if (password) {
        if (user && (await user.passwordMatches(password))) {
          return { user, accessToken: user.token() };
        }
        err.message = "Incorrect email or password";
      } else if (refreshObject && refreshObject.userEmail === email) {
        if (moment(refreshObject.expires).isBefore()) {
          err.message = "Invalid refresh token.";
        } else {
          return { user, accessToken: user.token() };
        }
      } else {
        err.message = "Incorrect email or refreshToken";
      }
      throw new Error(err);
    } catch (error) {
      throw error;
    }
  },

  list({ page = 1, perPage = 30, name, email }) {
    const options = omitBy({ name, email }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  checkDuplicateEmail(error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return new Error({
        message: "Validation Error",
        errors: [
          {
            field: "email",
            location: "body",
            messages: ['"email" already exists'],
          },
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
