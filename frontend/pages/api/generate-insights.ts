import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback mock insight
const mockInsight = (symbol: string) =>
  `Insight for ${symbol}: This is a mock AI-generated investment insight. For demonstration purposes only.`;

async function fetchGeminiInsight(symbol: string): Promise<string> {
  // This is a placeholder for the Gemini API integration
  // Replace with actual Gemini API call in production
  // Example prompt: `Summarize the investment outlook for ${symbol} in 2-3 sentences.`
  return mockInsight(symbol);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol } = req.query;

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid symbol parameter.' });
  }

  try {
    if (!GEMINI_API_KEY) {
      // No API key, return mock insight
      return res.status(200).json({ insight: mockInsight(symbol) });
    }

    // TODO: Implement Gemini API call here
    const insight = await fetchGeminiInsight(symbol);
    return res.status(200).json({ insight });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate insight.' });
  }
}
