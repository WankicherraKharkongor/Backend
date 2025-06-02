// models/Like.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const reelLikeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    reelId: { type: Schema.Types.ObjectId, ref: "reel", required: true },
  },

  { timestamps: true }
);

module.exports = mongoose.model("reelLike", reelLikeSchema);
