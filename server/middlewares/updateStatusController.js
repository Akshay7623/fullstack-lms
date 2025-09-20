const Batch = require("../models/batch");

const updateStatus = async (req, res) => {
  const { _id, status } = req.body;
  const update = await Batch.findByIdAndUpdate(_id,{ status: status },{ new: true });
  return res.status(200).json({ message: "Status Update successfully" });
};

module.exports = updateStatus;