require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/send", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;
  const name = `${firstName} ${lastName}`;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).send("All fields are required.");
  }

  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for port 587
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 👈 This line tells Node to ignore self-signed cert errors
  },
});

  const mailOptions = {
    from: email,
    to: process.env.EMAIL,
    subject: `New message from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone || "N/A"}

      Message:
      ${message}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Message sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send message.");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
