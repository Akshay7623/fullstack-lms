const Student = require("../models/student");
const Course = require("../models/course");

const confirmAddmission = async (req, res) => {
  const { _id, courseId, program } = req.body;

  const student = await Student.findById(_id);
  const course = await Course.findById(courseId);

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (student.enrolled) {
    return res.status(400).json({ message: "Student is already enrolled" });
  }

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const priceMap = {
    certification: course.prices.certification,
    diploma: course.prices.diploma,
    "master diploma": course.prices.masterDiploma,
  };

  const total = priceMap[program];
  const pending = total - parseInt(student.paid);
  const courseName = course.name;

  await Student.findByIdAndUpdate(_id, {
    courseId: courseId,
    program: program,
    course: courseName,
    total: total,
    pending: pending,
    enrolled: true,
  });

  return res.status(200).json({ message: "Admission confirmed successfully" });
};

module.exports = confirmAddmission;