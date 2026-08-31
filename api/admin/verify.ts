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
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = await parseBody(req);
    const { password } = body || {};
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
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Incorrect administrator password.' });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Verification service error' });
  }
}
