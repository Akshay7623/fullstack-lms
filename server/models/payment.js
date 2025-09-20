const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  
  orderId: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  currency: {
    type: String,
    default: "INR",
  },
  paymentStatus: {
    type: String,
    enum: ["created", "captured", "failed"],
    default: "created",
  },
  receipt: String,
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
