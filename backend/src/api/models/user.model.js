const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: /^\S+@\S+\.\S+$/, 
    immutable: true 
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

UserSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
