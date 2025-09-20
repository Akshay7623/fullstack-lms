const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const getMailOptions = (email, fileBuffer) => {
  return {
    from: `"Institute of Analytics" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Payment Receipt - Institute of Analytics",
    text: "Please find attached your fee receipt.",
    attachments: [
      {
        filename: "FEE_Receipt.pdf",
        content: fileBuffer,
        contentType: "application/pdf",
      },
    ],
  };
};

module.exports = { transporter, getMailOptions };