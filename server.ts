import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // API Routes
  app.post("/api/ai/generate-image", async (req, res) => {
    if (!genAI) {
      return res.status(500).json({ error: "Gemini API key not configured on server." });
    }

    const { prompt, aspectRatio = "1:1" } = req.body;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
          {
            text: prompt,
          }
        ],
        config: {
          imageConfig: {
            aspectRatio: aspectRatio
          }
        }
      });

      let base64Data = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }

      if (base64Data) {
        res.json({ image: `data:image/png;base64,${base64Data}` });
      } else {
        res.status(500).json({ error: "No image data returned from Gemini." });
      }
    } catch (error: any) {
      console.error("Gemini Image Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image." });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    if (!genAI) {
      return res.status(500).json({ error: "Gemini API key not configured on server." });
    }

    const { message, systemInstruction } = req.body;

    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: message,
        config: {
          systemInstruction: systemInstruction
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
