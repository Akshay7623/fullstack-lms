const Batch = require('../models/batch');

const archiveBatchController = async (req, res) => {
  const { _id } = req.body;

  if (!_id) {
    return res.status(400).json({ message: "Batch ID (_id) is required." });
  }

  try {
    const batch = await Batch.findById(_id);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    if (batch.status === 'archive') {
      return res.status(400).json({ message: "Batch is already archived." });
    }

    batch.status = 'archive';
    await batch.save();

    return res.status(200).json({ message: "Batch archived successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};


module.exports = archiveBatchController;
