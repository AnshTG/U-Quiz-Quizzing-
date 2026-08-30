import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Server-side Gemini Quiz Generation API
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { config } = req.body;
    if (!config || !config.class || !config.subject || !Array.isArray(config.topics) || config.topics.length === 0) {
      return res.status(400).json({ error: 'Invalid quiz configuration provided.' });
    }

    const ai = getAIClient();
    const topicsList = config.topics.join(', ');
    const quantity = typeof config.quantity === 'number' && config.quantity > 0 ? config.quantity : 10;
    const strength = config.strength || 'Medium';
    const syllabusYear = config.syllabusYear || '2026-27';

    const prompt = `
      Act as a senior NCERT Subject Matter Expert.
      Generate a high-quality assessment with exactly ${quantity} items strictly aligned with the NCERT ${syllabusYear} curriculum.
      
      CONTEXT:
      - Academic Session: ${syllabusYear}
      - Grade: ${config.class}
      - Subject: ${config.subject}
      - Scope / Chapters: ${topicsList}
      - Cognitive Demand: ${strength} (Easy=Recall, Medium=Application, Hard=Analysis)

      OUTPUT FORMAT RULES (MANDATORY):
      1. Language: Use professional, academic English as per the subject.
      2. Options: Exactly 4 distinct options per question.
      3. Explanation: Provide a "Rationale" citing the official NCERT concept from the ${syllabusYear} textbook.
      
      TEXT & MATH RENDERING RULES (CRITICAL):
      - Mathematical formulas and equations: Write using clean LaTeX enclosed in single dollar signs ($...$) or standard notation (e.g., $x^2 + 5x + 6 = 0$, $\\sqrt{25} = 5$, $\\frac{3}{4}$).
      - Currency: Always use "₹" for Indian Rupee (e.g. ₹500, never $500).
      - Plain text & Units: DO NOT wrap plain words, units, or plain numbers in dollar signs.
      - Clean Formatting: Ensure all opening dollar signs have matching closing dollar signs.
    `;

    const generateWithFallback = async (modelName: string) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation'],
            },
          },
        },
      });
    };

    let response;
    try {
      response = await generateWithFallback('gemini-3.7-flash');
    } catch (err: any) {
      console.warn('Fallback to flash-latest:', err?.message || err);
      try {
        response = await generateWithFallback('gemini-flash-latest');
      } catch (fallbackErr: any) {
        console.warn('Fallback to gemini-3.1-flash-lite:', fallbackErr?.message || fallbackErr);
        response = await generateWithFallback('gemini-3.1-flash-lite');
      }
    }

    const text = response.text;
    if (!text) {
      return res.status(500).json({ error: 'Empty generation response from AI model' });
    }

    const rawQuestions = JSON.parse(text);
    return res.json({ questions: rawQuestions });
  } catch (error: any) {
    console.error('Quiz Generation API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate assessment questions',
    });
  }
});

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, classContext, subjectContext, syllabusYear = '2026-27' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAIClient();
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const replyText = response.text || 'I apologize, but I could not generate a response. Please try again.';
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini Chat API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate AI study tutor response',
    });
  }
});

// Admin Password Verification
app.post('/api/admin/verify', (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    const cleanInput = password.trim().replace(/[:\s-]/g, '').toLowerCase();
    if (!cleanInput) {
      return res.status(400).json({ success: false, error: 'Password cannot be empty' });
    }

    const now = Date.now();
    let isMatch = false;

    for (const offset of [-60000, 0, 60000]) {
      const istMs = (now + offset) + (5.5 * 3600 * 1000);
      const istDate = new Date(istMs);

      const hours24 = istDate.getUTCHours();
      const hours12 = hours24 % 12 || 12;
      const mins = istDate.getUTCMinutes();

      const mm = String(mins).padStart(2, '0');
      const hh24 = String(hours24).padStart(2, '0');
      const hh12 = String(hours12).padStart(2, '0');

      const candidates = [
        `${hh24}${mm}`,
        `${hours24}${mm}`,
        `${hh12}${mm}`,
        `${hours12}${mm}`,
      ];

      if (candidates.includes(cleanInput)) {
        isMatch = true;
        break;
      }
    }

    if (isMatch) {
      return res.json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Incorrect administrator password.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Verification service error' });
  }
});

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req, res);
}
