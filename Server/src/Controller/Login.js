import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../model/UserRegModel.js";
import Organizer from "../model/Organizer.js";
dotenv.config();

export const loginUser = async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    // ── TREKKER LOGIN ──────────────────────────────────────────────────────
    if (userType === "trekker") {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) return res.status(401).json({ message: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

      // Generate JWT
      const token = jwt.sign(
        { email: user.email, name: user.firstName || user.name || "", userType: "trekker" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Enjoy Trek Login Successful!",
        token,
        name:     user.firstName || user.name || "",
        email:    user.email,
        userType: "trekker",
      });
    }

    // ── ORGANIZER LOGIN ────────────────────────────────────────────────────
    else {
      const organizer = await Organizer.findOne({ email: email.trim().toLowerCase() });
      if (!organizer) return res.status(401).json({ message: "Invalid email or password" });

      const isMatch = await bcrypt.compare(password, organizer.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

      // Generate JWT
      const token = jwt.sign(
        { email: organizer.email, name: organizer.firstName || "", userType: "organizer" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Welcome to Organizer Profile",
        token,
        name:             organizer.firstName || "",
        email:            organizer.email,
        userType:         "organizer",
        organizationName: organizer.organizationName || "",
      });
    }

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
