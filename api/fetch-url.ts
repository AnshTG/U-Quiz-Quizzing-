import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
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

  if (typeof req.on === 'function') {
    const buffers: any[] = [];
    return new Promise((resolve) => {
      req.on('data', (chunk: any) => buffers.push(chunk));
      req.on('end', () => {
        try {
          const raw = Buffer.concat(buffers).toString('utf-8');
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => resolve({}));
    });
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

// Clean HTML into readable academic study text
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr)>/gi, '\n')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
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
    const { url } = body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL string is required.' });
    }

    // Auto-normalize URL protocol if user omitted "https://"
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported.' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL format provided.' });
    }

    // PATH 1: Dedicated Wikipedia REST & Action API for clean encyclopedia articles
    const wikiMatch = cleanUrl.match(/https?:\/\/([a-z0-9-]+)(?:\.m)?\.wikipedia\.org\/(?:wiki\/([^#?]+)|w\/index\.php\?title=([^#?&]+))/i);
    if (wikiMatch) {
      try {
        const lang = wikiMatch[1].toLowerCase();
        const rawTitle = wikiMatch[2] || wikiMatch[3] || '';
        const pageTitle = decodeURIComponent(rawTitle).split('#')[0].split('?')[0].replace(/_/g, ' ').trim();

        if (pageTitle) {
          // 1. Direct query with plain-text extract, auto-redirects, and origin=*
          const wikiApiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&explaintext=1&titles=${encodeURIComponent(pageTitle)}&redirects=1&origin=*`;

          const wikiRes = await fetch(wikiApiUrl, {
            headers: {
              'User-Agent': 'UQuizScholar/2.0 (Academic Study Assessment; https://uquiz.edu)',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(12000),
          });

          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            const pages = wikiData.query?.pages || {};
            const pageId = Object.keys(pages)[0];
            if (pageId && pageId !== '-1' && pages[pageId]?.extract) {
              const page = pages[pageId];
              const text = (page.extract as string).slice(0, 45000);
              const wordCount = text.split(/\s+/).filter(Boolean).length;
              return res.status(200).json({
                title: page.title || pageTitle,
                text,
                wordCount,
                url: cleanUrl,
              });
            }
          }

          // 2. Search generator fallback in case of typo or case discrepancy
          const searchApiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(pageTitle)}&gsrlimit=1&prop=extracts&explaintext=1&format=json&origin=*`;
          const searchRes = await fetch(searchApiUrl, {
            headers: {
              'User-Agent': 'UQuizScholar/2.0 (Academic Study Assessment; https://uquiz.edu)',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000),
          });

          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const pages = searchData.query?.pages || {};
            const pageId = Object.keys(pages)[0];
            if (pageId && pages[pageId]?.extract) {
              const page = pages[pageId];
              const text = (page.extract as string).slice(0, 45000);
              const wordCount = text.split(/\s+/).filter(Boolean).length;
              return res.status(200).json({
                title: page.title || pageTitle,
                text,
                wordCount,
                url: cleanUrl,
              });
            }
          }

          // 3. REST v1 summary fallback
          const restSummaryUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
          const restRes = await fetch(restSummaryUrl, {
            headers: {
              'User-Agent': 'UQuizScholar/2.0 (Academic Study Assessment; https://uquiz.edu)',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(8000),
          });
          if (restRes.ok) {
            const restData = await restRes.json();
            if (restData && restData.extract) {
              const text = `${restData.title}\n\n${restData.extract}`;
              return res.status(200).json({
                title: restData.title || pageTitle,
                text,
                wordCount: text.split(/\s+/).filter(Boolean).length,
                url: cleanUrl,
              });
            }
          }
        }
      } catch (wikiErr) {
        console.warn('Wikipedia API fetch notice, falling back to standard fetch:', wikiErr);
      }
    }

    // PATH 2: Dedicated Google Docs export
    const gdocsMatch = cleanUrl.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);
    if (gdocsMatch) {
      try {
        const docId = gdocsMatch[1];
        const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
        const gdocRes = await fetch(exportUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(12000),
        });
        if (gdocRes.ok) {
          const docText = await gdocRes.text();
          if (docText && docText.length > 50) {
            const text = docText.slice(0, 40000);
            const wordCount = text.split(/\s+/).filter(Boolean).length;
            return res.status(200).json({
              title: 'Google Doc Study Notes',
              text,
              wordCount,
              url: cleanUrl,
            });
          }
        }
      } catch (gdocErr) {
        console.warn('Google Doc export notice:', gdocErr);
      }
    }

    // PATH 3: Standard Webpage Direct Fetch with Real Browser Headers
    let fetchError: Error | null = null;
    try {
      const response = await fetch(parsedUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(14000),
      });

      if (response.ok) {
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : parsedUrl.hostname;

        const cleanText = stripHtml(html);
        if (cleanText.length >= 150) {
          const truncatedText = cleanText.slice(0, 40000);
          const wordCount = truncatedText.split(/\s+/).filter(Boolean).length;
          return res.status(200).json({
            title,
            text: truncatedText,
            wordCount,
            url: parsedUrl.toString(),
          });
        }
      }
    } catch (err: any) {
      fetchError = err;
      console.warn(`Direct fetch failed for ${cleanUrl} (${err.message}). Activating Gemini search grounding fallback...`);
    }

    // PATH 4: Intelligent Gemini Google Search Grounding Fallback
    // If the website has anti-bot protections (Cloudflare 403), captcha, or dynamic single-page javascript rendering:
    try {
      const ai = getAIClient();
      const searchPrompt = `Extract the full comprehensive academic syllabus, key concepts, detailed definitions, formulas, and educational notes from the webpage at: ${cleanUrl}.
Provide a thorough, richly detailed study summary (aim for 600-1500 words) formatted clearly into academic sections, covering all core facts so an examiner can formulate quiz questions directly from it.`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const extractedText = aiResponse.text?.trim();
      if (extractedText && extractedText.length > 80) {
        const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
        const fallbackTitle = parsedUrl.pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || parsedUrl.hostname;
        return res.status(200).json({
          title: fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1),
          text: extractedText,
          wordCount,
          url: cleanUrl,
        });
      }
    } catch (aiErr: any) {
      console.error('Gemini Search Grounding fallback failed:', aiErr);
    }

    return res.status(400).json({
      error: `Could not access webpage (${cleanUrl}). The site may require a login or private network access. You can also paste the text directly into the study notes area.`,
    });
  } catch (error: any) {
    console.error('Fetch URL error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to access webpage content. You can also copy and paste the text directly.',
    });
  }
}
