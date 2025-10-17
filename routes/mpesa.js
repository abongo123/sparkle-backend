import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Get Access Token
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
  ).toString("base64");

  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return response.data.access_token;
};

// STK Push Route
router.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const token = await getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);

    const password = Buffer.from(
      `174379${process.env.PASSKEY}${timestamp}`
    ).toString("base64");

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
        CallBackURL: "https://yourdomain.com/api/mpesa/callback",
        AccountReference: "Sparkle-Dash",
        TransactionDesc: "Payment for cleaning services",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(stkRes.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initiate STK push" });
  }
});

export default router;
