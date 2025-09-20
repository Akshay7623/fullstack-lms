const Trainer = require("../models/trainer.js");

const getTrainer = async (req, res) => {
  try {
    const { trainerId } = req.query;
    const trainer = await Trainer.findById(trainerId);
    return res.status(200).json({ trainer });
  } catch (Err) {
    console.log("Error:", Err);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

module.exports = getTrainer;