from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import yfinance as yf
import pandas as pd

router = APIRouter()

@router.get("/api/price-history")
def price_history(
    symbol: str = Query(..., min_length=1),
    range: str = Query("1y", regex="^(1d|5d|1m|6m|ytd|1y|5y|max)$"),
    mode: str = Query("price", regex="^(price|percent)$")
):
    try:
        yf_range_map = {
            "1d": ("1d", "1m"),
            "5d": ("5d", "15m"),
            "1m": ("1mo", "1d"),
            "6m": ("6mo", "1d"),
            "ytd": ("ytd", "1d"),
            "1y": ("1y", "1d"),
            "5y": ("5y", "1d"),
            "max": ("max", "1d"),
        }
        yf_range, interval = yf_range_map.get(range, ("1y", "1d"))
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=yf_range, interval=interval)
        info = ticker.info

        if hist.empty or "Close" not in hist or not info or 'shortName' not in info:
            return JSONResponse(status_code=404, content={"error": "Data unavailable"})

        price = info.get('regularMarketPrice')
        prev_close = info.get('regularMarketPreviousClose')
        change = price - prev_close if price and prev_close else 0
        change_percent = (change / prev_close * 100) if prev_close and change else 0

        header = {
            "name": info.get('shortName', symbol),
            "symbol": symbol.upper(),
            "price": price,
            "change": change,
            "changePercent": change_percent,
            "timestamp": info.get('regularMarketTime'),
        }

        hist = hist.reset_index()
        if 'Datetime' in hist.columns:
            hist['timestamp'] = hist['Datetime'].astype(str)
        else:
            hist['timestamp'] = hist['Date'].astype(str)

        series_data = hist[['timestamp', 'Close']].copy()
        series_data.rename(columns={'Close': 'value'}, inplace=True)
        series_data = series_data.where(pd.notnull(series_data), None).to_dict('records')

        if mode == 'percent' and series_data:
            first_value = next((item['value'] for item in series_data if item['value'] is not None), None)
            if first_value:
                for item in series_data:
                    if item['value'] is not None:
                        item['value'] = ((item['value'] / first_value) - 1) * 100

        chart = {"mode": mode, "series": series_data}

        metrics = {
            "prevClose": info.get("regularMarketPreviousClose", "N/A"),
            "open": info.get("regularMarketOpen", "N/A"),
            "dayRange": f"{info.get('dayLow', 'N/A')} - {info.get('dayHigh', 'N/A')}",
            "fiftyTwoWeekRange": f"{info.get('fiftyTwoWeekLow', 'N/A')} - {info.get('fiftyTwoWeekHigh', 'N/A')}",
            "marketCap": info.get("marketCap", "N/A"),
            "peRatio": info.get("trailingPE", "N/A"),
            "volume": info.get("regularMarketVolume", "N/A"),
            "dividendYield": info.get("dividendYield", "N/A"),
            "eps": info.get("trailingEps", "N/A"),
        }

        return {"header": header, "chart": chart, "metrics": metrics}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Snapshot unavailable", "details": str(e)})
