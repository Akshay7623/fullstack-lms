const Student = require("../models/student");
const Course = require("../models/course");
const Transaction = require("../models/transaction");

const processPayment = async (data, res) => {

  const {
    method,
    amount,
    email,
    firstName,
    lastName,
    course,
    program,
    mobile,
    order_id,
  } = data;
  const student = await Student.findOne({ mobileNumber: mobile });
  let studentId = student ? student._id : null;

  if (student) {
    const paid = student.paid + parseInt(amount / 100);
    const pending = student.total - parseInt(amount / 100);
    await Student.updateOne(
      { mobileNumber: mobile },
      { paid: paid, pending: pending }
    );
  } else {
    const ALLOWED_PROGRAMS = ["certification", "diploma", "master diploma"];

    if (!ALLOWED_PROGRAMS.includes(program)) {
      program = "certification";
    }

    const courseData = await Course.findById(course);

    if (courseData) {
      const priceMap = {
        certification: courseData.prices["certification"],
        diploma: courseData.prices["diploma"],
        "master diploma": courseData.prices["masterDiploma"],
      };
      const total = priceMap[program];
      const paid = parseInt(amount / 100);
      const pending = total - paid;

      const currDate = new Date();

      const student = Student({
        firstName: firstName,
        lastName: lastName,
        email: email,
        registrationDate: currDate,
        course: courseData.name,
        courseId: course,
        mobileNumber: mobile,
        program: program,
        total: total,
        paid: paid,
        pending: pending,
        enrolled: false,
      });

      await student.save();
      studentId = student._id;
    }
  }

  if (studentId === null) {
    return res.status(200).json({ message: "Success" });
  } else {
    // add transaction
    const transaction = new Transaction({
      datetime: new Date(),
      amount: parseInt(amount / 100),
      studentId: studentId,
      courseId: course,
      paymentMode: method,
      paymentReferenceId: order_id,
      lastReceiptSentAt: new Date(Date.now() - 24*60*60*1000).toISOString()
    });

    await transaction.save();
  }

  return res.status(200).json({ message: "Success" });
};

module.exports = processPayment;