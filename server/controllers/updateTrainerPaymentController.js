const TrainerPayment = require("../models/trainerPayment");
const {
  isDateValid,
  isPositiveNumber,
  isNullOrUndefined,
  isNonEmptyString,
} = require("../utils/validation");

const updateTrainerPaymentController = async (req, res) => {
  try {
    const {
      _id,
      firstName,
      lastName,
      trainerId,
      lectureDate,
      lectureTopic,
      amount,
      lectureHour,
      status,
    } = req.body;

//Validate input if provided (partial update)
    const updateData = {};

    if (isNonEmptyString(firstName)) updateData.firstName = firstName;
    if (isNonEmptyString(lastName)) updateData.lastName = lastName;
    if (!isNullOrUndefined(trainerId)) updateData.trainerId = trainerId;
    if (isDateValid(lectureDate)) updateData.lectureDate = lectureDate;
    if (isNonEmptyString(lectureTopic)) updateData.lectureTopic = lectureTopic;
    if (!isNullOrUndefined(amount) && isPositiveNumber(amount)) updateData.amount = amount;
    if (!isNullOrUndefined(lectureHour)) updateData.lectureHour = lectureHour;
    if (isNonEmptyString(status)) updateData.status = status;

    const updatedPayment = await TrainerPayment.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({ message: "Payment updated", updatedPayment });
  } catch (error) {
    console.error("Error updating trainer payment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = updateTrainerPaymentController;
