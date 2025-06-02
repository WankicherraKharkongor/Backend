const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    otp: String,
    phone: String,
    plan: { type: String, default: "FREE" },
    lastLogin: { type: Date, default: Date.now },
    status: { type: String, default: "ACTIVE" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
