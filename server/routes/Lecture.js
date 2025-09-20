const express = require("express");
const mongoose = require("mongoose");
const authentication = require("../middlewares/authMiddleware");
const { isNonEmptyString } = require("../utils/validation.js");
const getLectureController = require("../controllers/getLectureController.js");
const updateTimeController = require("../controllers/updateTimeController.js");
const getSingleLectureController = require("../controllers/getSingleLectureController.js");
const assignTrainerController = require("../controllers/assignTrainerController.js");
const sendMail = require("../controllers/sendMail.js");
const cancelLectureController = require("../controllers/cancelLectureController.js");
const scheduleLectureController = require("../controllers/scheduleLectureController.js");
const editTopicController = require("../controllers/editTopicController.js");
const deleteLectureController = require("../controllers/deleteLectureController.js");
const updateDateController = require("../controllers/updateDateController.js");
const markCompletedController = require("../controllers/markCompletedController.js");

const lecture = express.Router();

const getLectureMiddleware = (req, res, next) => {
  const { page = 1, pageSize = 10, type } = req.query;

  if (isNaN(page) || isNaN(pageSize) || page < 0 || pageSize < 0 && !["all","upcoming","complete"].includes(type)) {
    return res.status(400).json({ error: "Invalid data" });
  } else {
    next();
  }
};

const updateTimeMiddleware = (req, res, next) => {
  const { time, lectureId } = req.body;

  if (!mongoose.isValidObjectId(lectureId)) {
    return res.status(400).josn({ message: "Invalid data" });
  }

  if (
    !time ||
    typeof time !== "object" ||
    !time.start ||
    !time.end ||
    !/^\d{2}:\d{2}$/.test(time.start) ||
    !/^\d{2}:\d{2}$/.test(time.end)
  ) {
    return res.status(400).json({ message: "Invalid or missing time format" });
  }

  const [startHour, startMinute] = time.start.split(":").map(Number);
  const [endHour, endMinute] = time.end.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    return res
      .status(400)
      .json({ message: "End time must be after start time" });
  }

  next();
};

const getSingleLectureMiddleware = (req, res, next) => {
  const { lectureId } = req.params;

  if (!mongoose.isValidObjectId(lectureId)) {
    return res.status(400).json({ message: "Invalid data" });
  }
  next();
};

const sendMailMiddleware = (req, res, next) => {
  const { emails, body, subject } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ message: "No recipients provided." });
  }

  if (!subject || typeof subject !== "string" || subject.trim() === "") {
    req.body.subject = "";
  }

  if (!body || typeof body !== "string" || body.trim() === "") {
    return res.status(400).json({ message: "Email body is required." });
  }

  const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = emails.filter((email) => !validEmailRegex.test(email));

  if (invalidEmails.length > 0) {
    return res
      .status(400)
      .json({ message: "Some email addresses are invalid.", invalidEmails });
  }

  next();
};

const assignTrainerMiddleware = (req, res, next) => {
  const { lectureId, trainerId } = req.body;

  if (
    !mongoose.isValidObjectId(lectureId) ||
    !mongoose.isValidObjectId(trainerId)
  ) {
    return res.status(400).json({ message: "Invalid lectureId or trainerId" });
  }

  next();
};

const cancelLectureMiddleware = (req, res, next) => {
  const { lectureId, reason, reschedule } = req.body;

  if (!mongoose.isValidObjectId(lectureId)) {
    return res.status(400).json({ message: "Invalid lecture id" });
  }

  if (!isNonEmptyString(reason)) {
    return res.status(400).json({ message: "Reason is required!" });
  }

  if (typeof reschedule != "boolean") {
    return res.status(400).json({ message: "Invalid data given" });
  }

  next();
};

