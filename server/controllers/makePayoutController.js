const Trainer = require("../models/trainer.js");
const TrainerPayment = require("../models/trainerPayment.js");
const makeRazorpayPayout = require("./razorpayPayoutController.js");

const makePayout = async (req, res) => {
  try {
    const { paymentIds, paymentMethod } = req.body;

    const payments = await TrainerPayment.find({
      _id: { $in: paymentIds },
      status: { $in: ["pending", "failed"] },
    });

    if (!payments) {
      return res.status(404).json({ message: "No Payment record found !" });
    }

    const uniqueTrainerIds = [
      ...new Set(payments.map((p) => String(p.trainerId))),
    ];

    if (uniqueTrainerIds.length > 1) {
      return res.status(400).json({
        message: "All selected payments must belong to the same trainer.",
      });
    }

    if (paymentMethod === "neft") {
      await TrainerPayment.updateMany(
        {
          _id: { $in: paymentIds },
          status: { $in: ["pending", "failed"] },
        },
        {
          status: "settled",
          updatedAt: new Date(),
        }
      );

      return res.status(200).json({ message: "Payout initiated successfully" });
    } else {
      const total = payments.reduce((sum, p) => sum + p.amount, 0);
      const trainer = await Trainer.findById(payments[0].trainerId);

      if (trainer) {
        
        const {
          ifscCode,
          accountNumber,
          accountName,
          email,
          mobileNumber,
          contact_id,
          fund_account_id,
        } = trainer;

        if (!(accountName && ifscCode && accountNumber)) {
          return res
            .status(404)
            .json({ message: "Trainer Bank Details not available." });
        }

        const result = await makeRazorpayPayout(
          accountName,
          email,
          mobileNumber,
          accountNumber,
          ifscCode,
          trainer._id,
          contact_id,
          fund_account_id,
          total
        );

        if (result.status === "failed") {
          return res.status(400).json({ message: result.message });
        }

        if (result.status === "success") {
          const { payoutId } = result;

          await TrainerPayment.updateMany(
            {
              _id: { $in: paymentIds },
              status: { $in: ["pending", "failed"] },
            },
            {
              status: "processing",
              updatedAt: new Date(),
              payoutId: result.payoutId,
            }
          );

          return res.status(200).json({ message: "Payout initiated" });
        }
      } else {
        return res
          .status(404)
          .json({ message: "Trainer not found with given id" });
      }
    }
  } catch (Err) {
    console.log("Error at makePayoutCotroller:", Err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = makePayout;