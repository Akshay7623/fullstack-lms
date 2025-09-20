const nodemailer = require("nodemailer");
const { transporter } = require("../utils/mailUtils.js");

const sendMail = async (req, res) => {
  try {
    const { emails, subject, body } = req.body;
    const mail = await transporter.sendMail({ from: `"Academics Team" <${process.env.EMAIL_USER}>`, to: emails.join(", "), subject, html: body });
    return res.status(200).json({ message: "Email sent successfully." });
    
  } catch (err) {
    console.error("Send Mail Error:", err);
    return res.status(500).json({ message: "Failed to send email." });
  }
};

module.exports = sendMail;
