const Trainer = require("../models/trainer");

const getTrainer = async (req, res) => {
  const trainers = await Trainer.find({});
  return res.status(200).json({ data: trainers });
};

module.exports = getTrainer;
