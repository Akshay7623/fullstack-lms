const Razorpay = require("razorpay");
const Setting = require("../models/settings");

async function getRazorpayInstance() {
  const dbSetting = await Setting.findOne({});
  
  if (!dbSetting) {
    throw new Error("Razorpay keys not found in DB");
  }

  return new Razorpay({
    key_id: dbSetting.razorpayKey,
    key_secret: dbSetting.razorpaySecret
  });
}

module.exports = getRazorpayInstance;