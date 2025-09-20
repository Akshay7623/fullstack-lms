const Transaction = require("../models/transaction");

const getTransaction = async (req, res) => {
  const { page, pageSize } = req.query;
  const pageNumber = Number(page);
  const pageSizeInt = Number(pageSize);

  const skip = (pageNumber - 1) * pageSizeInt;

  const total = await Transaction.countDocuments();

  const transactions = await Transaction.find()
    .sort({ datetime: -1 })
    .skip(skip)
    .limit(pageSize)
    .populate({
      path: "studentId",
      select: "firstName lastName mobileNumber email course program paymentReferenceId",
    });

  return res.status(200).json({ data: transactions, total: total });
};

module.exports = getTransaction;
