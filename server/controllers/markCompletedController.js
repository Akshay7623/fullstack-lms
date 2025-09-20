const Lecture = require("../models/lectureSchedule");
const Trainer = require("../models/trainer");
const TrainerPayment = require("../models/trainerPayment");

function getTotalHours(startTime, endTime) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let start = startHour * 60 + startMinute;
  let end = endHour * 60 + endMinute;
  if (end < start) end += 24 * 60;
  return ((end - start) / 60).toFixed(2);
}

const markCompleted = async (req, res) => {
  const { lectureId, startTime, endTime } = req.body;

  try {
    const lectureInfo = await Lecture.findById(lectureId);
    
    if (lectureInfo.status === "completed") {
      return res
        .status(301)
        .json({ message: "Lecture is already marked as completed" });
    }

    if (!lectureInfo) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const trainerId = lectureInfo.trainerId;
    const trainerInfo = await Trainer.findById(trainerId);

    if (!trainerInfo) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    const lectureHour = Number(getTotalHours(startTime, endTime));

    const amount = trainerInfo.rate ? trainerInfo.rate * lectureHour : 0;

    lectureInfo.startTime = startTime;
    lectureInfo.endTime = endTime;
    lectureInfo.status = "completed";
    await lectureInfo.save();

    await TrainerPayment.create({
      firstName: trainerInfo.firstName,
      lastName: trainerInfo.lastName,
      trainerId: trainerInfo._id,
      lectureDate: lectureInfo.plannedDate,
      lectureTopic: lectureInfo.lectureTopic,
      amount,
      lectureHour,
      updatedAt:new Date(),
      status: "pending",
    });

    return res
      .status(200)
      .json({
        message:
          "Lecture marked as completed and payment record added successfully",
      });
  } catch (Err) {
    console.log("Error while updating lecture and adding payment:", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = markCompleted;
