const express = require("express");
const authentication = require("../middlewares/authMiddleware.js");
const { isNullOrUndefined, isNonEmptyString } = require("../utils/validation.js");
const onboradingController = require('../controllers/onboradingController.js');

const onboard = express.Router();

const updateTrainerMiddleware = async (req, res, next) => {
  const { _id, onBoarding } = req.body;

  const onboardOptions = ["Ringing", "Message Sent", "Done"];

  if (
    (!isNullOrUndefined(_id) ||
      !isNullOrUndefined(onBoarding) ||
      !isNonEmptyString(_id) ||
      !isNonEmptyString(onBoarding)) &&
    !onboardOptions.includes(onBoarding)
  ) {
    return res.status(400).json({ message: "Bad Data" });
  }

  next();
};

onboard.put("/update", authentication, updateTrainerMiddleware, onboradingController);

module.exports = onboard;
