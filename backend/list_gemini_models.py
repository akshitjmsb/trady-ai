import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("No GEMINI_API_KEY found in .env file.")
    exit(1)
genai.configure(api_key=GEMINI_API_KEY)

print("Available Gemini models:")
for model in genai.list_models():
    print(f"- {model.name} (supported methods: {model.supported_generation_methods})")
