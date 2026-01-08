import express from "express";
import fetch from "node-fetch";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- AI ENDPOINT ---------------- */
app.post("/api/ai", async (req, res) => {
  const { idea } = req.body;

  const prompt = `
You are BizMentor AI.

CEO:
Vision & roadmap.

CFO:
Costing, pricing, profit.

CMO:
Marketing & growth.

Startup idea:
${idea}
`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.AIzaSyB9GqQ_xFwknOrxiyaw3WiiTOa615Xbk-k}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await r.json();
    res.json({ result: data.candidates[0].content.parts[0].text });
  } catch (err) {
    res.status(500).json({ error: "AI failed" });
  }
});

/* ---------------- RAZORPAY ---------------- */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

app.post("/api/create-order", async (req, res) => {
  const order = await razorpay.orders.create({
    amount: 49900,
    currency: "INR"
  });
  res.json(order);
});

app.listen(5000, () => {
  console.log("BizMentor AI backend running on port 5000");
});



