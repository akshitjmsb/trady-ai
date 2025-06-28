# trady_brain.py
import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

def ask_trady(portfolio_df, question, model):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return "❌ OpenRouter API key not found. Please set it in .env."

    messages = [
        {
            "role": "system",
            "content": (
                "You are Trady AI, a portfolio analyst. You answer questions based on the user's uploaded portfolio. "
                "Do not make up data. If portfolio data is missing, clearly say that."
            )
        },
        {
            "role": "user",
            "content": f"My portfolio:\n{portfolio_df.to_string(index=False)}\n\n{question}"
        }
    ]

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "https://trady-ai",
                "X-Title": "Trady AI"
            },
            json={
                "model": model,
                "messages": messages
            },
            timeout=60
        )
        result = response.json()

        if "choices" in result:
            return result["choices"][0]["message"]["content"]
        else:
            return f"❌ No 'choices' key in response: {result}"

    except Exception as e:
        return f"❌ Error while calling OpenRouter: {e}"
