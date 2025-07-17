import os
import google.generativeai as genai
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import yfinance as yf
from prompts import MUNGER_ANALYSIS_PROMPT
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

def parse_munger_response(response_text):
    ratings = []
    overall_score = "N/A"
    summary = ""
    verdict = "N/A"

    # 1. Parse the markdown table for ratings
    table_regex = r"\|\s*Factor\s*\|\s*Explanation\s*\|\s*Rating\s*\|\s*\n\|.*\|.*\|.*\|\n((?:\|.*\|.*\|.*\|\s*\n)+)"
    table_match = re.search(table_regex, response_text, re.MULTILINE)
    if table_match:
        table_content = table_match.group(1).strip()
        rows = table_content.split('\n')
        for row in rows:
            parts = [p.strip() for p in row.split('|') if p.strip()]
            if len(parts) == 3:
                # Count solid stars for the numeric rating
                star_rating = parts[2].count('★')
                ratings.append({
                    "criterion": parts[0],
                    "explanation": parts[1],
                    "rating": star_rating
                })

    # 2. Parse the Overall Score
    score_match = re.search(r"\*\*Overall Munger Management Score:\*\*.*?–\s*(.*?)\n", response_text)
    if score_match:
        overall_score = score_match.group(1).strip()

    # 3. Parse the Summary and Recommendation (Verdict)
    summary_match = re.search(r"> \*\*Summary:\*\*\s*(.*?)\s*\*\*Recommendation:\*\*", response_text, re.DOTALL)
    if summary_match:
        summary = summary_match.group(1).strip()

    verdict_match = re.search(r"\*\*Recommendation:\*\*\s*(BUY|WATCH|AVOID)", response_text)
    if verdict_match:
        verdict = verdict_match.group(1).strip()

    return {
        "ratings": ratings,
        "overallScore": overall_score,
        "summary": summary,
        "verdict": verdict
    }

@router.get("/api/munger-review")
def get_munger_review(symbol: str = Query(..., min_length=1)):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Server configuration error: Gemini API key not set.")

    try:
        ticker = yf.Ticker(symbol)
        company_name = ticker.info.get('longName', symbol)

        if not company_name:
            return JSONResponse(status_code=404, content={"error": f"No data found for symbol: {symbol}"})

        prompt = MUNGER_ANALYSIS_PROMPT.format(company_name=company_name)

        model = genai.GenerativeModel('models/gemini-1.5-pro')
        response = model.generate_content(prompt)

        if not response.text:
            raise HTTPException(status_code=500, detail="LLM did not return a valid response.")
        
        parsed_data = parse_munger_response(response.text)
        
        return parsed_data

    except Exception as e:
        print(f"Error in get_munger_review: {e}")
        return JSONResponse(status_code=500, content={"error": "Failed to generate Munger-style review.", "details": str(e)})
