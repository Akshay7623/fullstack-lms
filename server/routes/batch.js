const express = require("express");
const batch = express.Router();
const addBatchController = require("../controllers/addBatchController.js");
const updateBatchController = require("../controllers/updateBatchController.js");
const getBatchController = require("../controllers/getBatcheController.js");
const authentication = require("../middlewares/authMiddleware.js");
const updateStatusController = require("../middlewares/updateStatusController.js");
const assignBatchController = require("../controllers/assignBatchController.js");
const getStudentsInBatchController = require("../controllers/getStudentsInBatchController.js");

const {
  ALLOWED_MONTHS,
  ALLOWED_SCHEDULES,
  ALLOWED_STATUSES,
} = require("./constants.js");

const {
  isNonEmptyString,
  isDateValid,
  isPositiveNumber,
  isValidObjectId,
} = require("../utils/validation.js");

const mongoose = require("mongoose");

const addBatchMiddleware = async (req, res, next) => {
  const {
    month,
    year,
    courseName,
    courseCode,
    batchNumber,
    tentativeStartDate,
    classType,
  } = req.body;

  if (
    !isPositiveNumber(year) ||
    !isPositiveNumber(batchNumber) ||
    !isDateValid(tentativeStartDate) ||
    !ALLOWED_SCHEDULES.includes(classType) ||
    !ALLOWED_MONTHS.includes(month) ||
    !isNonEmptyString(courseCode) ||
    !isNonEmptyString(courseName)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid or missing required fields." });
  }
  next();
};

const updateBatchMiddleware = async (req, res, next) => {
  const { _id } = req.body;

  if (!isValidObjectId(_id)) {
    return res.status(400).json({ message: "Valid batch ID is required." });
  }

  next();
};

const assignBatchMiddleware = async (req, res, next) => {
  const { _ids, batch } = req.body;

  if (
    !Array.isArray(_ids) ||
    _ids.length === 0 ||
    _ids.some((id) => !mongoose.isValidObjectId(id)) ||
    !isNonEmptyString(batch)
  ) {
    return res.status(400).json({ message: "Invalid student id or data" });
  }

  next();
};

const updateStatusMiddleware = async (req, res, next) => {
  const { _id, status } = req.body;

  if (!isValidObjectId(_id) && ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ messsage: "Invalid data" });
  } else {
    next();
  }
};

const getStudentsInBatchMiddleware = (req, res, next) => {
  const { batchCode } = req.params;

  if (!isNonEmptyString(batchCode)) {
    return res.status(400).json({ message: "Batch code is required" });
  }

  next();
};

batch.post("/add", authentication, addBatchMiddleware, addBatchController);
batch.put(
  "/update",
  authentication,
  updateBatchMiddleware,
  updateBatchController
);

batch.put(
  "/assignbatch",
  authentication,
  assignBatchMiddleware,
  assignBatchController
);

batch.put(
  "/update_status",
  authentication,
  updateStatusMiddleware,
  updateStatusController
);

batch.get("/get", authentication, getBatchController);

batch.get(
  "/get/students/:batchCode",
  authentication,
  getStudentsInBatchMiddleware,
  getStudentsInBatchController
);

module.exports = batch;
