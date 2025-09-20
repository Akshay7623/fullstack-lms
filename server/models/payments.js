const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true
  },
  amount: {
    type: Number, // Correct type
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentStatus: {
    type: String,
    enum: ['created', 'captured', 'failed'],
    default: 'created'
  },
  receipt: String, // Correct spelling
  paymentId: String,
  errorCode: String,
  errorDescription: String,
  capturedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema); // Capitalized
