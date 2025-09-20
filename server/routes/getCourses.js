const express = require("express");
const Course = require("../models/course.js");

const getCoursesRouter = express.Router();

getCoursesRouter.get("/", async (req, res) => {
  try {
    const courses = await Course.find({},"_id code name");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = getCoursesRouter;