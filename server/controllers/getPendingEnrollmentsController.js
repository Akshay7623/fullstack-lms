const Student = require("../models/student.js");;

const getPendingEnrollment = async (req, res) => {
  try {
    const students = await Student.find({isDeleted: false, enrolled: false}).sort({registrationDate: -1});

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No pending enrollments found" }); 
    }
    
    res.status(200).json(students);
} catch (error) {
    console.error("Error fetching pending enrollments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = getPendingEnrollment;