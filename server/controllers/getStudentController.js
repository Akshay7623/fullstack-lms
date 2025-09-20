const Student = require("../models/student");

const getStudent = async (req, res) => {
  const data = await Student.find({ isDeleted: false, enrolled: true }).sort({
    registrationDate: -1,
  });
  return res.status(200).json({ data: data });
};

module.exports = getStudent;
