const course = require("../models/course");
const fs = require("fs");
const path = require("path");

const deleteCourse = async (req, res) => {
  const courseId = req.params._id;

  try {

    const foundCourse = await course.findById(courseId);
    
    if (!foundCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    const deleted = await course.deleteOne({ _id: courseId });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (
      foundCourse.img &&
      typeof foundCourse.img === "string" &&
      foundCourse.img !== "null" &&
      foundCourse.img !== ""
    ) {
      const imagePath = path.join(__dirname, "../uploads", foundCourse.img);
      
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Failed to remove course image:", err);
        }
      });
    }

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (_) {
    return res.status(500).json({ error: "Failed to delete course" });
  }
};

module.exports = deleteCourse;