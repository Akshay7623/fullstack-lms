const Lecture = require("../models/lectureSchedule");
const Batch = require("../models/batch");
const holidays = require("../utils/Constants/holidays");

const holidayMap = new Map();

holidays.forEach((e) => holidayMap.set(e.date, e.name));

function formatDateLocal(date) {
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  const parts = new Intl.DateTimeFormat("en-CA", options).formatToParts(date);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;
  return `${year}-${month}-${day}`;
}

function getNextValidDate(startDate, classType) {
  let current = new Date(startDate);

  const isWeekend = (day) => day === 6 || day === 0;
  const isWeekday = (day) => !isWeekend(day);

  if (classType === "weekend") {
    while (true) {
      current.setDate(current.getDate() + 1);
      const dateStr = formatDateLocal(current);
      const day = current.getDay();
      const holidayName = holidayMap.get(dateStr) || null;

      if (holidayName) continue;
      if (isWeekend(day)) {
        return current;
      }
    }
  }

  if (classType === "daily") {
    while (true) {
      current.setDate(current.getDate() + 1);
      const dateStr = formatDateLocal(current);
      const day = current.getDay();
      const holidayName = holidayMap.get(dateStr) || null;
      console.log("date string is", dateStr);
      if (holidayName) continue;
      if (isWeekday(day)) {
        return current;
      }
    }
  }

  if (classType === "alternate") {
    while (true) {
      current.setDate(current.getDate() + 1);
      const dateStr = formatDateLocal(current);
      const day = current.getDay();
      const holidayName = holidayMap.get(dateStr) || null;

      if (holidayName) continue;

      if (isWeekday(day)) {
        return current;
      }
    }
  }
}

function getHolidays(startDate, endDate, classType) {
  const isWeekend = (day) => day === 6 || day === 0;
  let current = new Date(startDate);
  const holidays = [];

  while (current < endDate) {
    const day = current.getDay();
    const dateStr = formatDateLocal(current);

    if (holidayMap.has(dateStr)) {
      if (
        (classType === "weekend" && isWeekend(day)) ||
        (classType !== "weekend" && !isWeekend(day))
      ) {
        const utcDate = new Date(
          Date.UTC(current.getFullYear(), current.getMonth(), current.getDate())
        );
        holidays.push({ date: utcDate, holidayName: holidayMap.get(dateStr) });
      }
    }

    current.setDate(current.getDate() + 1);
  }
  return holidays;
}

const cancelLecture = async (req, res) => {
  try {
    const { lectureId, reason, reschedule } = req.body;
    const lectureData = await Lecture.findById(lectureId);

    if (lectureData) {
      const batchId = lectureData.batchId;
      const batchData = await Batch.findById(batchId);

      if (batchData) {
        await Lecture.findByIdAndUpdate(lectureId, {
          status: "cancelled",
          cancellationReason: reason,
          isCancelled: true,
        });

        if(reschedule) {

        const upcomingLectures = await Lecture.find({
          batchId: batchId,
          plannedDate: { $gt: lectureData.plannedDate },
          status: { $ne: "cancelled" },
          holidayName: { $in: [null, ""] },
        }).sort({ plannedDate: 1 });

        const originals = upcomingLectures.map((l) => ({
          id: l._id,
          topic: l.lectureTopic,
          trainerId: l.trainerId,
          trainerName: l.trainerName,
          startTime: l.startTime,
          endTime: l.endTime,
        }));

        let prevTopic = lectureData.lectureTopic;
        let prevTrainerId = lectureData.trainerId;
        let prevTrainerName = lectureData.trainerName;
        let prevStartTime = lectureData.startTime;
        let prevEndTime = lectureData.endTime;

        for (let i = 0; i < originals.length; i++) {
          await Lecture.findByIdAndUpdate(originals[i].id, {
            lectureTopic: prevTopic,
            trainerId: prevTrainerId,
            trainerName: prevTrainerName,
            startTime: prevStartTime,
            endTime: prevEndTime,
          });

          prevTopic = originals[i].topic;
          prevTrainerId = originals[i].trainerId;
          prevTrainerName = originals[i].trainerName;
          prevStartTime = originals[i].startTime;
          prevEndTime = originals[i].endTime;
        }

        let lastLecture;

        if (upcomingLectures.length === 0) {
          lastLecture = lectureData;
        } else {
          lastLecture = upcomingLectures[upcomingLectures.length - 1];
        }

        const nextDate = getNextValidDate(
          lastLecture.plannedDate,
          batchData.batchClassSchedule
        );

        const nextDateUTC = new Date(
          Date.UTC(
            nextDate.getFullYear(),
            nextDate.getMonth(),
            nextDate.getDate()
          )
        );

        await Lecture.create({
          batchId: batchId,
          plannedDate: nextDateUTC,
          holidayName: null,
          lectureTopic: prevTopic,
          trainerId: prevTrainerId,
          trainerName: prevTrainerName,
          status: "scheduled",
          startTime: prevStartTime,
          endTime: prevEndTime,
          courseName: lastLecture.courseName,
          courseId: lastLecture.courseId,
        });

        const holidays = getHolidays(
          lastLecture.plannedDate,
          nextDateUTC,
          batchData.batchClassSchedule
        );

        if (holidays.length > 0) {
          await Lecture.insertMany(
            holidays.map((h) => ({
              batchId,
              plannedDate: h.date,
              holidayName: h.holidayName,
              lectureTopic: "",
              trainerId: "",
              trainerName: "",
              startTime: prevStartTime,
              endTime: prevEndTime,
              status: "scheduled",
              courseName: lastLecture.courseName,
              courseId: lastLecture.courseId,
            }))
          );
        }

        return res.status(200).json({ message: "Lecture cancelled and topics shifted successfully."});

      } else {
        return res.status(200).json({message:"Lecture cancelled successfully."})
      }

      } else {
        return res
          .status(404)
          .json({ message: "Batch not found for given lecture" });
      }
    } else {
      return res.status(404).json({ message: "Lecture not found!" });
    }
  } catch (Err) {
    console.log("Some server error :", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = cancelLecture;