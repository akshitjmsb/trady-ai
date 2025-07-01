import pandas as pd
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from trady_brain import ask_trady

# --- App & CORS --- #
app = FastAPI(
    title="Trady AI Backend",
    description="The API server for the Trady AI Next.js frontend.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows the Next.js frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Storage --- #
# A simple solution for a local, single-user app.
portfolio_storage = {
    "df": None
}

# --- Pydantic Models --- #

from typing import List

class ManualStock(BaseModel):
    ticker: str
    quantity: int
    unitPrice: float

@app.post("/api/manual_portfolio", tags=["Portfolio"])
async def manual_portfolio(stocks: List[ManualStock]):
    """Accepts a manually entered portfolio and stores it in memory."""
    import pandas as pd
    if not stocks:
        raise HTTPException(status_code=400, detail="Portfolio cannot be empty.")
    df = pd.DataFrame([s.dict() for s in stocks])
    # Basic validation
    if not all(col in df.columns for col in ["ticker", "quantity", "unitPrice"]):
        raise HTTPException(status_code=400, detail="Missing required fields.")
    portfolio_storage["df"] = df
    return {"message": "Manual portfolio stored successfully.", "portfolio": df.to_dict(orient='records')}

class ChatRequest(BaseModel):
    message: str

# --- API Endpoints --- #

from fastapi import Path, Query
from typing import Optional
import yfinance as yf

@app.get("/api/stock/{symbol}", tags=["Market"])
async def get_stock_data(symbol: str = Path(..., description="Ticker symbol, e.g. AAPL, TSLA")):
    """Get current and historical price data for a stock/ETF/index."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="6mo")
        if hist.empty:
            return {"error": f"No historical data found for {symbol}."}
        return {
            "symbol": symbol.upper(),
            "shortName": info.get("shortName", "N/A"),
            "currentPrice": info.get("regularMarketPrice", None),
            "currency": info.get("currency", "USD"),
            "history": hist['Close'].round(2).to_dict(),
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/fundamentals/{symbol}", tags=["Fundamentals"])
async def get_fundamentals(symbol: str = Path(...)):
    """Get company fundamentals (P/E, EPS, Market Cap, etc.)."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return {
            "symbol": symbol.upper(),
            "shortName": info.get("shortName", "N/A"),
            "sector": info.get("sector", "N/A"),
            "marketCap": info.get("marketCap", None),
            "trailingPE": info.get("trailingPE", None),
            "forwardPE": info.get("forwardPE", None),
            "eps": info.get("trailingEps", None),
            "dividendYield": info.get("dividendYield", None),
            "beta": info.get("beta", None),
            "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh", None),
            "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow", None),
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/news/{symbol}", tags=["News"])
async def get_news(symbol: str = Path(...)):
    """Get latest news headlines for a symbol."""
    try:
        ticker = yf.Ticker(symbol)
        news = ticker.news
        if not news:
            return {"news": []}
        return {"news": [{"title": n.get("title"), "link": n.get("link")} for n in news[:10]]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/macro/{indicator}", tags=["Macro"])
async def get_macro(indicator: str = Path(..., description="e.g. gdp, inflation, unemployment")):
    """Get macroeconomic data (mocked for now)."""
    macro_data = {
        "gdp": {"value": "$25T", "country": "USA", "year": 2024},
        "inflation": {"value": "3.2%", "country": "USA", "year": 2024},
        "unemployment": {"value": "4.0%", "country": "USA", "year": 2024}
    }
    return macro_data.get(indicator.lower(), {"error": "Indicator not found."})

@app.get("/api/knowledge", tags=["Knowledge"])
async def get_knowledge(q: str = Query(..., description="Finance term or concept to explain")):
    """Explain a finance term or concept (static for now)."""
    knowledge_base = {
        "p/e ratio": "The price-to-earnings (P/E) ratio is a valuation metric for a company, calculated by dividing the market price per share by earnings per share.",
        "dividend": "A dividend is a payment made by a corporation to its shareholders, usually as a distribution of profits.",
        "etf": "An ETF (Exchange-Traded Fund) is a type of investment fund traded on stock exchanges, much like stocks.",
        "market cap": "Market capitalization (market cap) is the total market value of a company's outstanding shares.",
        "beta": "Beta is a measure of a stock's volatility in relation to the overall market.",
        "yield": "Yield refers to the earnings generated and realized on an investment over a particular period of time, expressed as a percentage.",
        # Add more as needed
    }
    return {"answer": knowledge_base.get(q.lower(), "Sorry, I don't have an explanation for that term yet.")}

@app.get("/", tags=["General"])
async def read_root():
    return {"message": "Welcome to the Trady AI Backend"}

@app.post("/api/upload", tags=["Portfolio"])
async def upload_portfolio(file: UploadFile = File(...)):
    """
    Accepts a CSV file, parses it into a DataFrame, and stores it in memory.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV file.")
    
    try:
        contents = await file.read()
        buffer = io.BytesIO(contents)
        df = pd.read_csv(buffer)
        
        # Basic validation: check for 'ticker' and 'quantity' columns
        if 'ticker' not in df.columns or 'quantity' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain 'ticker' and 'quantity' columns.")

        portfolio_storage["df"] = df
        
        # Return the portfolio data in the format the frontend expects
        return {
            "message": "File uploaded and processed successfully.",
            "portfolio": df.to_dict(orient='records'),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {e}")

@app.post("/api/chat", tags=["Chat"])
async def chat_with_trady(request: ChatRequest):
    """
    Receives a user's question, retrieves the stored portfolio, 
    and gets a response from the Trady AI agent. If no portfolio is uploaded, will attempt to answer general stock questions.
    """
    import re
    import yfinance as yf
    from datetime import datetime, timedelta

    portfolio_df = portfolio_storage.get("df")
    question = request.message.strip()

    # --- Portfolio performance logic for manual or uploaded portfolios --- #
    if portfolio_df is not None:
        # If the question is about performance, calculate gain/loss
        lower_q = question.lower()
        if any(k in lower_q for k in ["performance", "gain", "loss", "return", "how am i doing", "profit", "growth"]):
            try:
                import yfinance as yf
                results = []
                total_invested = 0
                total_now = 0
                for _, row in portfolio_df.iterrows():
                    ticker = str(row['ticker']).upper()
                    qty = float(row['quantity'])
                    unit_price = float(row['unitPrice']) if 'unitPrice' in row else None
                    stock = yf.Ticker(ticker)
                    info = stock.info
                    current_price = info.get("regularMarketPrice")
                    if current_price is None or unit_price is None:
                        results.append(f"{ticker}: Unable to fetch current price or missing unit price.")
                        continue
                    invested = qty * unit_price
                    now = qty * current_price
                    gain = now - invested
                    gain_pct = (gain / invested) * 100 if invested else 0
                    results.append(f"{ticker}: Bought at ${unit_price:.2f}, now ${current_price:.2f}, Qty {qty}, Gain/Loss: ${gain:.2f} ({gain_pct:.2f}%)")
                    total_invested += invested
                    total_now += now
                total_gain = total_now - total_invested
                total_gain_pct = (total_gain / total_invested) * 100 if total_invested else 0
                summary = f"Total invested: ${total_invested:.2f}\nCurrent value: ${total_now:.2f}\nTotal Gain/Loss: ${total_gain:.2f} ({total_gain_pct:.2f}%)"
                return {"reply": "\n".join(results + [summary])}
            except Exception as e:
                return {"reply": f"Error calculating portfolio performance: {e}"}
    if portfolio_df is None:
        # --- Smarter intent & ticker detection --- #
        ticker_pattern = r"\b([A-Z]{1,5})\b"
        company_map = {
            "amazon": "AMZN", "apple": "AAPL", "microsoft": "MSFT", "google": "GOOGL", "alphabet": "GOOGL", "tesla": "TSLA", "meta": "META", "facebook": "META", "nvidia": "NVDA", "netflix": "NFLX"
        }
        lower_q = question.lower()
        found_ticker = None
        # Check for company name
        for name, ticker in company_map.items():
            if name in lower_q:
                found_ticker = ticker
                break
        # If not found, check for ticker pattern
        if not found_ticker:
            tickers = re.findall(ticker_pattern, question)
            blacklist = {"THE", "AND", "FOR", "HAS", "LAST", "WHAT", "HOW", "DONE", "IN", "IS", "ON", "TO", "CAN"}
            tickers = [t for t in tickers if t.upper() not in blacklist]
            if tickers:
                found_ticker = tickers[0].upper()
        if found_ticker:
            try:
                stock = yf.Ticker(found_ticker)
                info = stock.info
                # --- Intent detection --- #
                if any(k in lower_q for k in ["price", "current price", "quote", "stock price"]):
                    price = info.get("regularMarketPrice")
                    currency = info.get("currency", "USD")
                    if price:
                        return {"reply": f"The current price of {found_ticker} is ${price} {currency}."}
                    else:
                        return {"reply": f"Sorry, I couldn't find the current price for {found_ticker}."}
                if any(k in lower_q for k in ["p/e", "pe ratio", "price to earnings"]):
                    pe = info.get("trailingPE")
                    if pe:
                        return {"reply": f"The P/E ratio of {found_ticker} is {pe:.2f}."}
                    else:
                        return {"reply": f"Sorry, I couldn't find the P/E ratio for {found_ticker}."}
                if any(k in lower_q for k in ["market cap", "market capitalization"]):
                    mc = info.get("marketCap")
                    if mc:
                        return {"reply": f"The market cap of {found_ticker} is ${mc:,}."}
                    else:
                        return {"reply": f"Sorry, I couldn't find the market cap for {found_ticker}."}
                if any(k in lower_q for k in ["summary", "about", "company info", "describe", "tell me about"]):
                    sn = info.get("longBusinessSummary")
                    if sn:
                        return {"reply": f"{found_ticker}: {sn}"}
                    else:
                        return {"reply": f"Sorry, I couldn't find a summary for {found_ticker}."}
                # Default: show last 3 months performance
                from datetime import datetime, timedelta
                end_date = datetime.today()
                start_date = end_date - timedelta(days=90)
                hist = stock.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
                if hist.empty:
                    return {"reply": f"Sorry, I couldn't find recent data for {found_ticker}."}
                start_price = hist['Close'][0]
                end_price = hist['Close'][-1]
                change = ((end_price - start_price) / start_price) * 100
                reply = (f"{found_ticker} performance in the last 3 months:\n"
                         f"Start price: ${start_price:.2f}\n"
                         f"End price: ${end_price:.2f}\n"
                         f"Change: {change:.2f}%")
                return {"reply": reply}
            except Exception as e:
                return {"reply": f"Sorry, I couldn't fetch data for {found_ticker}: {e}"}
        # Not a recognized finance question
        return {"reply": "I don't have access to your portfolio yet. Please upload a portfolio file first so I can assist you."}

    try:
        ai_response = ask_trady(portfolio_df=portfolio_df, question=question)
        return {"reply": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while communicating with the AI: {e}")

