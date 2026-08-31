import { QuizConfig, Question } from "../types";

/**
 * Extract human-readable error description from a fetch response (handles JSON or HTML error pages)
 */
async function parseResponseError(res: Response): Promise<string> {
  let message = `Server responded with HTTP ${res.status} (${res.statusText || 'Error'})`;
  try {
    const rawText = await res.text();
    if (!rawText) return message;

    try {
      const json = JSON.parse(rawText);
      if (json && json.error) {
        return typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
      }
    } catch {
      // If it's an HTML error page (e.g. Vercel 504 / 502 / 500 error page)
      const cleanText = rawText
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanText) {
        if (cleanText.includes('FUNCTION_INVOCATION_TIMEOUT') || cleanText.includes('504') || cleanText.includes('Gateway Timeout')) {
          return 'Serverless generation timed out on Vercel (504). The AI model took longer than the serverless limit. Please try selecting fewer chapters or smaller question quantity.';
        }
        if (cleanText.includes('405') || cleanText.includes('Method Not Allowed')) {
          return 'API route returned 405 Method Not Allowed. Please ensure the serverless function is deployed.';
        }
        return `${message}: ${cleanText.slice(0, 180)}`;
      }
    }
  } catch {
    // ignore
  }
  return message;
}

export const generateQuestions = async (
  config: QuizConfig,
  signal?: AbortSignal
): Promise<Question[]> => {
  const endpoints = ['/api/generate-quiz', '/generate-quiz'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ config }),
        signal,
      });

      if (!res.ok) {
        const errorDetail = await parseResponseError(res);
        // If 404 or 405 on first endpoint, try next
        if ((res.status === 404 || res.status === 405) && endpoint !== endpoints[endpoints.length - 1]) {
          console.warn(`Endpoint ${endpoint} returned ${res.status}, attempting fallback...`);
          continue;
        }
        throw new Error(errorDetail);
      }

      const data = await res.json();
      if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('AI returned an empty question list. Please try again with different topics.');
      }

      return data.questions;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Assessment generation was cancelled.');
      }
      lastError = err;
      // If it wasn't a 404/405 route error, don't silently loop through other endpoints
      if (!err.message?.includes('404') && !err.message?.includes('405')) {
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate assessment questions. Please check your connection and API key configuration.');
};

export interface GeminiChatQueryOptions {
  messages: { role: 'user' | 'model'; content: string }[];
  classContext?: string;
  subjectContext?: string;
  syllabusYear?: string;
}

export const sendGeminiStudyQuery = async (
  options: GeminiChatQueryOptions,
  signal?: AbortSignal
): Promise<string> => {
  const endpoints = ['/api/chat', '/api/gemini/chat', '/gemini/chat'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(options),
        signal,
      });

      if (!res.ok) {
        const errorDetail = await parseResponseError(res);
        if ((res.status === 404 || res.status === 405) && endpoint !== endpoints[endpoints.length - 1]) {
          continue;
        }
        throw new Error(errorDetail);
      }

      const data = await res.json();
      if (!data || !data.reply) {
        throw new Error('No response received from AI Study Tutor.');
      }

      return data.reply;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Query was cancelled.');
      }
      lastError = err;
      if (!err.message?.includes('404') && !err.message?.includes('405')) {
        break;
      }
    }
  }

  throw lastError || new Error('Failed to communicate with AI Study Tutor.');
};
