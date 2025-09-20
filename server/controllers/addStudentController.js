const Student = require("../models/student");
const Course = require("../models/course");
const fs = require("fs");
const path = require("path");
const {
  isPanCard,
  isAadhar,
  isNonEmptyString,
} = require("../utils/validation");

const addStudentController = async (req, res) => {
  try {
    const courseId = req.body.course;
    const courseDoc = await Course.findById(courseId);
    if (!courseDoc) {
      return res.status(400).json({ message: "Invalid course selected" });
    }

    const {
      firstName,
      lastName,
      email,
      registrationDate,
      mobileNumber,
      gender,
      parentName,
      parentMobile,
      dateOfBirth,
      panCard,
      aadharCard,
      residenceAddress,
      onBoarding,
      program,
    } = req.body;

    req.body.course = courseDoc.name;
    let total = 0;

    if (program === "certification")
      total = courseDoc.prices.certification || 0;
    else if (program === "diploma") total = courseDoc.prices.diploma || 0;
    else if (program === "master diploma")
      total = courseDoc.prices.masterDiploma || 0;

    req.body.total = total;
    req.body.pending = total;

    const studentDocuments = {
      studentPhoto: req.files?.studentPhoto?.[0]?.filename || "",
      aadharCardFront: req.files?.aadharCardFront?.[0]?.filename || "",
      aadharCardBack: req.files?.aadharCardBack?.[0]?.filename || "",
      panCardPhoto: req.files?.panCardPhoto?.[0]?.filename || "",
    };

    if (
      (panCard && !isPanCard(panCard)) ||
      (aadharCard && !isAadhar(aadharCard)) ||
      (residenceAddress && !isNonEmptyString(residenceAddress)) ||
      req.body.pending < 0 ||
      req.body.total < 0
    ) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const student = new Student({
      firstName,
      lastName,
      email,
      registrationDate,
      course: req.body.course,
      courseId: courseId,
      mobileNumber,
      gender,
      parentName,
      parentMobile,
      dateOfBirth,
      panCard,
      aadharCard,
      residenceAddress,
      onBoarding,
      paid: 0,
      pending: req.body.pending,
      total: req.body.total,
      program,
      studentDocuments,
    });

    await student.save();
    return res.status(200).json({ message: "Student added successfully" });
  } catch (error) {
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => {
          const filePath = path.join(__dirname, "../uploads", file.filename);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete file:", err);
          });
        });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = addStudentController;
