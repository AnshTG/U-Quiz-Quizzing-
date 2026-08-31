import { GoogleGenAI, Type } from '@google/genai';

export const maxDuration = 60;

function getAIClient(): { ai: GoogleGenAI; keyFound: boolean; keySource: string } {
  const possibleKeys: [string, string | undefined][] = [
    ['GEMINI_API_KEY', process.env.GEMINI_API_KEY],
    ['API_KEY', process.env.API_KEY],
    ['GOOGLE_API_KEY', process.env.GOOGLE_API_KEY],
    ['VITE_GEMINI_API_KEY', process.env.VITE_GEMINI_API_KEY],
    ['GOOGLE_GENAI_API_KEY', process.env.GOOGLE_GENAI_API_KEY],
    ['GEMINI_KEY', process.env.GEMINI_KEY],
  ];

  for (const [source, key] of possibleKeys) {
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
        keySource: source,
      };
    }
  }

  return {
    ai: null as any,
    keyFound: false,
    keySource: 'None',
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
      error: `Method ${req.method} Not Allowed. Expected POST request to /api/generate-quiz.`,
    });
  }

  try {
    const body = await parseBody(req);
    const { config } = body || {};

    if (!config || !config.class || !config.subject || !Array.isArray(config.topics) || config.topics.length === 0) {
      return res.status(400).json({
        error: 'Invalid quiz configuration provided. Please select a valid class, subject, and at least one chapter.',
      });
    }

    const { ai, keyFound, keySource } = getAIClient();
    if (!keyFound || !ai) {
      return res.status(500).json({
        error:
          'GEMINI_API_KEY environment variable is not configured on Vercel. Please add GEMINI_API_KEY to your Vercel Project Settings > Environment Variables, then redeploy.',
      });
    }

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

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-1.5-flash',
    ];

    let response: any = null;
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        response = await generateWithFallback(model);
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next:`, err?.message || err);
      }
    }

    if (!response || !response.text) {
      throw new Error(
        lastError?.message || 'Empty or invalid response received from Gemini AI model.'
      );
    }

    const text = response.text;
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

    return res.status(200).json({ questions: sanitized, source: keySource });
  } catch (error: any) {
    console.error('Serverless Quiz Generation Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate assessment questions with serverless function',
    });
  }
}