const scheduleLectureMiddleware = (req, res, next) => {
  const {
    _id,
    batchId,
    date,
    type,
    trainerId,
    topic,
    startTime,
    endTime,
    rearrangeAll,
    recordLink,
  } = req.body;
  const timeRegex = /^\d{2}:\d{2}$/;

  if (_id && !mongoose.isValidObjectId(_id)) {
    return res.status(400).json({ message: "Lecture id is required." });
  }

  if (
    recordLink &&
    typeof recordLink === "string" &&
    recordLink.trim() !== ""
  ) {
    try {
      new URL(recordLink);
    } catch {
      return res.status(400).json({ error: "Invalid recording link URL." });
    }
  }

  if (!type || !["reschedule", "add"].includes(type)) {
    return res
      .status(400)
      .json({ message: "Type must be 'reschedule' or 'add'." });
  }

  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ message: "Valid date is required." });
  }

  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return res.status(400).json({ message: "Valid batchId is required." });
  }

  if (!topic || typeof topic !== "string" || topic.trim().length < 1) {
    return res.status(400).json({ message: "Topic is required." });
  }

  if (!startTime || !timeRegex.test(startTime)) {
    return res
      .status(400)
      .json({ message: "Valid startTime (HH:mm) is required." });
  }
  if (!endTime || !timeRegex.test(endTime)) {
    return res
      .status(400)
      .json({ message: "Valid endTime (HH:mm) is required." });
  }

  if (trainerId && !mongoose.isValidObjectId(trainerId)) {
    return res
      .status(400)
      .json({ message: "trainerId must be a valid ObjectId if provided." });
  }

  if (
    typeof rearrangeAll !== "undefined" &&
    typeof rearrangeAll !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "rearrangeAll must be true or false." });
  }

  next();
};

const EditTopicMiddleware = (req, res, next) => {
  const { lectureId, topic } = req.body;

  if (!mongoose.isValidObjectId(lectureId)) {
    return res.status(400).json({ message: "Invalid lecture id given" });
  }

  if (!topic || typeof topic !== "string" || topic.trim().length < 1) {
    return res.status(400).json({ message: "Topic is required." });
  }

  next();
};

const updateDateMiddleware = (req, res, next) => {
  const { lectureId, newDate } = req.body;

  if (!mongoose.isValidObjectId(lectureId)) {
    return res.status(400).json({ message: "lecture id is required" });
  }

  const parsedDate = Date.parse(newDate);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ message: "Date is invalid." });
  }

  next();
};

const deleteLectureMiddleware = (req, res, next) => {
  const { lectureId } = req.params;

  if (!mongoose.isValidObjectId(lectureId)) {
    return res.status(400).json({ message: "Invalid Lecture id is given" });
  }

  next();
};

const markCompletedMiddleware = (req, res, next) => {
  const { lectureId, startTime, endTime } = req.body;
  
  if(!mongoose.isObjectIdOrHexString(lectureId)) {
    return res.status(400).json({ message:"Invalid lecture id" })
  }

  const timeRegex = /^\d{2}:\d{2}$/;

  if (!startTime || !timeRegex.test(startTime)) {
    return res.status(400).json({ message: "Valid startTime (HH:mm) is required." });
  }

  if (!endTime || !timeRegex.test(endTime)) {
    return res.status(400).json({ message: "Valid endTime (HH:mm) is required." });
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    return res.status(400).json({ message: "End time must be after start time." });
  }

  next();
};

lecture.get("/get", authentication, getLectureMiddleware, getLectureController);

lecture.get(
  "/get_info/:lectureId",
  authentication,
  getSingleLectureMiddleware,
  getSingleLectureController
);

lecture.put(
  "/update_time",
  authentication,
  updateTimeMiddleware,
  updateTimeController
);

lecture.put(
  "/update_date",
  authentication,
  updateDateMiddleware,
  updateDateController
);

lecture.post("/send_mail", authentication, sendMailMiddleware, sendMail);

lecture.put(
  "/assign_trainer",
  authentication,
  assignTrainerMiddleware,
  assignTrainerController
);

lecture.put(
  "/cancel_lecture",
  authentication,
  cancelLectureMiddleware,
  cancelLectureController
);

lecture.put(
  "/edit_topic",
  authentication,
  EditTopicMiddleware,
  editTopicController
);

lecture.put(
  "/schedule_lecture",
  authentication,
  scheduleLectureMiddleware,
  scheduleLectureController
);

lecture.delete(
  "/delete/:lectureId",
  authentication,
  deleteLectureMiddleware,
  deleteLectureController
);

lecture.put("/mark_completed", authentication, markCompletedMiddleware, markCompletedController);

module.exports = lecture;