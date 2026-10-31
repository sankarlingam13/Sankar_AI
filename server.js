const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const OLLAMA_URL = "http://127.0.0.1:11434/api/chat";
const MODEL = "qwen2.5:3b";

// Home route
app.get("/", (req, res) => {
    res.send("Sankar AI Backend is Running!");
});

// API test
app.get("/api", (req, res) => {
    res.json({
        message: "Welcome to Sankar AI",
        status: "Success"
    });
});

// AI Chat route
app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const result = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL,
                stream: false,
                messages: [
                    {
                        role: "system",
                        content: "You are Sankar AI, created by Sankar. You are a helpful AI assistant. Reply only in clear English. Never claim to be Qwen or another AI model. If asked who created you, say Sankar created Sankar AI."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        if (!result.ok) {
            throw new Error("Ollama returned status " + result.status);
        }

        const data = await result.json();

        res.json({
            reply: data.message.content
        });

    } catch (error) {
        console.error("AI Error:", error.message);

        res.status(500).json({
            error: "AI connection failed. Check whether Ollama is running."
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sankar AI Backend running on port ${PORT}`);
});