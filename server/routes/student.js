const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const addStudentController = require("../controllers/addStudentController.js");
const updateStudentController = require("../controllers/updateStudentController.js");
const getStudentController = require("../controllers/getStudentController.js");
const deleteStudentController = require("../controllers/deleteStudentController.js");
const authentication = require("../middlewares/authMiddleware.js");
const getFeesController = require("../controllers/getFeesController.js");
const getPendingEnrollmentsController = require("../controllers/getPendingEnrollmentsController.js");
const confirmAdmissionController = require("../controllers/confirmAddmissionController.js");
const rejectAdmissionController = require("../controllers/rejectAdmissionController.js")

const student = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const field = file.fieldname;
    const ext = path.extname(file.originalname);
    const currTime = Date.now();
    cb(null, `${field}_${currTime}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
      return cb(new Error("Only JPG, JPEG, and PNG files are allowed."), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadFields = upload.fields([
  { name: "studentPhoto", maxCount: 1 },
  { name: "aadharCardFront", maxCount: 1 },
  { name: "aadharCardBack", maxCount: 1 },
  { name: "panCardPhoto", maxCount: 1 },
]);

const {
  isNonEmptyString,
  isEmail,
  isMobile,
  isDateValid,
  isNullOrUndefined,
} = require("../utils/validation.js");

const addStudentMiddleware = async (req, res, next) => {
  function parseNumber(val) {
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.trim() !== "" && !isNaN(val)) {
      return Number(val);
    }
    return 0;
  }

  const {
    firstName,
    lastName,
    email,
    registrationDate,
    course,
    mobileNumber,
    gender,
    parentName,
    dateOfBirth,
    panCard,
    aadharCard,
    residenceAddress,
    parentMobile,
    program,
  } = req.body;

  const paid = 0;
  const pending = parseNumber(req.body.pending);
  const total = parseNumber(req.body.total);

  if (
    !isNonEmptyString(firstName) ||
    !isNonEmptyString(lastName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(course) ||
    !isNonEmptyString(mobileNumber) ||
    !isNonEmptyString(gender) ||
    !isNonEmptyString(program) ||
    !isEmail(email) ||
    !isMobile(mobileNumber) ||
    !isDateValid(dateOfBirth)
  ) {
    return res.status(400).json({ message: "Bad data" });
  }

  if (!registrationDate || isNaN(Date.parse(registrationDate))) {
    return res.status(400).json({ message: "Invalid registration date" });
  }
  if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
    return res.status(400).json({ message: "Invalid date of birth" });
  }

  const numericFields = { paid, pending, total };
  for (const [key, value] of Object.entries(numericFields)) {
    if (typeof value !== "number" || isNaN(value) || value < 0) {
      return res
        .status(400)
        .json({ message: `${key} must be a non-negative number` });
    }
  }

  const programOptions = ["certification", "diploma", "master diploma"];
  const genderOptions = ["male", "female"];

  if (!programOptions.includes(program)) {
    return res.status(400).json({ message: "Invalid program" });
  }

  if (gender && !genderOptions.includes(gender)) {
    return res.status(400).json({ message: "Bad Data" });
  }

  const allowedFields = [
    "studentPhoto",
    "aadharCardFront",
    "aadharCardBack",
    "panCard",
  ];

  for (const field of allowedFields) {
    if (req.files && req.files[field]) {
      const file = req.files[field][0];
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: `${field} must be a JPG or PNG image.` });
      }
    }
  }

  req.body = {
    firstName,
    lastName,
    email,
    registrationDate,
    course,
    mobileNumber,
    gender,
    parentName,
    parentMobile,
    dateOfBirth,
    panCard,
    aadharCard,
    residenceAddress,
    paid,
    program,
    pending,
    total,
  };

  next();
};

const updateStudentMiddleware = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    course,
    program,
    mobileNumber,
    parentName,
    parentMobile,
    dateOfBirth,
    panCard,
    aadharCard,
    residenceAddress,
  } = req.body;

  const programOptions = ["diploma", "master diploma", "certification"];

  if (
    !isNonEmptyString(firstName) ||
    !isNonEmptyString(lastName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(course) ||
    !isNonEmptyString(program) ||
    !isNonEmptyString(mobileNumber) ||
    !isEmail(email) ||
    !isMobile(mobileNumber) ||
    !programOptions.includes(program)
  ) {
    return res.status(400).json({ message: "Bad data" });
  }

  if (dateOfBirth && isNaN(Date.parse(dateOfBirth))) {
    return res.status(400).json({ message: "Invalid date of birth" });
  }

  if (
    (panCard && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard)) ||
    (aadharCard && !/^\d{12}$/.test(aadharCard)) ||
    (residenceAddress && !isNonEmptyString(residenceAddress)) ||
    (parentMobile && !isMobile(parentMobile)) ||
    (parentName && !isNonEmptyString(parentName))
  ) {
    return res.status(400).json({ message: "Invalid Data" });
  }

  const allowedFields = [
    "studentPhoto",
    "aadharCardFront",
    "aadharCardBack",
    "panCardPhoto",
  ];
  for (const field of allowedFields) {
    if (req.files && req.files[field]) {
      const file = req.files[field][0];
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: `${field} must be a JPG or PNG image.` });
      }
    }
  }

  next();
};

const deleteStudentMiddleware = async (req, res, next) => {
  const { _id } = req.query;

  if (!_id || isNullOrUndefined(_id) || !isNonEmptyString(_id)) {
    return res.status(400).json({ error: "Id is required" });
  } else {
    next();
  }
};

const getFeesMiddleware = async (req, res, next) => {
  const { id } = req.query;

  if (mongoose.isValidObjectId(id)) {
    next();
  } else {
    return res.status(400).json({ message: "Invalid ID" });
  }
};

const confirmAdmissionMiddleware = async (req, res, next) => {
  const { _id, courseId, program } = req.body;

  if (!_id || !courseId || !program) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!mongoose.isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  if (!mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  if (!["certification", "diploma", "master diploma"].includes(program)) {
    return res.status(400).json({ message: "Invalid program" });
  }

  next();
};

const rejectAdmissionMiddleware = async (req, res, next) => {
  const { _id } = req.body;

  if (!_id || !mongoose.isValidObjectId(_id)) {
    return res.status(400).json({ message: "Invalid student Id" });
  }
  next();
};

student.post(
  "/add",
  authentication,
  uploadFields,
  addStudentMiddleware,
  addStudentController
);

student.get("/get", authentication, getStudentController);

student.get("/fees", authentication, getFeesMiddleware, getFeesController);

student.get(
  "/pending-enrollments",
  authentication,
  getPendingEnrollmentsController
);

student.put(
  "/update",
  authentication,
  uploadFields,
  updateStudentMiddleware,
  updateStudentController
);

student.put(
  "/confirm-addmission",
  authentication,
  confirmAdmissionMiddleware,
  confirmAdmissionController
);
student.put("/reject-addmission", authentication, rejectAdmissionMiddleware, rejectAdmissionController);

student.delete(
  "/drop",
  authentication,
  deleteStudentMiddleware,
  deleteStudentController
);

module.exports = student;
