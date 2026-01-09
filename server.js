import express from "express";
import fetch from "node-fetch";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.send("✅ BizMentor AI backend is running");
});

/* ---------- AI ENDPOINT ---------- */
app.post("/api/ai", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({
        error: "Startup idea is too short or missing"
      });
    }

    const prompt = `
You are BizMentor AI.

CEO:
Give vision and roadmap.

CFO:
Give costing, pricing and profit plan.

CMO:
Give marketing and growth strategy.

Startup idea:
${idea}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: "AI response failed" });
    }

    res.json({
      result: data.candidates[0].content.parts[0].text
    });

  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "Internal AI error" });
  }
});

/* ---------- RAZORPAY ---------- */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

app.post("/api/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: 49900, // ₹499
      currency: "INR",
      receipt: "bizmentor_order_" + Date.now()
    });

    res.json(order);
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);
    res.status(500).json({ error: "Payment order failed" });
  }
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`🚀 BizMentor AI backend running on port ${PORT}`);
});
