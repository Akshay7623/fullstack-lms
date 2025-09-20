const Lecture = require("../models/lectureSchedule");

const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    await Lecture.findByIdAndDelete(lectureId);
    return res.status(200).json({ message: "success" });
  } catch (Err) {
    console.log("Error while deleting the lecture", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = deleteLecture;