require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Razorpay = require('razorpay');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

// --- Config ---
// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- Routes ---

// Health Check
app.get('/', (req, res) => {
    res.send('BizMentor API is running!');
});

// AI Endpoint
app.post('/api/ai', async (req, res) => {
    try {
        const { idea } = req.body;
        if (!idea) return res.status(400).json({ error: "Idea is required" });

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        Act as a board of C-level executives (CEO, CFO, CMO) for a startup. 
        The startup idea is: "${idea}".
        
        Provide a response in the following format using HTML-friendly styling (like **bold** for headers):
        
        <br>
        **🤖 CEO (Vision & Roadmap):**
        [Provide a 3-step strategic roadmap]
        
        <br>
        **💰 CFO (Financials):**
        [Estimate initial costs and suggest a pricing model]
        
        <br>
        **🚀 CMO (Marketing):**
        [Suggest 2 key marketing channels and a catchy slogan]
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ result: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "Failed to generate advice." });
    }
});

// Razorpay Order Endpoint
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR
        
        const options = {
            amount: amount * 100, // Razorpay takes amount in paise (multiply by 100)
            currency: "INR",
            receipt: "order_rcptid_" + Date.now(),
        };

        const order = await razorpay.orders.create(options);
        res.json(order);

    } catch (error) {
        console.error("Payment Error:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});