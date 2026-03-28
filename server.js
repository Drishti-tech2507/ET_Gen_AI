const Groq = require("groq-sdk");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Use your Groq API key here
const groq = new Groq({
  apiKey: "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",
});

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("🚀 Server running");
});

// ======================
// SEARCH NEWS
// ======================
app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) return res.status(400).send("Query missing");

  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=relevancy&pageSize=12&apiKey=07b717668c1a436d88d2afe1a335d46a`
    );

    const cleaned = response.data.articles
      .filter(a => a.title && a.description)
      .map(a => ({
        title: a.title,
        description: a.description,
        content: a.content,
        url: a.url,
        image: a.urlToImage || "https://via.placeholder.com/400"
      }));

    res.json(cleaned);

  } catch (err) {
    console.error("SEARCH ERROR:", err.message);
    res.status(500).send("Search error");
  }
});

// ======================
// TRANSLATE (EN → HINDI FIXED)
// ======================
app.post("/translate", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).send("Text missing");

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
Translate the following text strictly into Hindi.
Keep meaning correct and natural.

Text:
${text}
          `
        }
      ],
      max_tokens: 200
    });

    res.json({
      translation: response.choices[0]?.message?.content || "No translation"
    });

  } catch (err) {
    console.error("TRANSLATE ERROR:", err.message);
    res.status(500).send("Translation error");
  }
});

// ======================
// CHATBOT (SMART + CLEAN)
// ======================
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).send("Message missing");

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `
You are an AI assistant for a business news app.

Explain clearly in simple words.
Keep answers short (3–5 lines).

User Question:
${message}
          `
        }
      ],
      max_tokens: 300
    });

    res.json({
      reply: response.choices[0]?.message?.content || "No reply"
    });

  } catch (err) {
    console.error("CHAT ERROR:", err.message);
    res.status(500).send("Chat error");
  }
});

// ======================
// START SERVER
// ======================
app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});
