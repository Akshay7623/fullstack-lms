const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
  },

  year: {
    type: Number,
    required: true,
  },

  courseName: {
    type: String,
    required: true,
  },

  courseCode: {
    type: String,
  },

  batchNo: {
    type: Number,
    required: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  batchClassSchedule: {
    type: String,
    enum: ["weekend", "daily", "alternate"],
  },
  
  status: {
    type: String,
    default: "active",
    enum: ["active", "semi-active", "archived"],
  },
});

const Batch = mongoose.model("batch", batchSchema);

module.exports = Batch;
