import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

console.log('Gemini API key:', process.env.GEMINI_API_KEY ? '[SET]' : '[MISSING]');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const mockInsight = (symbol: string) =>
  `Insight for ${symbol}: This is a mock AI-generated investment insight. For demonstration purposes only.`;

async function fetchGeminiInsight(symbol: string, apiKey: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro-latest' });
    const prompt = `Provide a concise, actionable investment insight (2-3 sentences) for the stock symbol: ${symbol}.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text || 'No insight generated by Gemini API.';
  } catch (err: any) {
    console.error('Gemini API error:', err);
    throw new Error('Failed to fetch insight from Gemini API.');
  }
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
    const insight = await fetchGeminiInsight(symbol, GEMINI_API_KEY);
    return res.status(200).json({ insight });
  } catch (error: any) {
    return res.status(200).json({ insight: mockInsight(symbol) });
  }
}
