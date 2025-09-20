const express = require("express");
const trainerPayment = express.Router();
const authentication = require("../middlewares/authMiddleware");
const addTrainerPaymentController = require("../controllers/addTrainerPaymentController.js");
const getTrainerPaymentController = require("../controllers/getTrainerPaymentController.js");
const updateTrainerPaymentController = require("../controllers/updateTrainerPaymentController.js");

const {
  isPositiveNumber,
  isNullOrUndefined,
  isNonEmptyString,
  isDateValid,
  isNonEmptyArray,
} = require("../utils/validation.js");

const addTrainerPaymentMiddleware = async (req, res, next) => {
  const {
    firstName,
    lastName,
    trainerId,
    lectureDate,
    lectureTopic,
    amount,
    lectureHour,
    status,
  } = req.body;
  if (
    !isNullOrUndefined(firstName) ||
    !isNullOrUndefined(lastName) ||
    !isNullOrUndefined(trainerId) ||
    !isDateValid(lectureDate) ||
    !isNullOrUndefined(lectureTopic) ||
    !isNullOrUndefined(amount) ||
    !isNullOrUndefined(lectureHour) ||
    !isNonEmptyArray(status)
  ) {
    return res.status(400).json({ message: "Bad Data" });
  }
  next();
};
const updateTrainerPaymentMiddleware = async (req, res, next) => {
  const {
    _id,
    firstName,
    lastName,
    trainerId,
    lectureDate,
    lectureTopic,
    amount,
    lectureHour,
    status,
  } = req.body;
  if (!isNonEmptyString(_id)) {
    return res.status(400).json({ message: "Missing or invalid '_id'" });
  }

  // ✅ Check if at least one field is valid for update

  const hasValidUpdate =
    isNonEmptyString(firstName) ||
    isNonEmptyString(lastName) ||
    !isNullOrUndefined(trainerId) ||
    isDateValid(lectureDate) ||
    isNonEmptyString(lectureTopic) ||
    (!isNullOrUndefined(amount) && isPositiveNumber(amount)) ||
    !isNullOrUndefined(lectureHour) ||
    isNonEmptyString(status);

  if (!hasValidUpdate) {
    return res
      .status(400)
      .json({ message: "No valid fields provided for update" });
  }

  next();
};

const getTrainerPaymentMiddleware = async (req, res) => {
  const { perPage, pageNo } = req.query;
  if (isNaN(perPage) || isNaN(pageNo) || perPage < 1 || pageNo < 1) {
    return res.status(400).json({ message: "Bad Data" });
  } else {
    next();
  }
};

trainerPayment.post(
  "/add",
  authentication,
  addTrainerPaymentMiddleware,
  addTrainerPaymentController
);
trainerPayment.put(
  "/update/",
  updateTrainerPaymentMiddleware,
  updateTrainerPaymentController
);
trainerPayment.get(
  "/get",
  getTrainerPaymentMiddleware,
  getTrainerPaymentController
);
module.exports = trainerPayment;
