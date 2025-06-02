const mongoose = require("mongoose");

const { Schema } = mongoose;
const restaurantSchema = new Schema(
  {
    title: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    description: { type: String },
    image: [String],
    type: { type: String },
    location: { type: String },
    rating: { type: Number },
    latitude: { type: Number },
    longitude: { type: Number },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],

    status: { type: String, default: "ACTIVE" },
    amenities: { type: String },
    duration: { type: Number },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const Restaurant = mongoose.model("restaurant", restaurantSchema);
module.exports = Restaurant;
