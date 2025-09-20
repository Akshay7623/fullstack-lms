const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  courseId: {
    type: String,
    required: true,
  },
  paymentMode: {
    type: String,
    required: true,
  },
  paymentReferenceId: {
    type: String,
    required: true,
  },
  lastReceiptSentAt:{
    type:Date,
    default:null,
  }
  
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
