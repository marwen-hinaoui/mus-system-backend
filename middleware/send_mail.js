const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "marwenhinaouii@gmail.com",
    pass: "fuwz czxt xlok skrk",
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"MUS" <mus@lear.com>`,
      to,
      subject,
      html,
    });
    console.log("Email sent:", subject);
  } catch (err) {
    console.error("Email error:", err);
  }
};


module.exports = sendEmail;