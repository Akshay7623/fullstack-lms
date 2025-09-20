const lecture = require("../models/lectureSchedule");

const updateDate = async (req, res) => {
  const { lectureId, newDate } = req.body;
  try {
    await lecture.findByIdAndUpdate(lectureId, {
      plannedDate: newDate,
    });

    return res
      .status(200)
      .json({ message: "Lecture Date updated successfully" });
  } catch (Err) {
    console.log("Error while updating the date ", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateDate;