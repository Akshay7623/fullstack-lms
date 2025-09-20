const Transaction = require("../models/transaction");

const exportTransactions = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let dateFilter = {};

    if (startDate && endDate) {
      dateFilter = { datetime: { $gte: new Date(startDate),$lte: new Date(endDate) } };
    }

    const transactions = await Transaction.find(dateFilter).populate({ path: "studentId",select: "firstName lastName mobileNumber email course program paymentReferenceId" });

    if (transactions.length) {
      return res.status(200).json({ data: transactions });
    } else {
      return res.status(404).json({ message: "No records found between given dates!" });
    }
  } catch (Err) {
    console.error("Error in exportTransactions:", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = exportTransactions;
