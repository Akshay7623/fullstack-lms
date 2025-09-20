const Course = require("../models/course");
const fs = require("fs");
const path = require("path");

const addCourseController = (req, res) => {
  const { name, code, duration, status, prices, details, topics } = req.body;
  const img = req.file ? req.file.filename : null;

  const course = new Course({
    name,
    code,
    duration,
    status,
    prices,
    details,
    topics,
    img,
  });

  try {
    course.save();
    return res.status(200).json({ message: "Course added successfully" });
  } catch (error) {
    if (img) {
      const filePath = path.join(__dirname, "../uploads", img);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete file:", err);
      });
    }
    return res.status(500).json({ message: "Internal server" });
  }
};

module.exports = addCourseController;
