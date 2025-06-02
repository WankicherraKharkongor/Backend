const mongoose = require("mongoose");

const { Schema } = mongoose;
const eventSchema = new Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  title: { type: String },
  type: { type: String },
  location: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  image: [String],
  rating: { type: Number },
  description: { type: String },
  status: { type: String, default: "ACTIVE" },
  startDate: { type: String },
  price: { type: Number },
  requirements: { type: String },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("event", eventSchema);
