import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../model/UserRegModel.js";
import Organizer from "../model/Organizer.js";

dotenv.config();

// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAILPASS,
  },
});

// Temporary OTP store { email: { otp, expiry } }
const otpStore = {};

// ===== STEP 1: Send Reset OTP =====
export const sendResetOTP = async (req, res) => {
  const { email, userType } = req.body;

  try {
    // Check user exists in correct model
    let user;
    if (userType === "organizer") {
      user = await Organizer.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 min expiry
    otpStore[email] = {
      otp,
      expiry: Date.now() + 10 * 60 * 1000
    };

    // Send OTP email
    await transporter.sendMail({
      from: `"Trek Fast App" <${process.env.GMAIL}>`,
      to: email,
      subject: "Password Reset OTP - Trek Fast App",
      text: `Hi ${user.firstName},\n\nYour OTP to reset your password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this, please ignore this email.\n\nTrek Fast App Team`,
    });

    res.status(200).json({ message: "OTP sent to your email!" });

  } catch (err) {
    console.error("Send reset OTP error:", err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

// ===== STEP 2: Verify Reset OTP =====
export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "OTP not sent or already used" });
    }

    if (Date.now() > record.expiry) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired. Please request a new one" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP verified — mark as verified but keep for reset step
    otpStore[email].verified = true;

    res.status(200).json({ message: "OTP Verified" });

  } catch (err) {
    console.error("Verify reset OTP error:", err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

// ===== STEP 3: Reset Password =====
export const resetPassword = async (req, res) => {
  const { email, newPassword, userType } = req.body;

  try {
    const record = otpStore[email];

    // Must be verified first
    if (!record || !record.verified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update correct model
    if (userType === "organizer") {
      await Organizer.findOneAndUpdate({ email }, { password: hashedPassword });
    } else {
      await User.findOneAndUpdate({ email }, { password: hashedPassword });
    }

    // Clear OTP store
    delete otpStore[email];

    res.status(200).json({ message: "Password reset successfully!" });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};