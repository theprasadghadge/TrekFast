import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  trekId:       { type: mongoose.Schema.Types.ObjectId, ref: "Trek", required: true },
  trekName:     { type: String, required: true },
  trekImage:    { type: String, default: "" },
  trekDate:     { type: String, default: "" },   // formatted start date (display)
  trekStartDate:{ type: Date,   default: null },  // raw start date (for active/expired)
  trekEndDate:  { type: Date,   default: null },  // raw end date (for active/expired)

  // Trekker details
  trekkerName:    { type: String, required: true },
  trekkerEmail:   { type: String, required: true },
  trekkerPhone:   { type: String, required: true },
  emergencyPhone: { type: String, required: true },
  age:            { type: Number, required: true },
  gender:         { type: String, required: true, enum: ["Male","Female","Other"] },
  address:        { type: String, required: true },
  aadharNumber:   { type: String, required: true },
  riskAcknowledged: { type: Boolean, required: true },

  participants:   { type: Number, required: true, min: 1 },
  amountPaid:     { type: Number, required: true },
  organizerEmail: { type: String, required: true },

  razorpayOrderId:   { type: String, required: true },
  razorpayPaymentId: { type: String, default: "" },
  razorpaySignature: { type: String, default: "" },

  status: { type: String, enum: ["pending","paid","failed","cancelled"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
