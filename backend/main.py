from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import yfinance as yf
from price_history_route import router as price_history_router
from earnings_analysis_route import router as earnings_analysis_router

app = FastAPI()
app.include_router(price_history_router)
app.include_router(earnings_analysis_router)

# Allow all origins for development (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/stock-summary")
def stock_summary(symbol: str = Query(..., min_length=1)):
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        # yfinance may return an empty dict for invalid symbols
        if not info or 'shortName' not in info:
            return JSONResponse(status_code=404, content={"error": "No data found for this symbol."})
        name = info.get('shortName', 'N/A')
        price = info.get('regularMarketPrice', 'N/A')
        market_cap = info.get('marketCap', 'N/A')
        pe_ratio = info.get('trailingPE', 'N/A')
        sector = info.get('sector', 'N/A')
        # Format market cap (e.g., $2.8 T)
        def format_market_cap(val):
            if val == 'N/A' or val is None:
                return 'N/A'
            try:
                val = float(val)
                if val >= 1e12:
                    return f"${val/1e12:.1f} T"
                elif val >= 1e9:
                    return f"${val/1e9:.1f} B"
                elif val >= 1e6:
                    return f"${val/1e6:.1f} M"
                elif val >= 1e3:
                    return f"${val/1e3:.1f} K"
                else:
                    return f"${val:,.0f}"
            except Exception:
                return 'N/A'
        summary = {
            "name": name,
            "price": price if price is not None else 'N/A',
            "marketCap": format_market_cap(market_cap),
            "peRatio": pe_ratio if pe_ratio is not None else 'N/A',
            "sector": sector if sector is not None else 'N/A',
        }
        return summary
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Failed to fetch stock summary.", "details": str(e)})
