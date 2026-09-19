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
        const errStr = typeof json.error === 'string' ? json.error : JSON.stringify(json.error);
        if (res.status === 413 || errStr.toLowerCase().includes('entity too large') || errStr.toLowerCase().includes('payload too large')) {
          return 'Request entity too large (HTTP 413). Upload has been automatically optimized to fit within gateway limits.';
        }
        return errStr;
      }
    } catch {
      // If it's an HTML error page (e.g. Vercel 504 / 502 / 500 / 413 error page)
      const cleanText = rawText
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanText) {
        if (cleanText.includes('404 NOT_FOUND') || cleanText.includes('This page doesn’t exist') || cleanText.includes('bom1::') || res.status === 404) {
          return 'Webpage extraction endpoint route was temporarily unreachable (HTTP 404 Gateway Notice). You can paste your study notes or article text directly into the input area.';
        }
        if (res.status === 413 || cleanText.includes('FUNCTION_PAYLOAD_TOO_LARGE') || cleanText.includes('Entity Too Large') || cleanText.includes('Payload Too Large') || cleanText.includes('413')) {
          return 'Uploaded content exceeded server gateway payload limits (HTTP 413: Entity Too Large). Files are now automatically optimized before transmission.';
        }
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

export interface GeminiChatResponse {
  reply: string;
  isTestable: boolean;
}

export const sendGeminiStudyQuery = async (
  options: GeminiChatQueryOptions,
  signal?: AbortSignal
): Promise<GeminiChatResponse> => {
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
      if (!data || typeof data.reply !== 'string') {
        throw new Error('No response received from AI Study Tutor.');
      }

      const rawReply = data.reply || '';
      let isTestable = data.isTestable;

      // Extract and clean tag if present in reply text
      let cleanReply = rawReply;
      const testableMatch = rawReply.match(/<!--\s*TESTABLE:\s*(true|false)\s*-->/i);
      if (testableMatch) {
        isTestable = testableMatch[1].toLowerCase() === 'true';
        cleanReply = rawReply.replace(/<!--\s*TESTABLE:\s*(true|false)\s*-->/gi, '').trim();
      }

      if (typeof isTestable !== 'boolean') {
        const isGreeting = /^(hi|hello|hey|welcome|good\s+(morning|afternoon|evening)|sure|you'?re\s+welcome|no\s+problem|thanks|thank\s+you)[\s!.]*$/i.test(cleanReply.trim());
        const isClarification = cleanReply.length < 120 && /\?$/.test(cleanReply.trim()) && /(which|what)\s+(grade|class|subject|chapter|topic)/i.test(cleanReply);
        isTestable = !isGreeting && !isClarification && cleanReply.length > 80;
      }

      return {
        reply: cleanReply,
        isTestable: Boolean(isTestable)
      };
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

/**
 * Transcribe handwritten or computer-written notes image using OCR API
 */
export const transcribeNotesImage = async (
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  signal?: AbortSignal
): Promise<{ transcribedText: string; wordCount: number }> => {
  const endpoints = ['/api/ocr', '/ocr'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ imageBase64, mimeType }),
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
      return {
        transcribedText: data.transcribedText || '',
        wordCount: data.wordCount || 0,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Transcription was cancelled.');
      }
      lastError = err;
      if (!err.message?.includes('404') && !err.message?.includes('405')) {
        break;
      }
    }
  }

  throw lastError || new Error('Failed to transcribe notes image. Please try again.');
};

/**
 * Parse Wikipedia language code and page title from Wikipedia desktop, mobile, or index URLs
 */
