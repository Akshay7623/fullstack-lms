const Batch = require("../models/batch");

const getBatches = async (req, res) => {
  const batches = await Batch.find({});

  if (batches) {
    return res.status(200).json({ data: batches });
  } else {
    return res.status(404).json({ message: "Data not found" });
  }
};

module.exports = getBatches;
