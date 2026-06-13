require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Groq Client
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Test Route
app.get("/", (req, res) => {
  res.send("HomeScape AI Server Running");
});

// Chat Route
app.post("/chat", async (req, res) => {
  try {
    const { history } = req.body;

    // Validation
    if (!history || history.length === 0) {
      return res.status(400).json({
        reply: "Chat history is required",
      });
    }

    // System Prompt
    const systemPrompt = `
You are HomeScape AI, an intelligent interior design assistant.

Your goals:
- Collect room information naturally
- Understand room type
- Understand dimensions
- Understand budget
- Understand preferred style
- Ask one question at a time
- Give practical suggestions
- Be conversational and professional
- Avoid repeating questions
`;

    // Convert history to Groq format
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Groq API Call
    const response = await client.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
    });

    const reply = response.choices[0].message.content;
    // Send AI Reply
    res.json({
      reply: reply,
    });
  } catch (error) {
    console.error("Groq Error:", error);

    res.status(500).json({
      reply: "Error generating response",
    });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
