const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/authMiddleware.js");
const updateEmailPreferenceController = require("../controllers/updateEmailPreferenceController.js");
const getEmailPreferenceController = require("../controllers/getEmailPreferenceController.js");
const getKeyController = require("../controllers/getKeyController.js");
const updateKeyController = require("../controllers/updateKeyController.js");
const { isNonEmptyString } = require("../utils/validation.js");

const updateEmailPreferenceMiddleware = (req, res, next) => {
  const ALLOWED_METHOS = [
    "emailOnTimeChange",
    "emailOnTrainerAssign",
    "emailOnLectureCancel",
    "emailOnLectureReschedule"
  ];
  const { preferenceType } = req.body;

  if (ALLOWED_METHOS.includes(preferenceType)) {
    next();
  } else {
    return res.status(400).json({ message: "Invalid method given" });
  }
};

const upateKeyMiddleware = (req, res, next) => {
  const { keyType, value } = req.body;

  if (!["razorpaySecret", "razorpayKey"].includes(keyType)) {
    return res.status(400).json({ message: "Key type not given" });
  }

  if (!isNonEmptyString(value)) {
    return res.status(400).json({ message: "Invalid value given" });
  }

  next();
};

router.get("/get/key", authentication, getKeyController);

router.get(
  "/get/email_preference",
  authentication,
  getEmailPreferenceController
);

router.put(
  "/update/key",
  authentication,
  upateKeyMiddleware,
  updateKeyController
);

router.put(
  "/update/email_preference",
  authentication,
  updateEmailPreferenceMiddleware,
  updateEmailPreferenceController
);

module.exports = router;
