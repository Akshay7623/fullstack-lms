const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  plannedDate: {
    type: Date,
    required: true,
  },

  lectureTopic: {
    type: String,
    default: "",
  },

  trainerName: {
    type: String,
    default: "",
  },

  startTime: {
    type: String,
    required: true,
  },

  endTime: {
    type: String,
    required: true,
  },

  trainerId: {
    type: String,
    default: "",
  },

  recordLink: {
    type: String,
    required: false,
  },

  documents: {
    type: [String],
    required: false,
  },

  isCancelled: {
    type: Boolean,
    required: true,
    default: false,
  },

  cancellationReason: {
    type: String,
    default: "",
  },

  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    required: true,
    default: "scheduled",
  },

  courseId: {
    type: String,
    required: true,
  },

  courseName: {
    type: String,
    required: true,
  },

  batchId: {
    type: String,
    required: true,
  },

  holidayName: {
    type: String,
    default: null,
  },
});
const Lecture = mongoose.model("Lecture", lectureSchema);

module.exports = Lecture;