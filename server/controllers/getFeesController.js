const Transaction = require("../models/transaction");

const getFees = async (req, res) => {
  try {
    const feesData = await Transaction.find({
      studentId: req.query.id,
    }).sort({ datetime: -1 });

    if (feesData.length === 0) {
      return res
        .status(404)
        .json({ message: "No fees data found for this student." });
    } else {
      return res.status(200).json({ data: feesData });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getFees;