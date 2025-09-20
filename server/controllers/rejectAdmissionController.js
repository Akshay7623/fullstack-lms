const Student = require("../models/student");

const rejectAdmission = async (req, res) => {
  const { _id } = req.body;

  const student = await Student.findById(_id);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  await Student.findByIdAndUpdate(_id, { isDeleted: true });
  
  return res.status(200).json({ message: "Admission rejected successfully" });
};

module.exports = rejectAdmission;
