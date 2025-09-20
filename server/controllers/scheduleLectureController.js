const Batch = require("../models/batch");
const Lecture = require("../models/lectureSchedule");
const Trainer = require("../models/trainer");
const Course = require("../models/course");

const scheduleLecture = async (req, res) => {
  try {
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
    const batchData = await Batch.findById(batchId);

    if (!batchData) {
      return res.status(404).json({ message: "Batch does not exist" });
    }

    let trainerData = null;
    if (trainerId) {
      trainerData = await Trainer.findById(trainerId);

      if (!trainerData) {
        return res.status(404).json({ message: "Trainer does not exist" });
      }
    }

    if (type === "reschedule") {
      const lectureData = await Lecture.findById(_id);
      if (!lectureData) {
        return res
          .status(404)
          .json({ message: "Lecture not availabble to reschedule" });
      }

      if (rearrangeAll) {
        const upcomingLectures = await Lecture.find({
          batchId: batchId,
          plannedDate: { $gt: lectureData.plannedDate },
          status: { $ne: "cancelled" },
          holidayName: { $in: [null, ""] },
        }).sort({ plannedDate: 1 });

        for (let i = 0; i < upcomingLectures.length - 1; i++) {
          upcomingLectures[i].lectureTopic =
            upcomingLectures[i + 1].lectureTopic;
          upcomingLectures[i].recordLink = upcomingLectures[i + 1].recordLink;
          upcomingLectures[i].trainerName = upcomingLectures[i + 1].trainerName;
          upcomingLectures[i].trainerId = upcomingLectures[i + 1].trainerId;
          upcomingLectures[i].startTime = upcomingLectures[i + 1].startTime;
          upcomingLectures[i].endTime = upcomingLectures[i + 1].endTime;
          await upcomingLectures[i].save();
        }

        await Lecture.findByIdAndDelete(
          upcomingLectures[upcomingLectures.length - 1]._id
        );
      }

      lectureData.plannedDate = new Date(date);
      lectureData.trainerId = trainerId || "";
      lectureData.trainerName = trainerData
        ? `${trainerData.firstName} ${trainerData.lastName}`
        : "";
      lectureData.lectureTopic = topic;
      lectureData.startTime = startTime;
      lectureData.status = "scheduled";
      lectureData.cancellationReason = "";
      lectureData.isCancelled = false;
      lectureData.endTime = endTime;
      await lectureData.save();

      return res.status(200).json({
        message: "Lecture rescheduled successfully",
        data: lectureData,
      });
    } else {
      const course = await Course.findOne({ code: batchData.courseCode });

      if (!course) {
        return res.status(404).json({ message: "Course not found !" });
      }

      const lecture = new Lecture({
        plannedDate: date,
        lectureTopic: topic,
        trainerName: trainerData
          ? `${trainerData.firstName} ${trainerData.lastName}`
          : "",
        startTime: startTime,
        endTime: endTime,
        trainerId: trainerId,
        recordLink: recordLink,
        batchId: batchId,
        courseName: batchData.courseName,
        courseId: course._id,
      });

      const newLecture = await lecture.save();
      return res.status(200).json({ message: "Lecture added successfully", data: newLecture });
    }
  } catch (Err) {
    console.log("Err while adding the lecture", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = scheduleLecture;