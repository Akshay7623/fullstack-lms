const Batch = require("../models/batch");

// Get all batches
const getBatches = async (req, res) => {
  try {
    const data = await Batch.find({});
    if (data.length > 0) {
      return res.status(200).json({ data });
    } else {
      return res.status(404).json({ message: "No batches found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get a single batch by ID (or modify as needed)
const getBatch = async (req, res) => {
  try {
    const batchId = req.params.id; // expecting /batch/:id
    const data =  await  Batch.findById(batchId);
    if (data) {
      return res.status(200).json({ data });
    } else {
      return res.status(404).json({ message: "Batch not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getBatches,
  getBatch,
};
