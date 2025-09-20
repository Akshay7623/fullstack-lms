const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    mobileNumber: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },

    rate: {
      type: Number,
      required: true,
    },

    modules: {
      type: [String],
      default: [],
    },

    registrationDate: {
      type: Date,
      required: true,
    },

    address: {
      type: String,
      required: false,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
      required: false,
    },

    id_document: {
      type: String,
      required: false,
    },

    course: {
      type: String,
      required: true,
    },

    professionalSummary: {
      type: String,
      required: false,
    },

    accountName: {
      type: String,
      required: false,
    },

    accountNumber: {
      type: String,
      required: false,
    },

    ifscCode: {
      type: String,
      required: false,
    },

    bankName: {
      type: String,
      required: false,
    },

    batches: {
      type: [String],
      required: false,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    panCard: {
      type: String,
      required: false,
    },

    govtIdType: {
      type: String,
      enum: ["Aadhar Card", "PAN Card", "Voter Card", "Passport"],
    },

    govtId: {
      type: String,
      required: false,
    },

    resume: {
      type: String,
      required: false,
    },

    contact_id: {
      type: String,
      required: false,
      default: "",
    },
  
    fund_account_id: {
      type: String,
      required: false,
      default: "",
    },
  },
  { timestamps: true }
);

const Trainer = mongoose.model("Trainer", trainerSchema);

module.exports = Trainer;
