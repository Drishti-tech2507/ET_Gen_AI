// server.js
const Groq = require("groq-sdk");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq SDK with your API key
const groq = new Groq({
  apiKey: "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",
});

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Server running");
});

// ✅ News route
app.get("/news", async (req, res) => {
  try {
    const response = await axios.get(
      "https://newsapi.org/v2/everything?q=business&language=en&sortBy=publishedAt&apiKey=07b717668c1a436d88d2afe1a335d46a"
    );
    res.json(response.data.articles);
  } catch (err) {
    console.error("NEWS ERROR:", err.response?.data || err.message);
    res.status(500).send("Error fetching news");
  }
});

// ✅ Test AI route
app.get("/test-ai", async (req, res) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Using your supported model
      messages: [{ role: "user", content: "Explain stock market in simple words" }],
      max_tokens: 300,
    });

    res.send(chatCompletion.choices[0]?.message?.content || "No AI response");
  } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message || err);
    res.status(500).send("AI error");
  }
});

// ✅ Analyze route
app.post("/analyze", async (req, res) => {
  const { article, portfolio } = req.body;
  if (!article || !portfolio) return res.status(400).send("Missing article or portfolio");

  try {
    const prompt = `
User Portfolio: ${portfolio}
News: ${article}

1) Give a short summary (3 points)
2) Explain why this matters
3) Impact level (High/Medium/Low)
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Using your supported model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 400,
    });

    res.json({ result: response.choices[0]?.message?.content || "No response" });
  } catch (err) {
    console.error("AI ERROR:", err.response?.data || err.message || err);
    res.status(500).send("AI error");
  }
});

// ✅ Start server
app.listen(5000, () => console.log("Server running on port 5000"));