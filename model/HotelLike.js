// models/Like.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const hotelLikeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: "hotel", required: true },
  },

  { timestamps: true }
);

module.exports = mongoose.model("hotelLike", hotelLikeSchema);
