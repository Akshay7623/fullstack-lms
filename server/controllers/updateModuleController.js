const Module = require("../models/course");
const fs = require("fs");
const path = require("path");

const updateCourseController = async (req, res) => {
  try {
    const { _id, name, code, duration, status, prices, details } = req.body;

    let parsedPrices = prices;
    if (typeof prices === "string") {
      try {
        parsedPrices = JSON.parse(prices);
      } catch (e) {
        return res.status(400).json({ message: "Invalid prices format" });
      }
    }

    const imageFileName = req.file ? req.file.filename : req.body.existingImage;

    if (!_id) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const oldCourse = await Course.findOne({ _id: _id });

    if (!oldCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    let newImg = oldCourse.img;

    if (
      (!imageFileName || imageFileName === "null" || imageFileName === "") &&
      oldCourse.img &&
      typeof oldCourse.img === "string" &&
      oldCourse.img !== "null" &&
      oldCourse.img !== ""
    ) {
      const oldImagePath = path.join(__dirname, "../uploads", oldCourse.img);

      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== "ENOENT") {
          console.error("Failed to remove old image:", err);
        }
      });

      newImg = "";
    }

    else if (imageFileName && imageFileName !== oldCourse.img) {
      newImg = imageFileName;
      if (
        req.file &&
        oldCourse.img &&
        typeof oldCourse.img === "string" &&
        oldCourse.img !== "null" &&
        oldCourse.img !== ""
      ) {
        const oldImagePath = path.join(__dirname, "../uploads", oldCourse.img);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== "ENOENT") {
            console.error("Failed to remove old image:", err);
          }
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      _id,
      {
        name,
        code,
        duration,
        status,
        prices: parsedPrices,
        details,
        img: newImg,
      },
      { new: true, lean: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateCourseController;