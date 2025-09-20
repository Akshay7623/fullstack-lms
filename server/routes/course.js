const express = require("express");
const multer = require("multer");

const addCourseController = require("../controllers/addCourseController.js");
const updateCourseController = require("../controllers/updateCourseController.js");
const getCourseController = require("../controllers/getCourseController.js");
const deleteCourseController = require("../controllers/deleteCourseController.js");
const authentication = require("../middlewares/authMiddleware.js");
const { isNonEmptyString } = require("../utils/validation.js");

const course = express.Router();

const addCourseMiddleware = async (req, res, next) => {
  const { name, code, duration, status, details } = req.body;

  if (req.body && req.body.prices && typeof req.body.prices === "string") {
    try {
      req.body.prices = JSON.parse(req.body.prices);
    } catch (e) {
      return res.status(400).json({ message: "Invalid prices format" });
    }
  }

  if (
    !isNonEmptyString(name) ||
    !isNonEmptyString(code) ||
    !isNonEmptyString(duration) ||
    !isNonEmptyString(status)
  ) {
    return res.status(400).json({ message: "Bad data" });
  }

  if (
    !req.body.prices ||
    typeof req.body.prices !== "object" ||
    isNaN(Number(req.body.prices.certification)) ||
    isNaN(Number(req.body.prices.diploma)) ||
    isNaN(Number(req.body.prices.masterDiploma))
  ) {
    return res.status(400).json({ message: "Invalid prices" });
  }

  next();
};

const updateCourseMiddleware = async (req, res, next) => {
  const { _id, name, code, duration, status, details } = req.body;

  if (req.body && req.body.prices && typeof req.body.prices === "string") {
    try {
      req.body.prices = JSON.parse(req.body.prices);
    } catch (e) {
      return res.status(400).json({ message: "Invalid prices format" });
    }
  }

  if (
    !isNonEmptyString(_id) ||
    !isNonEmptyString(name) ||
    !isNonEmptyString(code) ||
    !isNonEmptyString(duration) ||
    !isNonEmptyString(status)
  ) {
    return res.status(400).json({ message: "Bad data" });
  }

  if (
    !req.body.prices ||
    typeof req.body.prices !== "object" ||
    isNaN(Number(req.body.prices.certification)) ||
    isNaN(Number(req.body.prices.diploma)) ||
    isNaN(Number(req.body.prices.masterDiploma))
  ) {
    return res.status(400).json({ message: "Invalid prices" });
  }

  next();
};

const deleteCourseMiddleware = async (req, res, next) => {
  const courseId = req.params._id;

  if (!courseId) {
    return res.status(400).json({ message: "Course id required" });
  }
  next();
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

course.get("/get", authentication, getCourseController);

course.post(
  "/add",
  authentication,
  upload.single("img"),
  addCourseMiddleware,
  addCourseController
);
course.put(
  "/update",
  authentication,
  upload.single("img"),
  updateCourseMiddleware,
  updateCourseController
);
course.delete("/delete/:_id", deleteCourseMiddleware, deleteCourseController);

module.exports = course;
