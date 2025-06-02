const User = require("../models/user.js");
const generateToken = require("../utils/generateToken.js");

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.params;
    const otp = generateOTP(); // Implement this function as per your logic

    // Determine role based on phone number
    const adminPhones = ["+916009674733"]; // List of admin phone numbers
    const role = adminPhones.includes(phone) ? "ADMIN" : "USER";

    // Update or create user with OTP and role
    await User.updateOne({ phone }, { $set: { otp, role } }, { upsert: true });

    // Send OTP to user via SMS or other means

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { sendOtp };
