// listModels.js
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: "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",
});

async function listModels() {
  try {
    const models = await groq.models.list();
    console.log("Available models for your account:");
    models.data.forEach((model) => {
      console.log("-", model.id);
    });
  } catch (err) {
    console.error("Error fetching models:", err.response?.data || err.message || err);
  }
}

listModels();