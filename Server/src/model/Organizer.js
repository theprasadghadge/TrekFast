import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema({

  // Personal Name
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  surname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
   password: {
    type: String,
    required: true,
  },
  // Organization Info
  organizationName: {
    type: String,
    required: true
  },
  experienceYears: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  websiteOrSocial: {
    type: String
  },
  operatingRegion: {
    type: String,
    required: true
  },
  // Emergency Details
  emergencyPerson: {
    type: String,
    required: true
  },
  emergencyNumber: {
    type: String,
    required: true
  },
  safetyCertifications: {
    type: String
  },
  firstAidAvailable: {
    type: String,   // "Yes" or "No"
    enum: ["Yes", "No"]
  },
  medicalSupport: {
    type: String,   // "Yes" or "No"
    enum: ["Yes", "No"]
  },
  // Documents (store file paths / URLs)
  personalId: {
    type: String,
    required: true
  },
  orgRegistrationDoc: {
    type: String,
    required: true
  },
  experienceProof: {
    type: String
  },
  // Terms accepted
  termsAccepted: {
    type: Boolean,
    required: true
  },
  // Created time
  createdAt: {
    type: Date,
    default: Date.now
  }

});

const Organizer = mongoose.model("Organizer", organizerSchema);
export default Organizer;