from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import yfinance as yf
import pandas as pd

router = APIRouter()

@router.get("/api/price-history")
def price_history(
    symbol: str = Query(..., min_length=1),
    range: str = Query("5y", regex="^(1d|5d|1m|6m|ytd|1y|5y|max)$")
):
    try:
        yf_range_map = {
            "1d": ("1d", "5m"),
            "5d": ("5d", "15m"),
            "1m": ("1mo", "1d"),
            "6m": ("6mo", "1d"),
            "ytd": ("ytd", "1d"),
            "1y": ("1y", "1d"),
            "5y": ("5y", "1d"),
            "max": ("max", "1d"),
        }
        yf_range, interval = yf_range_map.get(range, ("5y", "1d"))
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=yf_range, interval=interval)
        info = ticker.info
        if hist.empty or "Close" not in hist or not info or 'shortName' not in info:
            return JSONResponse(status_code=404, content={"error": "Snapshot unavailable"})

        # Header
        price = info.get('regularMarketPrice', 'N/A')
        prev_close = info.get('regularMarketPreviousClose', price)
        change = None
        if isinstance(price, (int, float)) and isinstance(prev_close, (int, float)):
            change = price - prev_close
        after_hours = info.get('postMarketPrice', None)
        timestamp = info.get('regularMarketTime', None)
        name = info.get('shortName', symbol)
        header = {
            "name": name,
            "symbol": symbol.upper(),
            "price": price,
            "change": change,
            "afterHours": after_hours,
            "timestamp": timestamp,
        }

        # Chart
        dates = [str(d)[:10] if hasattr(d, 'date') else str(d) for d in hist.index]
        closes = [x if pd.notnull(x) else None for x in hist["Close"]]
        chart = {"dates": dates, "close": closes}

        # Metrics
        metrics = {
            "open": info.get("regularMarketOpen", "N/A"),
            "dayLow": info.get("dayLow", "N/A"),
            "dayHigh": info.get("dayHigh", "N/A"),
            "marketCap": info.get("marketCap", "N/A"),
            "peRatio": info.get("trailingPE", "N/A"),
            "volume": info.get("regularMarketVolume", "N/A"),
            "yearLow": info.get("fiftyTwoWeekLow", "N/A"),
            "yearHigh": info.get("fiftyTwoWeekHigh", "N/A"),
            "eps": info.get("trailingEps", "N/A"),
        }

        return {"header": header, "chart": chart, "metrics": metrics}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Snapshot unavailable", "details": str(e)})
