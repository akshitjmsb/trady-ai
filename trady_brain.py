# trady_brain.py
import os
import json
from datetime import date
from typing import List

import requests
import yfinance as yf
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

def _attach_live_prices(df):
    """Enrich the portfolio DataFrame with today's close price and gain %."""
    tickers: List[str] = df["symbol"].tolist()
    try:
        price_df = yf.download(tickers, period="1d", progress=False, threads=True)
        # yf.download returns a DataFrame; if multiple tickers we get multi-index columns
        if isinstance(price_df.columns, pd.MultiIndex):
            closes = price_df["Adj Close"].iloc[-1]
        else:
            closes = price_df.iloc[-1]
        df["last_price"] = df["symbol"].map(closes.to_dict())
    except Exception:
        # fallback per-ticker (slower)
        prices = {}
        for sym in tickers:
            try:
                prices[sym] = yf.Ticker(sym).history(period="1d")["Close"].iloc[-1]
            except Exception:
                prices[sym] = float('nan')
        df["last_price"] = df["symbol"].map(prices)

    # compute gain % where data available
    df["gain_%"] = (df["last_price"] - df["avg_price"]) / df["avg_price"] * 100
    return df

def ask_trady(portfolio_df, question, model):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return "❌ OpenRouter API key not found. Please set it in .env."

    # enrich portfolio with live prices
    portfolio_df = _attach_live_prices(portfolio_df.copy())

    today = date.today().isoformat()

    messages = [
        {
            "role": "system",
            "content": (
                f"You are Trady AI, a portfolio analyst. Today is {today}. "
                "Live prices were fetched from Yahoo Finance and are included as 'last_price' and 'gain_%'. "
                "Provide concise Buy / Hold / Sell suggestions. Do not invent prices. If data is missing, say so."
            )
        },
        {
            "role": "user",
            "content": f"My portfolio (with live prices):\n{portfolio_df.to_string(index=False)}\n\n{question}"
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
