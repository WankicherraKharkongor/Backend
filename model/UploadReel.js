const mongoose = require("mongoose");

const { Schema } = mongoose;
const uploadSchema = new Schema({
  title: { type: String },
  image: { type: String },
  video: { type: String },
  description: { type: String },
  location: { type: String },
});

mongoose.model("uploads", uploadSchema);
