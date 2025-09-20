const mongoose = require("mongoose");
const Transaction = require("../models/transaction.js");

const { transporter, getMailOptions } = require("../utils/mailUtils.js");
const { isEmail } = require("../utils/validation");

const sendMailController = async (req, res) => {
  const { email, _id } = req.body;
  const fileBuffer = req.file.buffer;

  try {
    if (!isEmail(email) || !mongoose.isValidObjectId(_id)) {
      return res.status(400).json({ message: "Invalid email id" });
    }

    if (!fileBuffer) {
      return res.status(400).json({ message: "Missing email or receipt" });
    }

    const resp = await transporter.sendMail(getMailOptions(email, fileBuffer));

    if (resp.rejected.length === 0) {
      await Transaction.findByIdAndUpdate(_id, { lastReceiptSentAt: new Date() });
      return res.status(200).json({ message: "Mail sent successfully" });
    } else {
      return res.status(400).json({ message: "Failed to send mail" });
    }
  } catch (Err) {
    console.log("Error is ", Err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = sendMailController;