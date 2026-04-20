import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Organizer from "../model/Organizer.js";

dotenv.config();

export const registerOrganizer = async (req, res) => {
  try {
    // Destructure all fields from frontend
    const {
      firstName,
      middleName,
      surname,
      email,
      mobile,
      password,

      organizationName,
      experienceYears,
      address,
      websiteOrSocial,
      operatingRegion,

      emergencyPerson,
      emergencyNumber,
      safetyCertifications,
      firstAidAvailable,
      medicalSupport,

      personalId,
      orgRegistrationDoc,
      experienceProof,
      termsAccepted
    } = req.body;

    // Check duplicate organizer 
    const existingOrganizer = await Organizer.findOne({ email, mobile });

    if (existingOrganizer) {
      return res.status(400).json({ message: "Organizer already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new organizer
    const newOrganizer = new Organizer({
      firstName,
      middleName,
      surname,
      email,
      mobile,
      password: hashedPassword,

      organizationName,
      experienceYears,
      address,
      websiteOrSocial,
      operatingRegion,

      emergencyPerson,
      emergencyNumber,
      safetyCertifications,
      firstAidAvailable,
      medicalSupport,

      personalId,
      orgRegistrationDoc,
      experienceProof,
      termsAccepted,
    });

    await newOrganizer.save();

    // ===== Send Welcome Email =====
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL,
          pass: process.env.GMAILPASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL,
        to: email,
        subject: "Welcome to Trek Fast as an Organizer! 🎉",
        html: `
          <h2>Welcome, ${firstName} ${surname}!</h2>
          <p>We are thrilled to have you join the <strong>Trek Fast</strong> platform as an organizer.</p>
          <p>With your experience of <strong>${experienceYears} years</strong> and expertise in organizing treks at <strong>${operatingRegion}</strong>, you are going to inspire and guide many adventurers!</p>
          <p>Feel free to explore your dashboard, manage your treks, and connect with our growing community of trekkers.</p>
          <br/>
          <p>Happy Trekking!<br/><strong>The Trek Fast Team</strong></p>
        `,
      };

      await transporter.sendMail(mailOptions);

    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // we don’t block registration if email fails
    }

    //  Respond success
    res.status(201).json({ message: "Organizer registered successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Try again" });
  }
};