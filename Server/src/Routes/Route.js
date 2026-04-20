import express from "express";
import { registerUser } from "../Controller/Register.js";
import { loginUser } from "../Controller/Login.js";
import { registerOrganizer } from "../Controller/OrganizerReg.js";
import { sendOTP, verifyOTP } from "../Controller/OtpSend.js";
import { createContact } from "../Controller/contact.js";
import { sendResetOTP, verifyResetOTP, resetPassword } from "../Controller/resetpassword.js";
import { addTrek, getAllTreks, getOrganizerTreks, deleteTrek, updateTrek } from "../Controller/Trek.js";
import { createOrder, verifyPayment, getMyBookings, getOrganizerBookings, cancelBooking } from "../Controller/Payment.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// ── Auth Routes ──────────────────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/organizeregistration", registerOrganizer);

// ── OTP Routes ───────────────────────────────────────────────────────────────
router.post("/sendotp", sendOTP);
router.post("/verifyotp", verifyOTP);

// ── Password Reset ───────────────────────────────────────────────────────────
router.post("/send-reset-otp", sendResetOTP);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

// ── Contact ──────────────────────────────────────────────────────────────────
router.post("/contact", createContact);

// ── Trek Routes ──────────────────────────────────────────────────────────────
router.post("/addtrek", addTrek);
router.get("/gettreks", getAllTreks);
router.get("/getorganizertreks/:email", getOrganizerTreks);
router.delete("/deletetrek/:id", deleteTrek);
router.put("/updatetrek/:id", updateTrek);

// ── Payment & Booking Routes (JWT Protected) ─────────────────────────────────
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/mybookings", protect, getMyBookings);           // ← no email in URL
router.get("/organizerbookings", protect, getOrganizerBookings); // ← no email in URL
router.patch("/cancelbooking/:bookingId", protect, cancelBooking); // ← cancel booking

export default router;
