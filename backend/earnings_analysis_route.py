from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import yfinance as yf
from datetime import timedelta
import pandas as pd

router = APIRouter()

@router.get("/api/earnings-analysis")
def earnings_analysis(symbol: str = Query(..., min_length=1)):
    try:
        ticker = yf.Ticker(symbol)
        # Get earnings dates DataFrame (may be empty)
        earnings_dates = ticker.get_earnings_dates(limit=1)
        if earnings_dates is None or earnings_dates.empty:
            return JSONResponse(status_code=404, content={"error": "No earnings data found for this symbol."})
        # Get latest earnings date
        earnings_date = earnings_dates.index[0]
        earnings_date_str = earnings_date.strftime('%Y-%m-%d')
        actual_eps = earnings_dates.iloc[0]["EPS Actual"] if "EPS Actual" in earnings_dates.columns else None
        expected_eps = earnings_dates.iloc[0]["EPS Estimate"] if "EPS Estimate" in earnings_dates.columns else None
        surprise = None
        if actual_eps is not None and expected_eps is not None:
            surprise = actual_eps - expected_eps
        # Get price data 15 days before and after earnings
        start = (earnings_date - timedelta(days=15)).strftime('%Y-%m-%d')
        end = (earnings_date + timedelta(days=15)).strftime('%Y-%m-%d')
        hist = ticker.history(start=start, end=end)
        if hist is None or hist.empty:
            return JSONResponse(status_code=404, content={"error": "No price data found for this symbol around earnings date."})
        # Calculate daily and cumulative % change
        prices = []
        base_close = hist.iloc[0]["Close"]
        cum_pct_change = 0
        for idx, row in hist.iterrows():
            pct_change = ((row["Close"] - base_close) / base_close) * 100
            if len(prices) > 0:
                cum_pct_change = prices[-1]["cumPctChange"] + ((row["Close"] - prices[-1]["close"]) / prices[-1]["close"]) * 100
            else:
                cum_pct_change = pct_change
            prices.append({
                "date": idx.strftime('%Y-%m-%d'),
                "close": round(row["Close"], 2),
                "pctChange": round(pct_change, 2),
                "cumPctChange": round(cum_pct_change, 2)
            })
        return {
            "earningsDate": earnings_date_str,
            "actualEPS": actual_eps,
            "expectedEPS": expected_eps,
            "prices": prices,
            "surprise": surprise
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Earnings analysis unavailable", "details": str(e)})
