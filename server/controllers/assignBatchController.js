const Student = require("../models/student");

const assignBatch = async (req, res) => {
  const { _ids, batch } = req.body;

  try {
    const query = [{ _id: { $in: _ids } }, { $set: { batch } }];

    const update = await Student.updateMany(...query);
    return res.status(200).json({ message: "Batch assigned successfully" });
  } catch (err) {
    console.log("Error in assignBatchController.js:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = assignBatch;