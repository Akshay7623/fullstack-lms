const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  prices: {
    certification: {
      type: Number,
      required: false,
    },
    diploma: {
      type: Number,
      required: false,
    },
    masterDiploma: {
      type: Number,
      required: false,
    },
  },
  status: {
    type: String,
    required: true,
    enum: ["active", "deactive"],
    default: "active",
  },
  details: {
    type: String,
    required: false,
  },
  topics: {
    type: [String],
    default: [],
  },
  img: {
    type: String,
    required: false,
  },
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
