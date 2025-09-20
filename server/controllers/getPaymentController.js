const TrainerPayment = require("../models/trainerPayment");

const getPayments = async (req, res) => {
  const { page, pageSize, status } = req.query;
  try {
    const query = {};
    query.status = status;
    const totalCount = await TrainerPayment.countDocuments(query);

    const payments = await TrainerPayment.find(query)
      .sort({ lectureDate: -1 })
      .skip((Number(page) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    return res.status(200).json({
      data: payments,
      total: totalCount,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (Err) {
    console.log("Some error while fetching payments ", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getPayments;
