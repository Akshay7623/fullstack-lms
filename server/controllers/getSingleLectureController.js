const Lecture = require("../models/lectureSchedule");
const Student = require("../models/student");
const Batch = require("../models/batch");
const Trainer = require("../models/trainer");

const getSingleLecture = async (req, res) => {
  const { lectureId } = req.params;
  const data = await Lecture.findById(lectureId);

  if (data) {
    const {
      plannedDate,
      lectureTopic,
      trainerId,
      startTime,
      recordLink,
      batchId,
      endTime,
    } = data;

    const bData = await Batch.findById(batchId);
    let trainerData;
    let trainerName = "";

    if (trainerId) {
      trainerData = await Trainer.findById(trainerId);
    }

    if (bData) {
      const BatchCode = `${bData.month.slice(0, 3).toUpperCase()}${
        bData.year
      }-${bData.courseCode}-${bData.batchNo}`;
      const mails = await Student.find({ batch: BatchCode }, "email");

      if (trainerData) {
        trainerName = `${trainerData.firstName} ${trainerData.lastName}`;
      }

      return res.status(200).json({
        lectureInfo: {
          student_emails: mails.map((email) => email.email),
          trainer_email : trainerData? trainerData.email : "",
          topic: lectureTopic,
          date: plannedDate,
          start: startTime,
          end: endTime,
          link: recordLink,
          faculty: trainerName,
        },
      });
    } else {
      return res.status(400).json({ message: "Batch Not Found !" });
    }
  } else {
    return res.status(404).json({ message: "Lecture not found !" });
  }
};

module.exports = getSingleLecture;