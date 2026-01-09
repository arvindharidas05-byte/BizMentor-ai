app.post("/api/ai", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 10) {
      return res.status(400).json({ error: "Idea must be at least 10 characters." });
    }

    const prompt = `
You are BizMentor AI.

AI CEO: Vision & roadmap.
AI CFO: Costs & pricing.
AI CMO: Marketing & growth strategy.

Idea: ${idea}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        }),
      }
    );

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      console.error("AI API returned malformed response:", data);
      return res.status(500).json({ error: "AI service error" });
    }

    res.json({ result: data.candidates[0].content.parts[0].text });

  } catch (err) {
    console.error("ERROR IN /api/ai:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});
