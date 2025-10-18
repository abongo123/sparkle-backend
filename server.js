import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mpesaRoutes from "./routes/mpesa.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(cors({
  origin: ["https://sparkle-dash.vercel.app"], // your frontend domain
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// 💌 CONTACT ROUTE
app.post("/send", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;
  const name = `${firstName} ${lastName}`;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).send("All fields are required.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
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

// 📅 BOOKING ROUTE
app.post("/book", async (req, res) => {
  const { name, phone, email, service, selectedOptions, date, message } = req.body;

  if (!name || !email || !service || !date) {
    return res.status(400).send("Missing booking details.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

  const mailOptions = {
    from: email,
    to: process.env.EMAIL,
    subject: `New Service Booking: ${service}`,
    text: `
      Name: ${name}
      Phone: ${phone}
      Email: ${email}
      Service: ${service}
      Selected Options: ${
        selectedOptions && selectedOptions.length > 0
          ? selectedOptions.join(", ")
          : "None"
      }
      Preferred Date: ${date}
      Message: ${message || "N/A"}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Booking received successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send booking.");
  }
});

// 💵 M-PESA ROUTES
app.use("/api/mpesa", mpesaRoutes);

export default app;
