const Lecture = require("../models/lectureSchedule");

const updateTime = async (req, res) => {
  const { lectureId, time } = req.body;

  try {
    const updateLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      {
        startTime: time.start,
        endTime: time.end,
      },{ new: true });

      if(updateLecture) {
        return res.status(200).json({message:"Time updated successfully"});
      } else {
        return res.status(400).json({message:"Lecture not found"})
      }

  } catch (Err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateTime;