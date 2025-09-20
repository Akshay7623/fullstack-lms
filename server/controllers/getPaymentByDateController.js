const TrainerPayments = require("../models/trainerPayment.js");

const getPayments = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const query = {
      status: type,
      lectureDate: { $gte: startDate, $lte: endDate },
    };

    const data = await TrainerPayments.find(query).sort({ lectureDate: -1 });
    return res.status(200).json({ data: data });
  } catch (Err) {
    console.log("Error at getPaymentByDateController", Err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = getPayments;
