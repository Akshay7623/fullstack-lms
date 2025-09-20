const Student = require("../models/student");
const Transaction = require("../models/transaction");

const searchTransaction = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Search term is required" });
    }

    const nameArr = name.split(" ").map((word) => word.trim()).filter((word) => word.length > 0);

    const studentFilter = {
      $and: nameArr.map((word) => ({
        $or: [
          { firstName: { $regex: word, $options: "i" } },
          { lastName: { $regex: word, $options: "i" } },
        ],
      })),
    };

    const matchedStudents = await Student.find(studentFilter).select("_id");
    const studentIds = matchedStudents.map((student) => student._id);

    if (!studentIds.length) {
      return res.status(200).json([]);
    }

    const transactions = await Transaction.find({
      studentId: { $in: studentIds },
    }).populate({
      path: "studentId",
      select:
        "firstName lastName mobileNumber email course program paymentReferenceId",
    });

    return res.status(200).json({ data: transactions });
  } catch (Err) {
    console.error("Error while searching transaction", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = searchTransaction;
