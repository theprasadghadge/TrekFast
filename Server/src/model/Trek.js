import mongoose from "mongoose";

const trekSchema = new mongoose.Schema({
  // Basic Info
  trekName: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },

  // Trek Details
  difficulty: {
    type: String,
    required: true,
    enum: ["Easy", "Moderate", "Difficult", "Extreme"],
  },
  duration: {
    type: String, // e.g. "3 Days / 2 Nights"
    required: true,
  },
  distance: {
    type: String, // e.g. "15 km"
    required: true,
  },
  altitude: {
    type: String, // e.g. "4500 m"
  },
  startingPoint: {
    type: String,
    required: true,
  },
  endingPoint: {
    type: String,
    required: true,
  },

  // Schedule
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  meetingTime: {
    type: String, // e.g. "6:00 AM"
    required: true,
  },

  // Capacity & Price
  maxParticipants: {
    type: Number,
    required: true,
  },
  price: {
    type: Number, // per person in INR
    required: true,
  },
  includes: {
    type: String, // comma-separated or paragraph
  },
  excludes: {
    type: String,
  },

  // Organizer Info
  organizerName: {
    type: String,
    required: true,
  },
  organizerEmail: {
    type: String,
    required: true,
  },
  organizerPhone: {
    type: String,
    required: true,
  },

  // Image URL (Unsplash or uploaded)
  imageUrl: {
    type: String,
    default: "",
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Trek = mongoose.model("Trek", trekSchema);
export default Trek;
