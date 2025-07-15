import os
import google.generativeai as genai
import inspect

print("-" * 20)
print(f"DEBUG: Using google-generativeai version: {genai.__version__}")
print(f"DEBUG: Library path: {inspect.getfile(genai)}")
print("-" * 20)

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import yfinance as yf
from prompts import BUFFETT_ANALYSIS_PROMPT
import re

# Load environment variables from .env file
load_dotenv()

router = APIRouter()

# Configure the Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in .env file.")
else:
    genai.configure(api_key=GEMINI_API_KEY)

def parse_llm_response(response_text):
    sections = {}
    # Split by ### which denotes major sections
    parts = re.split(r'###\s*(.*?)\n', response_text)
    if not parts:
        return {"Default": response_text} # Return as is if no sections found

    # The first part might be a preamble before the first ###
    if parts[0].strip():
        # Check for a recommendation badge at the beginning
        match = re.match(r'\*\*Recommendation:\*\*\s*(BUY|SELL|HOLD)', parts[0].strip(), re.IGNORECASE)
        if match:
            sections['recommendation'] = match.group(1).upper()
        else:
            sections['Introduction'] = parts[0].strip()

    # Process the rest of the parts
    for i in range(1, len(parts), 2):
        title = parts[i].strip()
        content = parts[i+1].strip()
        sections[title] = content

    return sections

@router.get("/api/buffett-review")
def get_buffett_review(symbol: str = Query(..., min_length=1)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Server configuration error: Gemini API key not set.")

    try:
        # 1. Fetch company name from yfinance
        ticker = yf.Ticker(symbol)
        info = ticker.info
        company_name = info.get('longName', symbol)

        if not company_name:
             return JSONResponse(status_code=404, content={"error": f"No data found for symbol: {symbol}"})

        # 2. Build the prompt
        prompt = BUFFETT_ANALYSIS_PROMPT.format(company_name=company_name)

        # 3. Call the Gemini API
        model = genai.GenerativeModel('models/gemini-1.5-pro')
        response = model.generate_content(prompt)

        # 4. Parse the response and return as JSON
        if not response.text:
            raise HTTPException(status_code=500, detail="LLM did not return a valid response.")
        
        parsed_sections = parse_llm_response(response.text)
        
        return {"sections": parsed_sections}

    except Exception as e:
        # Log the error for debugging
        print(f"Error in get_buffett_review: {e}")
        return JSONResponse(status_code=500, content={"error": "Failed to generate Buffett-style review.", "details": str(e)})
