const Payment = require("../models/payment.js");
const crypto = require("crypto");
const razorpayInstance = require("../middlewares/razorpayMiddleware.js");
const { isNullOrUndefined } = require("../utils/validation.js");
const processPayment = require("./processPaymentController.js");
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET


const createOrder = async (req, res) => {
  const razorpay = await razorpayInstance();
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || isNullOrUndefined(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount value" });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const newPayment = new Payment({
      orderId: order.id,
      amount: options.amount / 100,
      currency: options.currency,
      receipt: options.receipt,
      paymentStatus: "created",
      createdAt: new Date(),
    });

    await newPayment.save();

    res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      paymentStatus: "created",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Payment processing failed",
      details: error.message,
    });
  }
};

const handleWebhook = async (req, res) => {

  try {

    const razorpaySignature = req.headers["x-razorpay-signature"];
    const generatedSignature = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(req.body)).digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return res.status(200).json({ message: "Success" });
    }

    const { event, payload } = req.body;
    const paymentEntity = payload.payment?.entity;

    console.log("Event are ", event, " and payload is ", payload);

    if (event === "payment.captured") {
      const { method, amount, order_id } = paymentEntity;
      const { firstName, lastName, course, program, mobile, email } = paymentEntity.notes;
      processPayment({ method, amount, email, firstName, lastName, course, program, mobile, order_id }, res);
    } else {
      return res.status(200).json({ message: "Success" })
    }

  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(200).json({ message: "Success" });
  }
};

module.exports = {
  createOrder,
  handleWebhook,
};