const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id: 'rzp_test_EE0ZK37wnZLZn9',
  key_secret: 'tAj82si4kOJ7oaHQT40kJU9G',
});

app.post('/create-order', async (req, res) => {
  const { amount, currency, receipt } = req.body;

  const options = {
    amount: amount * 100,
    currency: currency || 'INR',
    receipt: receipt || `rcptid_${Math.floor(Math.random() * 10000)}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Order creation failed', details: error });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});