export function parseWikipediaUrl(rawUrl: string): { lang: string; title: string } | null {
  try {
    const urlStr = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    const parsed = new URL(urlStr);
    const hostMatch = parsed.hostname.match(/^([a-z0-9-]+)(?:\.m)?\.wikipedia\.org$/i);
    if (!hostMatch) return null;
    const lang = hostMatch[1].toLowerCase();

    let title = '';
    if (parsed.pathname.startsWith('/wiki/')) {
      const rawTitle = parsed.pathname.replace(/^\/wiki\//, '');
      title = decodeURIComponent(rawTitle.split('#')[0].split('?')[0]);
    } else if (parsed.searchParams.has('title')) {
      title = decodeURIComponent(parsed.searchParams.get('title') || '');
    }

    if (!title) return null;
    return { lang, title: title.replace(/_/g, ' ').trim() };
  } catch {
    return null;
  }
}

/**
 * Direct client-side Wikipedia extraction with CORS (origin=*)
 * Bypasses serverless 404 gateway issues, edge blocks, and datacenter limits.
 */
export const fetchWikipediaDirect = async (
  rawUrl: string,
  signal?: AbortSignal
): Promise<{ title: string; text: string; wordCount: number; url: string }> => {
  const parsed = parseWikipediaUrl(rawUrl);
  if (!parsed) {
    throw new Error('Not a recognized Wikipedia article URL format.');
  }

  const { lang, title } = parsed;

  // Step 1: Query Wikipedia Action API extracts with automatic redirects and CORS origin=*
  try {
    const apiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&titles=${encodeURIComponent(title)}&redirects=1&origin=*`;
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      if (page && pageId !== '-1' && page.extract && page.extract.trim().length >= 80) {
        const cleanExtract = page.extract
          .replace(/===\s*References\s*===[\s\S]*/i, '')
          .replace(/===\s*External links\s*===[\s\S]*/i, '')
          .replace(/===\s*See also\s*===[\s\S]*/i, '')
          .trim();

        const words = cleanExtract.split(/\s+/).filter(Boolean).length;
        return {
          title: page.title || title,
          text: cleanExtract.slice(0, 50000),
          wordCount: words,
          url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title || title)}`,
        };
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  // Step 2: Wikipedia Search Generator fallback (resolves titles with slight spelling variations)
  try {
    const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(title)}&gsrlimit=1&prop=extracts&explaintext=1&format=json&origin=*`;
    const res = await fetch(searchUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      const pages = data.query?.pages || {};
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      if (page && page.extract && page.extract.trim().length >= 80) {
        const cleanExtract = page.extract
          .replace(/===\s*References\s*===[\s\S]*/i, '')
          .replace(/===\s*External links\s*===[\s\S]*/i, '')
          .replace(/===\s*See also\s*===[\s\S]*/i, '')
          .trim();

        const words = cleanExtract.split(/\s+/).filter(Boolean).length;
        return {
          title: page.title || title,
          text: cleanExtract.slice(0, 50000),
          wordCount: words,
          url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title || title)}`,
        };
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  // Step 3: Wikipedia REST v1 page summary endpoint
  try {
    const restUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(restUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.extract && data.extract.trim().length >= 60) {
        const fullContent = `${data.title}\n\n${data.description ? `Overview: ${data.description}\n\n` : ''}${data.extract}`;
        return {
          title: data.title || title,
          text: fullContent,
          wordCount: fullContent.split(/\s+/).filter(Boolean).length,
          url: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        };
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
  }

  throw new Error(`The Wikipedia page for "${title}" could not be located on Wikipedia. Please verify the topic title.`);
};

/**
 * Fetch and extract readable study text from an article or webpage URL
 */
export const fetchWebpageContent = async (
  url: string,
  signal?: AbortSignal
): Promise<{ title: string; text: string; wordCount: number; url: string }> => {
  // If the target is a Wikipedia URL, prioritize direct browser extraction
  // This guarantees fast results and immunizes users against serverless 404s and proxy gateways
  if (/wikipedia\.org/i.test(url)) {
    try {
      return await fetchWikipediaDirect(url, signal);
    } catch (wikiErr: any) {
      if (wikiErr.name === 'AbortError') throw wikiErr;
      console.warn('Direct Wikipedia fetch encountered issue, attempting backend endpoint fallback:', wikiErr);
    }
  }

  const endpoints = ['/api/fetch-url', '/fetch-url'];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url }),
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
      return {
        title: data.title || url,
        text: data.text || '',
        wordCount: data.wordCount || 0,
        url: data.url || url,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Webpage extraction was cancelled.');
      }
      lastError = err;
      if (!err.message?.includes('404') && !err.message?.includes('405')) {
        break;
      }
    }
  }

  throw lastError || new Error('Failed to fetch webpage content. Please check the URL or paste notes manually.');
};

