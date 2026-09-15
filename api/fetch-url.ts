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
    const { url } = body || {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'A valid URL string is required.' });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only HTTP and HTTPS URLs are supported.' });
      }
    } catch {
      return res.status(400).json({ error: 'Invalid URL format provided.' });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 UQuizBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return res.status(400).json({
        error: `Could not fetch webpage (HTTP ${response.status}: ${response.statusText})`,
      });
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    const cleanText = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, ' ')
      .trim();

    const truncatedText = cleanText.slice(0, 35000);
    const wordCount = truncatedText.split(/\s+/).filter(Boolean).length;

    return res.status(200).json({
      title,
      text: truncatedText,
      wordCount,
      url: parsedUrl.toString(),
    });
  } catch (error: any) {
    console.error('Fetch URL error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch webpage content. You can also copy and paste the text directly.',
    });
  }
}
