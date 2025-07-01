import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// A simple function to simulate a delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ detail: 'No message provided.' }, { status: 400 });
    }

    // Simulate AI thinking time
    await sleep(1500);

    // In a real application, you would send the message to an AI model.
    // For now, we'll return a mock response.
    const assistantResponse = "I'm Trady, your AI portfolio assistant. Based on the mock data, your portfolio includes MSFT, TSLA, and NVDA. How can I help you analyze it today?";

    return NextResponse.json({ reply: assistantResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ detail: 'An error occurred while processing your message.' }, { status: 500 });
  }
}
