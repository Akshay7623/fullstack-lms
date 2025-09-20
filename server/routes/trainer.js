const express = require("express");
const mongoose = require("mongoose");
const authentication = require("../middlewares/authMiddleware.js");
const addTrainerController = require("../controllers/addTrainerController.js");
const getTrainerController = require("../controllers/getTrainerController.js");
const updateTrainerController = require("../controllers/updateTrainerController.js");
const upload = require("../utils/upload.js");
const getSingleTrainerController = require("../controllers/getSingleTrainerController.js");

const trainer = express.Router();

const addTrainerMiddleware = async (req, res, next) => {
  const {
    firstName,
    lastName,
    mobileNumber,
    email,
    city,
    state,
    registrationDate,
    course,
    gender,
    dateOfBirth,
    panCard,
    govtIdType,
    govtId,
    modules,
    rate,
  } = req.body;

  const requiredFields = {
    firstName,
    lastName,
    mobileNumber,
    email,
    city,
    state,
    registrationDate,
    course,
    gender,
    dateOfBirth,
    rate,
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || (typeof value === "string" && !value.trim())) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\d{10}$/;
  const rateRegex = /^\d+(\.\d{1,2})?$/;

  if (
    !emailRegex.test(email) ||
    !mobileRegex.test(mobileNumber) ||
    !rateRegex.test(rate)
  ) {
    return res.status(400).json({ message: "Invalid data" });
  }

  if (panCard && panCard.trim()) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
    if (!panRegex.test(panCard.trim())) {
      return res.status(400).json({
        message: "Invalid PAN format",
        label: "panCard",
      });
    }
  }

  if (govtIdType && !govtId) {
    return res.status(400).json({
      message:
        "Government ID number is required when a Govt ID type is selected",
      label: "govtId",
    });
  }

  if (typeof modules === "string") {
    req.body.modules = modules
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  if (req.files?.photo?.[0]) {
    const file = req.files.photo[0];
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Photo size must be less than 5MB",
        label: "photo",
      });
    }
  }

  if (req.files?.resume?.[0]) {
    const file = req.files.resume[0];
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Resume size must be less than 5MB",
        label: "resume",
      });
    }
  }

  if (req.files?.id_document?.[0]) {
    const file = req.files.id_document[0];
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "ID file size must be less than 5MB",
        label: "ID",
      });
    }
  }

  if (req.body.address) {
    req.body.address = req.body.address.trim().slice(0, 100);
  }

  if (req.body.professionalSummary) {
    req.body.professionalSummary = req.body.professionalSummary
      .trim()
      .slice(0, 300);
  }

  next();
};

const updateTrainerMiddleware = async (req, res, next) => {
  const {
    firstName,
    lastName,
    mobileNumber,
    email,
    city,
    state,
    course,
    gender,
    dateOfBirth,
    panCard,
    govtIdType,
    govtId,
    modules,
    rate,
    batches,
  } = req.body;

  const requiredFields = {
    firstName,
    lastName,
    mobileNumber,
    email,
    city,
    state,
    course,
    gender,
    dateOfBirth,
    rate,
  };

  for (const [field, value] of Object.entries(requiredFields)) {
    if (!value || (typeof value === "string" && !value.trim())) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\d{10}$/;
  const rateRegex = /^\d+(\.\d{1,2})?$/;

  if (
    !emailRegex.test(email) ||
    !mobileRegex.test(mobileNumber) ||
    !rateRegex.test(rate)
  ) {
    return res.status(400).json({ message: "Invalid data" });
  }

  if (panCard && panCard.trim()) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
    if (!panRegex.test(panCard.trim())) {
      return res.status(400).json({
        message: "Invalid PAN format",
        label: "panCard",
      });
    }
  }

  if (govtIdType && !govtId) {
    return res.status(400).json({
      message:
        "Government ID number is required when a Govt ID type is selected",
      label: "govtId",
    });
  }

  if (typeof modules === "string") {
    req.body.modules = modules
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  if (typeof batches === "string") {
    req.body.batches = batches
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
  }

  if (req.files?.photo?.[0]) {
    const file = req.files.photo[0];
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Photo size must be less than 5MB",
        label: "photo",
      });
    }
  }

  if (req.files?.resume?.[0]) {
    const file = req.files.resume[0];
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Resume size must be less than 5MB",
        label: "resume",
      });
    }
  }

  if (req.files?.id_document?.[0]) {
    const file = req.files.id_document[0];
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "ID file size must be less than 5MB",
        label: "ID",
      });
    }
  }

  if (req.body.address) {
    req.body.address = req.body.address.trim().slice(0, 100);
  }

  if (req.body.professionalSummary) {
    req.body.professionalSummary = req.body.professionalSummary
      .trim()
      .slice(0, 300);
  }

  next();
};

const getSingleTrainerMiddlware = async (req, res, next) => {
  const { trainerId } = req.query;

  if (!mongoose.isValidObjectId(trainerId)) {
    return res.status(400).json({ message: "Invalid trainer id !" });
  }

  next();
};

trainer.get("/get", authentication, getTrainerController);

trainer.get("/get-trainer", authentication, getSingleTrainerMiddlware, getSingleTrainerController);

trainer.post(
  "/add",
  authentication,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "id_document", maxCount: 1 },
  ]),
  addTrainerMiddleware,
  addTrainerController
);

trainer.put(
  "/update",
  authentication,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "id_document", maxCount: 1 },
  ]),
  updateTrainerMiddleware,
  updateTrainerController
);

module.exports = trainer;
