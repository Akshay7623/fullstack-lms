const Batch = require("../models/batch");
const Lecture = require("../models/lectureSchedule");
const Trainer = require("../models/trainer");
const Course = require("../models/course");

const addBatchController = async (req, res) => {
  const {
    month,
    year,
    courseName,
    courseCode,
    batchNumber,
    tentativeStartDate,
    classType,
    lectures,
  } = req.body;

  const existing = await Batch.findOne({
    courseCode,
    batchNo: batchNumber,
    month,
    year,
  });

  const course = await Course.findOne({ code: courseCode });

  if (!course) {
    return res.status(404).json({ message: "Course not found." });
  }

  const courseId = course._id.toString();

  if (existing) {
    return res.status(409).json({
      message:
        "Batch with the same course code, batch no, month and year already exists.",
    });
  }

  const batch = new Batch({
    month,
    year,
    courseName,
    courseCode,
    batchNo: batchNumber,
    startDate: tentativeStartDate,
    batchClassSchedule:classType,
    status: "active",
  });

  let savedBatch;
  try {
    savedBatch = await batch.save();
  } catch (err) {
    return res.status(500).json({ message: "Failed to save batch." });
  }

  const batchId = savedBatch._id;

  const trainers = await Trainer.find({}, "_id firstName lastName");
  const trainerMap = new Map();

  trainers.forEach((t) => {
    trainerMap.set(t._id.toString(), `${t.firstName} ${t.lastName}`);
  });

  const validatedLectures = [];
  const lectureErrors = [];

  lectures.forEach((lec, i) => {
    const start = new Date(lec.startTime);
    const end = new Date(lec.endTime);

    if (isNaN(start) || isNaN(end)) {
      lectureErrors.push({
        row: i + 1,
        error: "Invalid start or end time format.",
      });
      return;
    }

    if (start >= end) {
      lectureErrors.push({
        row: i + 1,
        error: "Start time must be before end time.",
      });
      return;
    }

    const trainerId = lec.trainer;
    const trainerName = trainerMap.get(trainerId) || "";
    const isValidTrainer = trainerMap.has(trainerId);

    validatedLectures.push({
      lectureTopic: lec.topic || "",
      plannedDate: lec.date,

      startTime: start.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),

      endTime: end.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      trainerId: isValidTrainer ? trainerId : "",
      trainerName: isValidTrainer ? trainerName : "",
      courseId: courseId,
      courseName,
      batchId,
      recordLinks: [],
      documents: [],
      isCancelled: false,
      cancellationReason: "",
      status: "scheduled",
      holidayName: lec.holidayName,
    });
  });

  if (lectureErrors.length > 0) {
    return res
      .status(400)
      .json({ message: "Lecture validation failed", errors: lectureErrors });
  }

  try {
    await Lecture.insertMany(validatedLectures);
    return res
      .status(201)
      .json({
        message: "Batch and lectures added successfully.",
        data: savedBatch,
      });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save lectures." });
  }
};

module.exports = addBatchController;
