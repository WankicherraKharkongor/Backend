const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomTypeSchema = new Schema({
  name: { type: String, required: true },
  basePrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  room: { type: Number, required: true },
  taxes: { type: Number, default: 0 },
  capacity: { type: String, required: true },
});

const hotelSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    image: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    location: { type: String },
    longitude: { type: Number },
    latitude: { type: Number },
    roomTypes: [roomTypeSchema],
    rating: { type: Number },
    duration: { type: Number },
    amenities: { type: String },
    contact: { type: Number },
    status: { type: String, default: "ACTIVE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("hotel", hotelSchema);
module.exports = Hotel;
