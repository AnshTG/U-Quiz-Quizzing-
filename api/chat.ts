import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

function getAIClient(): { ai: GoogleGenAI; keyFound: boolean } {
  const possibleKeys: [string, string | undefined][] = [
    ['GEMINI_API_KEY', process.env.GEMINI_API_KEY],
    ['API_KEY', process.env.API_KEY],
    ['GOOGLE_API_KEY', process.env.GOOGLE_API_KEY],
    ['VITE_GEMINI_API_KEY', process.env.VITE_GEMINI_API_KEY],
    ['GOOGLE_GENAI_API_KEY', process.env.GOOGLE_GENAI_API_KEY],
    ['GEMINI_KEY', process.env.GEMINI_KEY],
  ];

  for (const [, key] of possibleKeys) {
    if (key && key.trim().length > 0) {
      return {
        ai: new GoogleGenAI({
          apiKey: key.trim(),
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build-vercel',
            },
          },
        }),
        keyFound: true,
      };
    }
  }

  return {
    ai: null as any,
    keyFound: false,
  };
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

  if (typeof req.on === 'function') {
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
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: `Method ${req.method} Not Allowed. Expected POST request to /api/chat.`,
    });
  }

  try {
    const body = await parseBody(req);
    const { messages, classContext, subjectContext, syllabusYear = '2026-27' } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const { ai, keyFound } = getAIClient();
    if (!keyFound || !ai) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY environment variable is not configured on Vercel. Please add GEMINI_API_KEY to your Vercel Project Settings > Environment Variables, then redeploy.',
      });
    }

    const systemInstruction = `
      You are the official U-Quiz NCERT AI Study Tutor and Academic Mentor, strictly aligned with the latest ${syllabusYear} NCF-SE and NCERT curriculum for Classes 1 to 12.
      ${classContext ? `Target Grade: ${classContext}.` : ''}
      ${subjectContext ? `Subject: ${subjectContext}.` : ''}
      
      CHAT FORMATTING GUIDELINES (CRITICAL):
      - Format your response cleanly like an expert human tutor chatting with a student.
      - Use concise paragraphs and clean bullet points for steps and explanations.
      - Highlight key terms, laws, formulas, and textbook definitions using **bold text**.
      - For mathematical formulas and scientific notations, use clean readable formats (e.g. 1/2, x^2, H2O, or standard LaTeX $...$ for complex symbols).
      - Keep explanations engaging, direct, and structured.
      - Provide step-by-step solutions for numerical problems.
    `.trim();

    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-1.5-flash',
    ];

    let response: any = null;
    let lastErr: any = null;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err) {
        lastErr = err;
      }
    }

    if (!response || !response.text) {
      throw new Error(lastErr?.message || 'Empty response from AI study mentor.');
    }

    return res.status(200).json({ reply: response.text });
  } catch (error: any) {
    console.error('Serverless Chat API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate AI study tutor response',
    });
  }
}
