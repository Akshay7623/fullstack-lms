const Lecture = require("../models/lectureSchedule");

const editTopic = async (req, res) => {
  try {
    const { lectureId, topic } = req.body;
    const lectureData = await Lecture.findById(lectureId);

    if (!lectureData) {
      return res.status(404).json({ message: "Lecture not found." });
    }
    
    await Lecture.findByIdAndUpdate(lectureId, { lectureTopic: topic });
    return res.status(200).json({ message: "Topic updated successfully." });
  } catch (Err) {
    console.log("some error while updating the topic!", Err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = editTopic;
