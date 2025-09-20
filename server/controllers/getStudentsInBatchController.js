const Student = require("../models/student.js");

const getStudents = async (req, res) => {
  const { batchCode } = req.params;

  try {
    const students = await Student.find({ batch: batchCode, isDeleted: false });
    return res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students in batch:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = getStudents;
