import bcrypt from "bcryptjs";
import User from "../model/UserRegModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAILPASS, //App Password recommended
  },
});
// Verify transporter once
transporter.verify((err, success) => {
  if (err) console.error("Mail server error:", err);
});

export const registerUser = async (req, res) => {
  const { firstName, middleName, lastName, mobile, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ mobile }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with email or mobile already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = new User({
      firstName,
      middleName,
      lastName,
      mobile,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    try {
      await transporter.sendMail({
        from: `"Trek Fast App"<${process.env.GMAIL}>`,
        to: email,
        subject: "Welcome to Trek Fast App!",
        text: `Hi ${firstName},\nThank you for registering with Trek Fast App!\nYour account is now active.\nHappy Trekking!`,
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};
