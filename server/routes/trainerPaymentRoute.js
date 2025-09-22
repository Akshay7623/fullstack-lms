const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const authentication = require("../middlewares/authMiddleware.js");
const getPaymentController = require("../controllers/getPaymentController.js");
const makePayoutController = require("../controllers/makePayoutController.js");
const getPaymentByDateController = require("../controllers/getPaymentByDateController.js");

const getPaymentMiddleware = (req, res, next) => {
  const { page, pageSize, status } = req.query;

  if (!["settled", "pending", "failed", "processing"].includes(status)) {
    return res.status(400).json({ message: "Invalid status !" });
  }

  const pageNum = Number(page);

  if (!page || isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
    return res.status(400).json({ message: "Invalid page number!" });
  }

  const pageSizeNum = Number(pageSize);

  if (
    !pageSize ||
    isNaN(pageSizeNum) ||
    pageSizeNum < 1 ||
    !Number.isInteger(pageSizeNum)
  ) {
    return res.status(400).json({ message: "Invalid page size!" });
  }

  next();
};

const makePayoutMiddleware = (req, res, next) => {
  const { paymentIds, paymentMethod } = req.body;

  if (typeof paymentIds !== "object") {
    return res.status(400).json({ message: "Invalid payment id" });
  }

  if (paymentIds.some((p) => !mongoose.isValidObjectId(p))) {
    return res.status(400).json({ message: "Invalid payment id" });
  }

  if (!["razorpay", "neft"].includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  next();
};

const getPaymentByDateMiddleware = (req, res, next) => {
  const { startDate, endDate, type } = req.query;

  if (!["pending", "settled", "processing", "failed"].includes(type)) {
    return res.status(400).json({ message: "Invalid type parameter." });
  }

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "startDate and endDate are required." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res
      .status(400)
      .json({ message: "Invalid date format. Must be ISO8601 UTC." });
  }

  if (start > end) {
    return res
      .status(400)
      .json({ message: "start date must be before or equal to end date." });
  }

  next();
};

router.get(
  "/get-payments",
  authentication,
  getPaymentMiddleware,
  getPaymentController
);

router.get(
  "/get-payments-by-date",
  authentication,
  getPaymentByDateMiddleware,
  getPaymentByDateController
);

router.put(
  "/settle-payment",
  authentication,
  makePayoutMiddleware,
  makePayoutController
);

module.exports = router;
