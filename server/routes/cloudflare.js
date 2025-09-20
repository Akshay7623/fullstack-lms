const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/", async (req, res) => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  const { token } = req.body;
  const ip = req.ip;
  
  try {
    const verifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const result = await axios.post(verifyURL, formData.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = result.data;

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({ success: false, errors: data["error-codes"] });
    }
  } catch (err) {
    console.error("Turnstile error:", err.message);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
});

module.exports = router;