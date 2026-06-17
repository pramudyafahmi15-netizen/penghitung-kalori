import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  
  // body parser with higher limit for food photo uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  const PORT = 3000;

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API endpoint for food calorie calculation
  app.post("/api/analyze-food", async (req, res) => {
    try {
      const { image, description } = req.body;

      if (!image && !description) {
        return res.status(400).json({ error: "Mohon sediakan foto makanan atau deskripsi teks." });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY belum dikonfigurasi di Settings > Secrets." });
      }

      // Prepare parts
      const parts: any[] = [];

      if (image) {
        const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        } else {
          // If the format is already plain base64 without standard data-url prefix
          parts.push({
            inlineData: {
              data: image,
              mimeType: "image/jpeg"
            }
          });
        }
      }

      const promptText = `
Analisislah makanan ini dari foto dan/atau deskripsi teks berikut.
Deskripsi tambahan dari pengguna: "${description || 'Tidak ada deskripsi tambahan'}"

Silakan hitung estimasi kalori (kkal) dan makronutrisi (karbohidrat, protein, lemak dalam satuan gram).
Jika ada foto piring makan, berikan analisis mendalam berdasarkan semua lauk pauk, nasi, atau sayur yang terlihat.
Jika foto tidak tersedia atau kurang jelas, analisislah tulisan deskripsi secara logis berdasarkan porsi masakan Indonesia atau masakan barat standar.

Kirim hasil analisis eksklusif dalam format JSON dengan skema terstruktur berikut.
Teks penjelasan (explanation), nama makanan (foodName), dan tulisan catatan buku harian pribadi (journalNote) wajib ditulis dalam Bahasa Indonesia yang penuh kehangatan, penuh perhatian, dan ramah seperti asisten gizi pribadi skeuomorfik.
      `;

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              foodName: {
                type: Type.STRING,
                description: "Nama makanan atau minuman yang dianalisis dalam Bahasa Indonesia."
              },
              calories: {
                type: Type.INTEGER,
                description: "Total estimasi kalori makanan (dalam kkal)."
              },
              carbs: {
                type: Type.NUMBER,
                description: "Kandungan karbohidrat dalam satuan gram."
              },
              protein: {
                type: Type.NUMBER,
                description: "Kandungan protein dalam satuan gram."
              },
              fat: {
                type: Type.NUMBER,
                description: "Kandungan lemak dalam satuan gram."
              },
              explanation: {
                type: Type.STRING,
                description: "Penjelasan ringkas bagaimana kalori dan porsi diestimasi dalam Bahasa Indonesia."
              },
              journalNote: {
                type: Type.STRING,
                description: "Pesan hangat, motivasi positif, atau tip kesehatan pendek untuk ditulis di kertas harian, dlm Bahasa Indonesia."
              }
            },
            required: ["foodName", "calories", "carbs", "protein", "fat", "explanation", "journalNote"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Tidak menerima respons teks dari model Gemini.");
      }

      const parsedResult = JSON.parse(responseText.trim());
      res.json(parsedResult);
    } catch (error: any) {
      console.error("Error analyzing food:", error);
      res.status(500).json({ error: error.message || "Gagal menganalisis makanan menggunakan AI." });
    }
  });

  // Serve Vite or Static files depending on environment
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
