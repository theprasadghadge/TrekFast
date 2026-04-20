import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); // load .env file

let storedOTP = ""; // temporary storage
// Send OTP
export const sendOTP = async (req, res) => {
  const { email } = req.body;
  // Generate 6 digit OTP
  storedOTP = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL,     
        pass: process.env.GMAILPASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL, // use env variable here too
      to: email,
      subject: "Your OTP Code For Trek Fast App",
      text: `Your OTP is: ${storedOTP}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent to Email " });

  } catch (error) { 
    console.log(error);
    res.status(500).json({ error: "Failed to Send OTP" });
  }
};
// Verify OTP
export const verifyOTP = (req, res) => {
  const { otp } = req.body;

  if (otp === storedOTP) {
    res.json({ message: "OTP Verified"});
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
};