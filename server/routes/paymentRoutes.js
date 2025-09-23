const express = require('express');
const paymentController = require('../controllers/paymentController.js');

const paymentRoutes = express.Router();
paymentRoutes.post('/create-order', paymentController.createOrder);
paymentRoutes.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);


module.exports = paymentRoutes;