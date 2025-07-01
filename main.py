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
class ChatRequest(BaseModel):
    message: str

# --- API Endpoints --- #
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
    and gets a response from the Trady AI agent.
    """
    portfolio_df = portfolio_storage.get("df")

    if portfolio_df is None:
        return {"reply": "I don't have access to your portfolio yet. Please upload a portfolio file first so I can assist you."}

    try:
        question = request.message
        ai_response = ask_trady(portfolio_df=portfolio_df, question=question)
        return {"reply": ai_response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while communicating with the AI: {e}")
