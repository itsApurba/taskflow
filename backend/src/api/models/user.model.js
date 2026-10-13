const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require("moment-timezone");
const jwt = require("jwt-simple");
const { jwtExpirationInterval, jwtSecret } = require("../../config/vars");
const APIError = require("../utils/APIError");
const { currentStreak, xpForLevel } = require("../utils/gamification");

const ROLES = ["manager", "worker"];

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
  role: {
    type: String,
    enum: ROLES,
    default: "worker",
  },
  // The worker's manager; a manager's team is every user reporting to them.
  reportsTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },
  xp: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  streak: { type: Number, default: 0, min: 0 },
  lastApprovedAt: { type: Date, default: null },
  // Cached balance, kept in sync with the CreditTransaction ledger.
  credits: { type: Number, default: 0, min: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

UserSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

UserSchema.pre("save", async function () {
  this.updated_at = Date.now();
  if (!this.isModified("password")) return;
  // const rounds = env === "test" ? 1 : 10;
  const rounds = 2;
  this.password = await bcrypt.hash(this.password, rounds);
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

  /** Public profile with gamification stats; never includes the password hash. */
  profile() {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      reportsTo: this.reportsTo,
      credits: this.credits,
      xp: this.xp,
      level: this.level,
      nextLevelXp: xpForLevel(this.level + 1),
      streak: currentStreak(this.streak, this.lastApprovedAt),
      lastApprovedAt: this.lastApprovedAt,
      created_at: this.created_at,
    };
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
    throw APIError.notFound("User does not exist");
  },
  async findAndGenerateToken(options) {
    try {
      const { email, password, refreshObject } = options;
      if (!email) throw APIError.badRequest("An email is required to generate a token");

      const user = await this.findOne({ email }).exec();
      let message;
      if (password) {
        if (user && (await user.passwordMatches(password))) {
          return { user, accessToken: user.token() };
        }
        message = "Incorrect email or password";
      } else if (refreshObject && refreshObject.userEmail === email) {
        if (moment(refreshObject.expires).isBefore()) {
          message = "Invalid refresh token.";
        } else {
          return { user, accessToken: user.token() };
        }
      } else {
        message = "Incorrect email or refreshToken";
      }
      throw APIError.unauthorized(message);
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
    if (error.code === 11000) {
      return APIError.conflict('"email" already exists');
    }
    return error;
  },
};

const User = mongoose.model("User", UserSchema);
User.ROLES = ROLES;

module.exports = User;
