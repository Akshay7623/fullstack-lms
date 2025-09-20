const Student = require("../models/student");

const onboardController = async (req, res) => {
  try {
    const { _id, onBoarding } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(_id,{ onBoarding },{ new: true });

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({message: "Onboarding status updated successfully",student: updatedStudent});
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = onboardController;