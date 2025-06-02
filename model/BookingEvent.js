const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tickets: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    attendeeInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: String,
    },
    payment: {
      method: { type: String, enum: ["CARD", "UPI", "WALLET"] },
      transactionId: String,
      status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING",
      },
    },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED", "CHECKED_IN"],
      default: "CONFIRMED",
    },
    qrCode: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
