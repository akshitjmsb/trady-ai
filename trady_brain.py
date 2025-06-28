# trady_brain.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def ask_trady(user_input, portfolio, model):
    if not OPENROUTER_API_KEY:
        return "❌ Missing OpenRouter API key. Please set OPENROUTER_API_KEY in your .env file."

    # Format the portfolio into a readable string for the LLM
    portfolio_str = "\n".join([
        f"{item['symbol']}: {item['units']} units at avg ${item['avg_price']}"
        for item in portfolio
    ])

    # System prompt to guide LLM behavior
    system_prompt = (
        "You are Trady AI, a helpful and responsible financial assistant. "
        "Your job is to analyze the user's investment portfolio and help them understand asset allocation, risk exposure, diversification, and long-term performance outlook. "
        "Do NOT give specific buy/sell/hold advice. Keep responses educational and data-driven."
    )

    # Payload structure for OpenRouter API
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"My holdings:\n{portfolio_str}\n\nQuestion: {user_input}"}
        ]
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return f"❌ API Error: {e}"
