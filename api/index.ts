import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
app.use(express.json());

// Enable full CORS & Preflight handling for Vercel
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  if (_req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const possibleKeys = [
    process.env.GEMINI_API_KEY,
    process.env.API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.VITE_GEMINI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GEMINI_KEY,
  ];
  const apiKey = possibleKeys.find((k) => k && k.trim().length > 0)?.trim();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on Vercel. Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'uquiz-app-vercel',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint (handles both /api/health and /health)
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({ status: 'ok', domain: 'uquizzes.vercel.app', timestamp: Date.now() });
});

// Server-side Gemini Quiz Generation API (handles all route aliases)
app.post(['/api/generate-quiz', '/generate-quiz', '/api/quiz/generate', '/quiz/generate'], async (req, res) => {
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
    const questionType = config.questionType || 'single';

    let questionTypeInstruction = '';
    if (questionType === 'multiple') {
      questionTypeInstruction = `
      QUESTION FORMAT: MULTIPLE CHOICE (MORE THAN ONE CORRECT ANSWER).
      - Every question MUST have 2 or 3 correct answers out of 4 options.
      - In the question statement, add "(Select all that apply)" or "(Choose all correct options)".
      - Set "isMultiple": true.
      - In "correctAnswer", provide all correct option strings separated by " | " (e.g. "Option A text | Option C text").
      `;
    } else if (questionType === 'both') {
      questionTypeInstruction = `
      QUESTION FORMAT: MIXED (COMBINATION OF SINGLE AND MULTIPLE CHOICE).
      - Include some single-choice questions (1 correct option, set "isMultiple": false) and some multiple-choice questions (2 or 3 correct options, set "isMultiple": true, and add "(Select all that apply)" in the question text).
      - For multiple-choice questions, provide all correct options separated by " | " in "correctAnswer".
      `;
    } else {
      questionTypeInstruction = `
      QUESTION FORMAT: SINGLE CHOICE ONLY (EXACTLY 1 CORRECT ANSWER).
      - Every question must have exactly ONE correct answer.
      - Set "isMultiple": false.
      - In "correctAnswer", provide the exact matching string of the single correct option.
      `;
    }

    const prompt = `
      Act as a senior NCERT Subject Matter Expert.
      Generate a high-quality assessment with exactly ${quantity} items strictly aligned with the NCERT ${syllabusYear} curriculum.
      
      CONTEXT:
      - Academic Session: ${syllabusYear}
      - Grade: ${config.class}
      - Subject: ${config.subject}
      - Scope / Chapters: ${topicsList}
      - Cognitive Demand: ${strength} (Easy=Recall, Medium=Application, Hard=Analysis)

      ${questionTypeInstruction}

      OUTPUT FORMAT RULES (MANDATORY):
      1. Language: Use professional, academic English as per the subject.
      2. Options: Exactly 4 distinct options per question.
      3. Explanation: Provide a "Rationale" citing the official NCERT concept from the ${syllabusYear} textbook.
      
      TEXT & MATH RENDERING RULES (CRITICAL):
      - Mathematical formulas and equations: Write using clean LaTeX enclosed in single dollar signs ($...$) or standard notation (e.g., $x^2 + 5x + 6 = 0$, $\\sqrt{50}$, $\\frac{1}{2}$, $90^{\\circ}$, $\\pi$).
      - Fractions: Always write fractions in LaTeX inside dollar signs: $\\frac{a}{b}$.
      - Roots: Always write roots in LaTeX inside dollar signs: $\\sqrt{x}$ or $\\sqrt[3]{x}$.
      - Degrees: Always format angles and temperatures as $90^{\\circ}$ or $37^{\\circ}\\text{C}$.
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
                isMultiple: { type: Type.BOOLEAN },
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

    const cleanedJsonText = text
      .replace(/[\u000c]/g, '\\f')
      .replace(/\\f\s*rac\{/g, '\\frac{');

    const rawQuestions = JSON.parse(cleanedJsonText);
    const cleanMathString = (str: string) => {
      if (!str) return '';
      return str
        .replace(/[\u000c]/g, '\\f')
        .replace(/(^|[^\\])rac\{/g, '$1\\frac{')
        .trim();
    };

    const sanitized = rawQuestions.map((q: any) => ({
      ...q,
      options: (q.options || []).slice(0, 4).map((opt: string) => cleanMathString(opt)),
      question: cleanMathString(q.question || ''),
      correctAnswer: cleanMathString(q.correctAnswer || ''),
      explanation: cleanMathString(q.explanation || ''),
      isMultiple: !!q.isMultiple,
    }));

    return res.json({ questions: sanitized });
  } catch (error: any) {
    console.error('Quiz Generation API error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate assessment questions',
    });
  }
});

// Gemini Chat Endpoint (handles all route aliases)
app.post(['/api/gemini/chat', '/gemini/chat', '/api/ai/chat', '/ai/chat'], async (req, res) => {
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

// Admin Password Verification (handles all route aliases)
app.post(['/api/admin/verify', '/admin/verify'], (req, res) => {
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
