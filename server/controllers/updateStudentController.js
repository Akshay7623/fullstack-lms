const Student = require("../models/student");
const Course = require("../models/course");
const fs = require("fs");
const path = require("path");

const updateStudentController = async (req, res) => {
  try {
    const {
      _id,
      firstName,
      lastName,
      email,
      course,
      program,
      mobileNumber,
      parentName,
      parentMobile,
      dateOfBirth,
      panCard,
      aadharCard,
      residenceAddress,
    } = req.body;

    let courseName = course;
    const courseId = course;

    if (course && course.length === 24) {
      const courseDoc = await Course.findById(course);
      if (!courseDoc) {
        return res.status(400).json({ message: "Invalid course selected" });
      }
      courseName = courseDoc.name;
    }

    const existingStudent = await Student.findById(_id);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const docFields = [
      "studentPhoto",
      "aadharCardFront",
      "aadharCardBack",
      "panCardPhoto",
    ];
    const studentDocuments = { ...existingStudent.studentDocuments };


    docFields.forEach((field) => {
      if (req.files && req.files[field] && req.files[field][0]) {
        if (studentDocuments[field]) {
          const oldPath = path.join(__dirname,"../uploads",studentDocuments[field]);
          fs.unlink(oldPath, () => {});
        }
        studentDocuments[field] = req.files[field][0].filename;

      } else if (req.body[field] === "") {
        if (studentDocuments[field]) {
          const oldPath = path.join(__dirname,"../uploads",studentDocuments[field]);
          fs.unlink(oldPath, () => {});
        }

        studentDocuments[field] = "";
      }
    });

    const updatedStudent = await Student.findByIdAndUpdate(
      _id,
      {
        firstName,
        lastName,
        email,
        course: courseName,
        program,
        mobileNumber,
        parentName,
        parentMobile,
        dateOfBirth,
        panCard,
        aadharCard,
        residenceAddress,
        studentDocuments,
        courseId: courseId,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = updateStudentController;
