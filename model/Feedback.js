const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    rating: {
      type: String,
      required: true,
    },
    comments: {
      type: String,
      default: "",
    },
    status: { type: String, default: "ACTIVE" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("feedback", feedbackSchema);
