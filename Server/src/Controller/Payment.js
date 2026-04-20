import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Booking from "../model/Booking.js";
import Trek from "../model/Trek.js";

dotenv.config();

function getRazorpay() {
  const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
  if (!key_id || !key_secret) throw new Error("Razorpay keys missing.");
  console.log("Razorpay Key ID:", key_id);
  return new Razorpay({ key_id, key_secret });
}

// ── Beautiful Email for Trekker ───────────────────────────────────────────────
function buildTrekkerEmailHTML(booking, paymentId) {
  const rows = [
    ["Booking ID", booking._id],
    ["Trek Name", booking.trekName],
    ["Trek Date", booking.trekDate || "—"],
    ["Participants", `${booking.participants} Person${booking.participants !== 1 ? "s" : ""}`],
    ["Amount Paid", `&#8377;${booking.amountPaid.toLocaleString("en-IN")}`],
    ["Payment ID", paymentId],
    ["Status", "&#9989; Confirmed"],
  ].map(([l, v], i) => `
    <tr style="background:${i%2===0?"#f0fdf4":"#ffffff"}">
      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#374151;width:45%;border-bottom:1px solid #d1fae5;">${l}</td>
      <td style="padding:12px 16px;font-size:13px;color:${l==="Amount Paid"||l==="Status"?"#15803d":"#1f2937"};font-weight:${l==="Amount Paid"||l==="Status"?"700":"400"};border-bottom:1px solid #d1fae5;">${v}</td>
    </tr>`).join("");

  const trekkerRows = [
    ["Name", booking.trekkerName],
    ["Email", booking.trekkerEmail],
    ["Phone", booking.trekkerPhone],
    ["Emergency Contact", booking.emergencyPhone || "—"],
  ].map(([l, v], i) => `
    <tr style="background:${i%2===0?"#f0fdf4":"#ffffff"}">
      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#374151;width:45%;border-bottom:1px solid #d1fae5;">${l}</td>
      <td style="padding:12px 16px;font-size:13px;color:#1f2937;border-bottom:1px solid #d1fae5;">${v}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Booking Confirmed</title></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#15803d 0%,#16a34a 60%,#22c55e 100%);padding:48px 40px;text-align:center;">
    <div style="font-size:52px;margin-bottom:12px;">&#127956;</div>
    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">Booking Confirmed!</h1>
    <p style="margin:10px 0 0;color:#bbf7d0;font-size:15px;">Your adventure awaits, ${booking.trekkerName.split(" ")[0]}!</p>
  </td></tr>
  <tr><td style="text-align:center;padding:28px 40px 8px;">
    <div style="display:inline-block;background:#dcfce7;border:3px solid #16a34a;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:26px;">&#9989;</div>
  </td></tr>
  <tr><td style="padding:8px 40px 24px;text-align:center;">
    <h2 style="margin:0 0 8px;color:#166534;font-size:20px;font-weight:700;">${booking.trekName}</h2>
    <p style="margin:0;color:#6b7280;font-size:14px;">Your payment has been received. See you on the trail!</p>
  </td></tr>
  <tr><td style="padding:0 40px;"><div style="border-top:2px dashed #d1fae5;"></div></td></tr>
  <tr><td style="padding:24px 40px;">
    <h3 style="margin:0 0 16px;color:#15803d;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">&#128203; Booking Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #d1fae5;">${rows}</table>
  </td></tr>
  <tr><td style="padding:0 40px 24px;">
    <h3 style="margin:0 0 16px;color:#15803d;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">&#128100; Trekker Details</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #d1fae5;">${trekkerRows}</table>
  </td></tr>
  <tr><td style="padding:0 40px 24px;">
    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">&#9888;&#65039; Important Reminder</p>
      <p style="margin:6px 0 0;font-size:13px;color:#78350f;">Please carry a copy of this email on the day of the trek. Participation is entirely at your own risk.</p>
    </div>
  </td></tr>
  <tr><td style="padding:0 40px 32px;text-align:center;">
    <a href="http://localhost:5500/Client/HTML/mybooking.html" style="display:inline-block;background:linear-gradient(135deg,#15803d,#16a34a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;">View My Bookings &#8594;</a>
  </td></tr>
  <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
  <tr><td style="padding:24px 40px;text-align:center;">
    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#15803d;">&#127956; TrekFast</p>
    <p style="margin:0 0 10px;font-size:13px;color:#9ca3af;">Curated trekking experiences across India's most beautiful trails.</p>
    <p style="margin:0;font-size:12px;color:#d1d5db;">&#128231; info@trekfast.com &bull; &#128222; +91 9876543210 &bull; Pune, Maharashtra</p>
    <p style="margin:10px 0 0;font-size:12px;color:#d1d5db;">&copy; 2026 TrekFast. All rights reserved.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ── Beautiful Email for Organizer ─────────────────────────────────────────────
function buildOrganizerEmailHTML(booking, paymentId) {
  const rows = [
    ["Booking ID", booking._id],
    ["Trek Name", booking.trekName],
    ["Trek Date", booking.trekDate || "—"],
    ["Participants", `${booking.participants} Person${booking.participants !== 1 ? "s" : ""}`],
    ["Revenue Earned", `&#8377;${booking.amountPaid.toLocaleString("en-IN")}`],
    ["Payment ID", paymentId],
    ["Status", "&#9989; Payment Confirmed"],
  ].map(([l, v], i) => `
    <tr style="background:${i%2===0?"#eff6ff":"#ffffff"}">
      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#374151;width:45%;border-bottom:1px solid #bfdbfe;">${l}</td>
      <td style="padding:12px 16px;font-size:13px;color:${l==="Revenue Earned"?"#1e40af":l==="Status"?"#15803d":"#1f2937"};font-weight:${l==="Revenue Earned"||l==="Status"?"700":"400"};border-bottom:1px solid #bfdbfe;">${v}</td>
    </tr>`).join("");

  const trekkerRows = [
    ["Name", booking.trekkerName],
    ["Email", booking.trekkerEmail],
    ["Phone", booking.trekkerPhone],
    ["Emergency Contact", booking.emergencyPhone || "—"],
    ["Age / Gender", `${booking.age || "—"} / ${booking.gender || "—"}`],
    ["Address", booking.address || "—"],
  ].map(([l, v], i) => `
    <tr style="background:${i%2===0?"#eff6ff":"#ffffff"}">
      <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#374151;width:45%;border-bottom:1px solid #bfdbfe;">${l}</td>
      <td style="padding:12px 16px;font-size:13px;color:#1f2937;border-bottom:1px solid #bfdbfe;">${v}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New Booking Alert</title></head>
<body style="margin:0;padding:0;background:#f0f9ff;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%);padding:48px 40px;text-align:center;">
    <div style="font-size:52px;margin-bottom:12px;">&#127881;</div>
    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">New Booking Received!</h1>
    <p style="margin:10px 0 0;color:#bfdbfe;font-size:15px;">Someone just booked your trek on TrekFast</p>
  </td></tr>
  <tr><td style="text-align:center;padding:28px 40px 8px;">
    <div style="display:inline-block;background:#dbeafe;border:3px solid #2563eb;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:26px;">&#128236;</div>
  </td></tr>
  <tr><td style="padding:8px 40px 24px;text-align:center;">
    <h2 style="margin:0 0 8px;color:#1e40af;font-size:20px;font-weight:700;">${booking.trekName}</h2>
    <p style="margin:0;color:#6b7280;font-size:14px;">A new trekker has joined your adventure. Here are their details.</p>
  </td></tr>
  <tr><td style="padding:0 40px;"><div style="border-top:2px dashed #bfdbfe;"></div></td></tr>
  <tr><td style="padding:24px 40px;">
    <h3 style="margin:0 0 16px;color:#1e40af;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">&#128176; Booking Summary</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #bfdbfe;">${rows}</table>
  </td></tr>
  <tr><td style="padding:0 40px 24px;">
    <h3 style="margin:0 0 16px;color:#1e40af;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">&#128100; Trekker Information</h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #bfdbfe;">${trekkerRows}</table>
  </td></tr>
  <tr><td style="padding:0 40px 24px;">
    <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:12px;padding:16px 20px;">
      <p style="margin:0;font-size:13px;color:#065f46;font-weight:600;">&#128161; Next Steps</p>
      <p style="margin:6px 0 0;font-size:13px;color:#047857;">Check your Organizer Dashboard for full booking details. Consider reaching out to this trekker closer to the trek date with preparation tips!</p>
    </div>
  </td></tr>
  <tr><td style="padding:0 40px 32px;text-align:center;">
    <a href="http://localhost:5500/Client/HTML/dashboard.html" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#2563eb);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;">View Dashboard &#8594;</a>
  </td></tr>
  <tr><td style="padding:0 40px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>
  <tr><td style="padding:24px 40px;text-align:center;">
    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#2563eb;">&#127956; TrekFast</p>
    <p style="margin:0 0 10px;font-size:13px;color:#9ca3af;">Connecting trekkers with the best organizers across India.</p>
    <p style="margin:0;font-size:12px;color:#d1d5db;">&#128231; info@trekfast.com &bull; &#128222; +91 9876543210 &bull; Pune, Maharashtra</p>
    <p style="margin:10px 0 0;font-size:12px;color:#d1d5db;">&copy; 2026 TrekFast. All rights reserved.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ── 1. Create Razorpay Order ─────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const {
      trekId, participants,
      trekkerName, trekkerEmail, trekkerPhone, emergencyPhone,
      age, gender, address, aadharNumber, riskAcknowledged
    } = req.body;

    if ([trekId, participants, trekkerName, trekkerEmail, trekkerPhone,
      emergencyPhone, age, gender, address, aadharNumber].some(v => !v)) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!riskAcknowledged) {
      return res.status(400).json({ message: "You must acknowledge the risk disclaimer." });
    }

    const trek = await Trek.findById(trekId);
    if (!trek) return res.status(404).json({ message: "Trek not found." });

    const totalAmount = trek.price * participants;
    const amountInPaise = totalAmount * 100;

    let order;
    try {
      const razorpay = getRazorpay();
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `tf_${Date.now()}`,
        notes: { trekName: trek.trekName, trekkerName, trekkerEmail },
      });
    } catch (rzpErr) {
      console.error("Razorpay Error:", rzpErr);
      return res.status(500).json({
        message: "Payment gateway error: " + (rzpErr.message || "Check Razorpay keys in .env and restart server.")
      });
    }

    // Use JWT email as the definitive trekker email — ignore what frontend sends
    const confirmedTrekkerEmail = req.user.email.trim().toLowerCase();
    console.log(">>> createOrder — JWT trekkerEmail:", confirmedTrekkerEmail);

    const booking = new Booking({
      trekId,
      trekName: trek.trekName,
      trekImage: trek.imageUrl || "",
      trekDate: trek.startDate
        ? new Date(trek.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "",
      trekStartDate: trek.startDate || null,
      trekEndDate: trek.endDate || null,
      organizerEmail: trek.organizerEmail,
      trekkerName, trekkerEmail: confirmedTrekkerEmail, trekkerPhone, emergencyPhone,
      age, gender, address, aadharNumber, riskAcknowledged,
      participants,
      amountPaid: totalAmount,
      razorpayOrderId: order.id,
      status: "pending",
    });
    await booking.save();

    res.status(200).json({
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      bookingId: booking._id,
      trekName: trek.trekName,
      keyId: (process.env.RAZORPAY_KEY_ID || "").trim(),
    });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Could not create payment order." });
  }
};

// ── 2. Verify Payment ────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    const expected = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expected !== razorpay_signature) {
      await Booking.findByIdAndUpdate(bookingId, { status: "failed" });
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: "paid" },
      { new: true }
    );

    // ── Send emails ────────────────────────────────────────────────────────
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: (process.env.GMAIL || "").trim(),
          pass: (process.env.GMAILPASS || "").trim(),
        },
      });

      // 📧 Email 1: Beautiful confirmation to Trekker
      await transporter.sendMail({
        from: `"TrekFast" <${(process.env.GMAIL || "").trim()}>`,
        to: booking.trekkerEmail,
        subject: `🏔️ Booking Confirmed — ${booking.trekName} | TrekFast`,
        html: buildTrekkerEmailHTML(booking, razorpay_payment_id),
      });
      console.log("✅ Confirmation email sent to trekker:", booking.trekkerEmail);

      // 📧 Email 2: New booking alert to Organizer
      if (booking.organizerEmail) {
        await transporter.sendMail({
          from: `"TrekFast" <${(process.env.GMAIL || "").trim()}>`,
          to: booking.organizerEmail,
          subject: `🎉 New Booking Alert — ${booking.trekName} | TrekFast`,
          html: buildOrganizerEmailHTML(booking, razorpay_payment_id),
        });
        console.log("✅ New booking alert sent to organizer:", booking.organizerEmail);
      }

    } catch (emailErr) {
      console.error("Email send error (non-fatal):", emailErr.message);
    }

    res.status(200).json({ message: "Payment verified and booking confirmed!", booking });

  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ message: "Server error during payment verification." });
  }
};

// ── 3. Get bookings by trekker email ─────────────────────────────────────────
export const getMyBookings = async (req, res) => {
  try {
    // Email comes from JWT token — 100% reliable
    const email = req.user.email.trim().toLowerCase();
    console.log(">>> getMyBookings — JWT email:", email);

    const bookings = await Booking.find({
      trekkerEmail: { $regex: new RegExp("^" + email + "$", "i") }
    }).sort({ createdAt: -1 });

    console.log(">>> Found", bookings.length, "bookings for", email);
    res.status(200).json(bookings);
  } catch (err) {
    console.error("getMyBookings Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── 4. Get bookings by organizer email ───────────────────────────────────────
export const getOrganizerBookings = async (req, res) => {
  try {
    // Email comes from JWT token — 100% reliable
    const email = req.user.email.trim().toLowerCase();
    console.log(">>> getOrganizerBookings — JWT email:", email);

    const bookings = await Booking.find({
      organizerEmail: { $regex: new RegExp("^" + email + "$", "i") }
    }).sort({ createdAt: -1 });

    console.log(">>> Found", bookings.length, "organizer bookings for", email);
    res.status(200).json(bookings);
  } catch (err) {
    console.error("getOrganizerBookings Error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// ── 5. Cancel a booking (by trekker or organizer) ────────────────────────────
export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const requesterEmail = req.user.email.trim().toLowerCase();

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    // Allow cancellation only by the trekker or the organizer of that trek
    const isTrekker   = booking.trekkerEmail.toLowerCase()   === requesterEmail;
    const isOrganizer = booking.organizerEmail.toLowerCase() === requesterEmail;

    if (!isTrekker && !isOrganizer) {
      return res.status(403).json({ message: "Not authorized to cancel this booking." });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled." });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully.", booking });
  } catch (err) {
    console.error("cancelBooking Error:", err);
    res.status(500).json({ message: "Server error while cancelling booking." });
  }
};
