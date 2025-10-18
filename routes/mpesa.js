import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Access token function
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
  ).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return res.data.access_token;
};

// STK Push route
router.post("/pay", async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const token = await getAccessToken();

    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
    const password = Buffer.from(`174379${process.env.PASSKEY}${timestamp}`).toString("base64");

    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: "174379",
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: "174379",
        PhoneNumber: phone,
        CallBackURL: "https://sparkle-backend-five.vercel.app/api/mpesa/callback",
        AccountReference: "Sparkle-Dash",
        TransactionDesc: "Payment for cleaning service",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(stkRes.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Payment failed", error: error.message });
  }
});

// Optional callback route
router.post("/callback", (req, res) => {
  console.log("M-Pesa Callback Data:", req.body);
  res.sendStatus(200);
});

export default router;
