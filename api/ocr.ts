import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
};

export const maxDuration = 60;

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
You are a master handwriting recognition expert, paleographer, and academic OCR engine specialized in deciphering cursive handwriting, rapid lecture shorthand, cursive ligatures, messy scribbles, and student notes.
Transcribe all handwritten and printed text in this image verbatim with maximum fidelity.

HOW TO ACCURATELY DECIPHER CURSIVE & FAST WRITTEN NOTES:
1. CURSIVE LIGATURES & SLOPED WRITING:
   - Carefully follow connecting strokes and loops. Accurately disambiguate difficult cursive letter pairs: 'm' vs 'rn'/'nn', 'cl' vs 'd', 'u' vs 'v'/'w', 'a' vs 'o'/'u', 'b' vs 'l'/'f', looped 'e' vs 'l'.
   - In fast writing, dots on 'i'/'j' and crosses on 't' are often omitted, misplaced, or tied to subsequent letters. Reconstruct words accurately using academic context.
   - For words written with high momentum or cursive slant, read whole word shapes and letter counts.

2. RAPID LECTURE ABBREVIATIONS & SHORTHAND:
   - Faithfully transcribe student abbreviations (e.g., "w/", "w/o", "b/c", "eqn", "diff", "temp", "approx", "prop to", "def", "i.e.", "e.g.", "pt", "const", "vol", "conc", "soln", "rxn", "wt").
   - Preserve the exact student notes structure and terminology.

3. CONTEXT-GUIDED SUBJECT RECONSTRUCTION:
   - Use scientific and academic domain knowledge (Physics, Chemistry, Biology, Mathematics, Social Sciences) to accurately resolve hurriedly scribbled terminology, laws, and definitions.
   - e.g., in a Biology context, rapid cursive resembling "mit...dria" is "mitochondria"; in Physics, "res...ance" is "resistance".

4. MATHEMATICAL & SCIENTIFIC FORMULAS:
   - Convert all math equations, variables, powers, indices, fractions, square roots, and Greek symbols into clean standard LaTeX enclosed in single dollar signs: $...$ (e.g., $E = mc^2$, $v = u + at$, $F = G \\frac{m_1 m_2}{r^2}$, $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, $\\sin^2\\theta + \\cos^2\\theta = 1$).
   - Transcribe Greek symbols accurately: $\\alpha, \\beta, \\gamma, \\theta, \\lambda, \\mu, \\pi, \\sigma, \\omega, \\Delta$.

5. CHEMICAL REACTIONS:
   - Format chemical reactions and molecular formulas properly (e.g., $\\ce{2H2 + O2 -> 2H2O}$, $\\ce{CaCO3 -> CaO + CO2}$, $\\ce{SO4^{2-}}$).

6. MARGIN NOTES, CALLOUTS, & DIAGRAMS:
   - Transcribe side margins, starred notes, underlined keywords, and bullet points in logical reading sequence.
   - If a sketch, diagram, or circuit is present, provide a concise bracketed description: [Diagram: Description of sketch, labels, and flow].

7. CLEAN OUTPUT:
   - Output only the transcribed academic text directly. Do NOT include conversational preamble, greetings, or markdown code blocks.
`.trim();

    // Fallback models if primary model is rate limited
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
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
