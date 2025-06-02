const mongoose = require("mongoose");

const { Schema } = mongoose;

const guideSchema = new Schema({
  name: { type: String },
});

const placeSchema = new Schema(
  {
    title: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    location: { type: String },
    type: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    duration: { type: Number },
    image: [String],
    rating: { type: Number },
    description: { type: String },
    // likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    status: { type: String, default: "ACTIVE" },
    guides: [guideSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const Place = mongoose.model("place", placeSchema); // "Place" must match in your code

module.exports = Place;
