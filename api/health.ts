export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    domain: 'uquizzes.vercel.app',
    serverless: true,
    timestamp: Date.now(),
    hasGeminiKey: !!(process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY),
  });
}
