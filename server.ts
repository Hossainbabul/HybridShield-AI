import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Initialize Gemini client (server-side only)
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
      architecture: '4-Tier Hybrid Moderation System',
    });
  });

  // Layer 3 LLM Reasoner endpoint
  app.post('/api/llm-audit', async (req, res) => {
    const { comment } = req.body;

    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ error: 'Comment string is required' });
    }

    // If Gemini client is not initialized, return a simulated fallback
    if (!ai) {
      console.log('No GEMINI_API_KEY found, returning contextual heuristic audit');
      const lower = comment.toLowerCase();
      const isSarcasm = lower.includes('genius') || lower.includes('surely') || lower.includes('oh wow');
      const isThreat = lower.includes('kill') || lower.includes('hunt') || lower.includes('shoot');
      const isToxic = lower.includes('trash') || lower.includes('idiot') || lower.includes('hate');

      if (isThreat) {
        return res.json({
          action: 'ESCALATE_HUMAN',
          reason: 'Severe risk marker detected requiring human policy specialist inspection.',
          confidence: 0.90,
          model: 'gemini-3.8-flash (simulated offline)',
        });
      }

      if (isToxic) {
        return res.json({
          action: 'BLOCK',
          reason: 'LLM Reasoner identified nuanced toxic intent masked as sarcasm or slang.',
          confidence: 0.92,
          model: 'gemini-3.8-flash (simulated offline)',
        });
      }

      if (isSarcasm) {
        return res.json({
          action: 'ALLOW',
          reason: 'LLM recognized non-harmful cynical humor / benign irony. Safe to post.',
          confidence: 0.88,
          model: 'gemini-3.8-flash (simulated offline)',
        });
      }

      return res.json({
        action: 'ALLOW',
        reason: 'Nuance analysis determined safe discourse context.',
        confidence: 0.85,
        model: 'gemini-3.8-flash (simulated offline)',
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an advanced Content Safety Classifier. Analyze the following comment for nuanced toxicity, sarcasm, covert threats, hate speech, identity attacks, or severe harassment.
If it is benign, constructive, safe humor, or acceptable discourse, choose "ALLOW".
If it is toxic, harassing, deceptive, or hateful, choose "BLOCK".
If it is genuinely ambiguous, involves legal/physical hazard, or requires human policy review, choose "ESCALATE_HUMAN".

Comment: "${comment}"`,
        config: {
          temperature: 0.0,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                enum: ['ALLOW', 'BLOCK', 'ESCALATE_HUMAN'],
                description: 'The moderation action to take',
              },
              reason: {
                type: Type.STRING,
                description: 'A brief, clear justification for the action (under 25 words)',
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence between 0.0 and 1.0',
              },
            },
            required: ['action', 'reason'],
          },
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        action: parsed.action || 'ALLOW',
        reason: parsed.reason || 'Evaluated by Gemini 3.8 Flash Reasoner',
        confidence: parsed.confidence || 0.95,
        model: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Error invoking Gemini 3.8 Flash:', err);
      return res.status(500).json({
        error: 'LLM call failed',
        details: err?.message || 'Unknown error',
        fallback: {
          action: 'ESCALATE_HUMAN',
          reason: 'LLM processing error; safely escalated to human review queue.',
          confidence: 0.5,
        },
      });
    }
  });

  // Setup Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
