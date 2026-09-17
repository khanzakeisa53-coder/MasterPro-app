import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy Gemini AI instance getter
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'App Master Pro API'
  });
});

// Streaming AI generation endpoint using Gemini
app.post('/api/ai/stream', async (req, res) => {
  try {
    const { prompt, mode, capability, context, imageBase64, mimeType } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or media is required' });
    }

    const ai = getAIClient();

    // Determine system instructions based on capability & mode
    let systemInstruction = `You are "App Master Pro - Enterprise AI", an advanced, high-performance executive AI copilot.
Your interface has a deep slate-navy aesthetic with vibrant neon highlights.
You deliver high-impact, articulate, beautifully structured enterprise-grade responses with clear markdown headers, bulleted insights, code/formula snippets if relevant, and actionable strategic next steps.`;

    if (capability === 'create') {
      systemInstruction += `\nMode: CREATE (AI Content). Focus on world-class copywriting, executive summaries, marketing pitches, technical articles, and creative innovation.`;
    } else if (capability === 'visualize') {
      systemInstruction += `\nMode: VISUALIZE (AI Design). Provide detailed visual concept designs, UI/UX wireframe breakdowns, design tokens, color palette palettes, SVG visual specifications, or image asset descriptions.`;
    } else if (capability === 'manage') {
      systemInstruction += `\nMode: MANAGE (AI Document). Focus on intelligent document synthesis, structured data extraction, key takeaways, executive briefings, and tabular analytics ready for spreadsheet ingestion.`;
    } else if (capability === 'improve') {
      systemInstruction += `\nMode: IMPROVE (AI Learning). Act as an elite accelerator coach. Provide accelerated study guides, step-by-step masteries, cognitive frameworks, and practical drills.`;
    }

    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Prepare content parts
    const parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBase64,
        },
      });
    }
    if (prompt) {
      parts.push({
        text: prompt + (context ? `\n\nContext:\n${context}` : ''),
      });
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: parts,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error in AI stream generation:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error?.message || 'Failed to generate response' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error?.message || 'Stream error occurred' })}\n\n`);
      res.end();
    }
  }
});

// Single-turn AI generation endpoint
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, capability, context } = req.body;
    const ai = getAIClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt + (context ? `\n\nContext:\n${context}` : ''),
      config: {
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate content' });
  }
});

// AI Order Parser endpoint for WhatsApp chat extraction
app.post('/api/ai/parse-order', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      return res.status(400).json({ error: 'Teks pesanan mentah wajib diisi' });
    }

    const ai = getAIClient();
    const prompt = `You are an expert Indonesian retail and wholesale order processing assistant.
Extract structured order information from the following customer WhatsApp message or note:

"""
${rawText}
"""

Return ONLY a valid JSON object (no markdown, no backticks, no comments) with this schema:
{
  "customerName": string (e.g. "Budi Santoso" or empty string if not found),
  "customerPhone": string (digits only, e.g. "081234567890"),
  "customerCompany": string (e.g. "PT Sinar Mas" or empty string),
  "destinationTag": string (address or delivery destination),
  "customerNpwp": string (NPWP or NIK if mentioned),
  "courier": string (e.g. "Dakota Cargo", "JNE", "J&T", "SiCepat" or "Dakota Cargo"),
  "notes": string (special requests, packaging notes, etc.),
  "applyTax": boolean (true if PPN or faktur pajak is mentioned, else false),
  "taxRate": number (11 or 12 if PPN, else 0),
  "items": [
    {
      "name": string (product name),
      "qty": number (integer >= 1),
      "unitPrice": number (unit price in Rupiah, numeric only, e.g. 450000; if missing estimate realistically or 0)
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    });

    const cleaned = (response.text || '').trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    const parsedData = JSON.parse(cleaned);

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/ai/parse-order:', error);
    res.status(500).json({ error: error?.message || 'Failed to parse order with Gemini' });
  }
});

// Vite & Static file serving setup
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`App Master Pro server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
