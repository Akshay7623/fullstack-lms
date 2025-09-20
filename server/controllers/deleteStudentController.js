const student = require("../models/student");

const deleteStudent = async (req, res) => {
  const { _id } = req.query;

  try {
    const date = new Date();
    const result = await student.findByIdAndUpdate(
      _id,
      { isDeleted: true, deletedAt: date },{ new: true });

    if (!result) {
      return res.status(404).json({ error: "Student not found" });
    }

    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (Err) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = deleteStudent;