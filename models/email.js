// email.js
const nodemailer = require('nodemailer');
require('dotenv').config; // Add this line

const sendEmail = async (recipientEmail, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Use environment variable
      pass: process.env.EMAIL_PASS, // Use environment variable
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER, // Use environment variable
    to: recipientEmail,
    subject: subject,
    text: text,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
