const mongoose = require("mongoose");

const trainerPaymentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  trainerId: {
    type: String,
    required: true,
  },

  lectureDate: {
    type: Date,
    required: true,
  },

  lectureTopic: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  lectureHour: {
    type: Number,
    required: true,
  },

  payoutId: {
    type: String,
    default: "",
  },

  updatedAt: {
    type: Date,
    default: null,
  },

  status: {
    type: String,
    enum: ["settled", "pending", "failed", "processing"],
    default: "pending",
  },
});

const trainerPayment = mongoose.model("TrainerPayment", trainerPaymentSchema);
module.exports = trainerPayment;
