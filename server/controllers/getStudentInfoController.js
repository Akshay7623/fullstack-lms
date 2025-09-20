const Student = require("../models/student");
const Setting = require("../models/settings");

const getStudentInfo = async (req, res) => {
  const { mobile } = req.query;
  let razorpayKeyId = "";

  const student = await Student.findOne(
    { mobileNumber: mobile },
    "firstName lastName email program course courseId"
  );
  const dbSetting = await Setting.findOne({});

  if (dbSetting) {
    razorpayKeyId = dbSetting.razorpayKey;
  }

  if (student) {
    return res.status(200).json({...student._doc,paymentKey: razorpayKeyId});
  } else {
    return res.status(404).json({ message: "Student not found" });
  }
};

module.exports = getStudentInfo;