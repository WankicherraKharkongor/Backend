const mongoose = require("mongoose");
const { Schema } = mongoose;

const reelSchema = new Schema(
  {
    video: { type: String },
    caption: { type: String }, // ✅ lowercase
    location: { type: String },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    status: { type: String, default: "ACTIVE" },
    author: { type: Schema.Types.ObjectId, ref: "users" },
    createdBy: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("reel", reelSchema);
