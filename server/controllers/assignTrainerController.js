const Trainer = require("../models/trainer");
const Lecture = require("../models/lectureSchedule");

const assignTrainer = async (req, res) => {
  try {
    const { lectureId, trainerId } = req.body;
    const trainerData = await Trainer.findById(trainerId);

    if (!trainerData) {
      return res.status(404).json({ message: "trainer does not exist" });
    } else {
      const trainerName = `${trainerData.firstName} ${trainerData.lastName}`;
      await Lecture.findByIdAndUpdate(lectureId, {
        trainerName: trainerName,
        trainerId: trainerId,
      });

      return res
        .status(200)
        .json({
          message: "Trainer assigned successfully",
          lectureInfo: { email: trainerData.email },
        });
    }
  } catch (Err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = assignTrainer;
