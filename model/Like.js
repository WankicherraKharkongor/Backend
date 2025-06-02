// models/Like.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const likeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    placeId: { type: Schema.Types.ObjectId, ref: "place", required: true },
  },

  { timestamps: true }
);

module.exports = mongoose.model("placeLike", likeSchema);
