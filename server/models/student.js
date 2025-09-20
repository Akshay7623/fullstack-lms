const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  registrationDate: {
    type: Date,
    required: true,
  },

  course: {
    type: String,
    required: true,
  },

  courseId: {
    type: String,
    required: true,
  },

  mobileNumber: {
    type: String,
    required: true,
  },

  panCard: {
    type: String,
    required: false,
  },

  aadharCard: {
    type: String,
    required: false,
  },

  gender: {
    type: String,
    required: false,
    enum: ["male", "female"],
  },

  parentName: {
    type: String,
    required: false,
  },

  parentMobile: {
    type: String,
    required: false,
  },

  dateOfBirth: {
    type: Date,
    required: false,
  },

  residenceAddress: {
    type: String,
    required: false,
  },

  program: {
    type: String,
    required: true,
    enum: ["certification", "diploma", "master diploma"],
  },

  onBoarding: {
    type: String,
    required: false,
    default: "Ringing",
    enum: ["Ringing", "Message Sent", "Done"],
  },

  batch: {
    type: String,
    default: "",
  },

  studentDocuments: {
    studentPhoto: {
      type: String,
      default: "",
    },
    aadharCardFront: {
      type: String,
      default: "",
    },
    aadharCardBack: {
      type: String,
      default: "",
    },
    panCardPhoto: {
      type: String,
      default: "",
    },
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

  deletedAt: {
    type: Date,
    default: null,
  },

  paid: {
    type: Number,
    required: true,
  },

  pending: {
    type: Number,
    required: true,
  },

  total: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  enrolled: {
    type: Boolean,
    default: true,
  },
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
