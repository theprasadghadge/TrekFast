import Contact from "../model/contact.js";
import nodemailer from "nodemailer";

export const createContact = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    // Save contact message in database
    const newContact = await Contact.create({
      fullName,
      email,
      phone,
      subject,
      message
    });

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAILPASS
      }
    });

    // Email sent to user (auto reply)
    const userMail = {
      from: process.env.GMAIL,
      to: email,
      subject: "Message Received",
      text: `Hello ${fullName},
Thank you for contacting us. 
We have received your message.
our team will get back to you soon.
Thankyou!

Regards,
Support Team`
    };

    // Email sent to company
   const companyMail = {
  from: `"TrekFast Contact Form" <${process.env.GMAIL}>`,
  to: process.env.GMAIL,
  subject: `Message from ${email}`,
  replyTo: email,
  text: `
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Subject: ${subject}

Message:
${message}
`
};

    // Send emails
    await Promise.all([
      transporter.sendMail(userMail),
      transporter.sendMail(companyMail)
    ]);

    res.status(201).json({
      success: true,
      message: "Message sent successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to process contact request"
    });
  }
};