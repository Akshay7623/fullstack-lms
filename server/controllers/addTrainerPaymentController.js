const TrainerPayment = require("../models/trainerPayment");
const {
  isDateValid,
  isPositiveNumber,
  isNullOrUndefined,
  isNonEmptyArray,
  isNonEmptyString,
} = require("../utils/validation");

const addTrainerPaymentController = async (req, res) => {
  console.log("POST request received from client");

  const {
    firstName,
    lastName,
    trainerId,
    lectureDate,
    lectureTopic,
    amount,
    lectureHour,
    status,
  } = req.body;

  // ✅ Input validation
  if (
    !isNonEmptyString(firstName) ||
    !isNonEmptyString(lastName) ||
    isNullOrUndefined(trainerId) || // ❗ FIXED: should be isNullOrUndefined(trainerId)
    !isDateValid(lectureDate) ||
    !isNonEmptyString(lectureTopic) || // ❗ FIXED: should be non-empty string
    isNullOrUndefined(amount) ||
    !isPositiveNumber(amount) ||
    isNullOrUndefined(lectureHour) ||
    !isNonEmptyString(status) // ❗ FIXED: status should be a string (not array)
  ) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    const payment = new TrainerPayment({
      firstName,
      lastName,
      trainerId,
      lectureDate,
      lectureTopic,
      amount,
      lectureHour,
      status,
    });

    await payment.save();

    return res.status(200).json({ message: "Payment added successfully" });
  } catch (error) {
    console.error("Trainer payment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = addTrainerPaymentController;
