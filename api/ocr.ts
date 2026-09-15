import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const possibleKeys = [
    process.env.GEMINI_API_KEY,
    process.env.API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
  ].filter(Boolean);

  const apiKey = possibleKeys[0];
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });
  }
  return aiClient;
}

async function parseBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  if (typeof req[Symbol.asyncIterator] === 'function') {
    const buffers: any[] = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const raw = Buffer.concat(buffers).toString('utf-8');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    }
  }

  return {};
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = await parseBody(req);
    const { imageBase64, mimeType = 'image/jpeg' } = body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required for OCR transcription.' });
    }

    const ai = getAIClient();
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    const ocrPrompt = `
You are an expert optical character recognition (OCR) and handwriting transcription engine for academic notes, student notebooks, and printed materials.
Transcribe all handwritten and printed text in this image verbatim with 100% fidelity.

RULES:
1. Transcribe all text, headings, bullet points, and numbered lists precisely as written.
2. Format all mathematical equations, scientific expressions, and variables using standard LaTeX notation inside single dollar signs: $...$ (e.g., $E = mc^2$, $\\frac{dy}{dx}$, $x^2 + 2x + 1 = 0$, $\\sqrt{a^2 + b^2}$).
3. Format chemical reactions and molecular formulas properly (e.g., $\\ce{H2 + Cl2 -> 2HCl}$, $\\ce{CaCO3}$, $\\ce{SO4^{2-}}$).
4. If diagrams, tables, or graphs are present in the notes, insert a concise bracketed summary, e.g. [Diagram: Ray diagram of concave mirror showing real, inverted image between F and C].
5. Do NOT add conversational preamble, markdown code blocks, or conversational filler. Output only the transcribed academic text directly.
`.trim();

    // Fallback models if primary model is rate limited
    const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
    let lastError: Error | null = null;
    let transcribedText = '';

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType, data: cleanBase64 } },
                { text: ocrPrompt },
              ],
            },
          ],
        });

        transcribedText = response.text || '';
        break;
      } catch (err: any) {
        console.warn(`OCR model ${model} failed, trying fallback:`, err.message);
        lastError = err;
      }
    }

    if (!transcribedText && lastError) {
      throw lastError;
    }

    const wordCount = transcribedText.trim().split(/\s+/).filter(Boolean).length;

    return res.status(200).json({
      transcribedText,
      wordCount,
    });
  } catch (error: any) {
    console.error('OCR transcription error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe notes from image',
    });
  }
}
