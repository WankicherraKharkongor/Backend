// models/Like.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const restaurantLikeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "restaurant",
      required: true,
    },
  },

  { timestamps: true }
);

// Optionally enforce unique combination of userId + placeId to avoid duplicates
// hotelLikeSchema.index({ placeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("restaurantLike", restaurantLikeSchema);
