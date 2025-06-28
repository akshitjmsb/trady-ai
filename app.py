# app.py
import streamlit as st
import pandas as pd
import requests
import json
from pathlib import Path
from trady_brain import ask_trady

# Local CSV file used to persist the user portfolio across app restarts
PORTFOLIO_FILE = Path(__file__).with_name(".trady_portfolio.csv")

st.set_page_config(page_title="Trady AI", page_icon="📈")

st.title("📊 Trady AI: Your Portfolio Assistant")

# === MODEL SELECTION ===
MODEL_OPTIONS = [
    "mistralai/mistral-small-3.1-24b-instruct:free",  # Best for portfolio analysis - excellent with numerical data and financial concepts
    "google/gemini-2.5-pro-exp-03-25:free",  # Strong general performance - good for complex analysis and reasoning
    "meta-llama/llama-4-scout:free",  # Quick and efficient - good for simple portfolio questions
    "meta-llama/llama-4-maverick:free",  # Advanced analysis - good for detailed financial insights
    "deepseek/deepseek-r1:free",  # Research-focused - good for in-depth market analysis
    "moonshotai/kimi-vl-a3b-thinking:free",  # Creative insights - good for strategic portfolio planning
    "nvidia/llama-3.1-nemotron-nano-8b-v1:free",  # Lightweight - good for basic portfolio calculations
    "nousresearch/deephermes-3-llama-3-8b-preview:free"  # Specialized - good for technical financial analysis

]

selected_model = st.selectbox("💡 Choose AI Model", MODEL_OPTIONS, index=0, help="Select the LLM model for Trady AI:")

# === PORTFOLIO UPLOAD / INPUT ===
st.header("📊 Current Portfolio")

# --- Session-level portfolio persistence ---
if "portfolio_df" not in st.session_state:
    if PORTFOLIO_FILE.exists():
        st.session_state["portfolio_df"] = pd.read_csv(PORTFOLIO_FILE)
    else:
        st.session_state["portfolio_df"] = pd.DataFrame(columns=["symbol", "units", "avg_price"])

portfolio_df = st.session_state["portfolio_df"]  # work with session copy

uploaded_file = st.file_uploader("Upload your portfolio as a CSV file (symbol, units, avg_price):", type="csv")

if uploaded_file:
    try:
        st.session_state["portfolio_df"] = pd.read_csv(uploaded_file)
        portfolio_df = st.session_state["portfolio_df"]
        # persist to disk
        portfolio_df.to_csv(PORTFOLIO_FILE, index=False)
    except Exception as e:
        st.error(f"Error reading CSV: {e}")

else:
    st.markdown("**📥 Or Enter Holdings Manually**")
    manual_input = st.text_area("Enter each holding (e.g., VEQT.TO,10,28.50)",
                                 placeholder="Example: VEQT.TO,10,28.50\nTSLA,5,670.25",
                                 height=150)
    if st.button("Save Portfolio") and manual_input:
        try:
            lines = manual_input.strip().split("\n")
            data = [line.split(",") for line in lines if len(line.split(",")) == 3]
            df = pd.DataFrame(data, columns=["symbol", "units", "avg_price"])
            df["units"] = df["units"].astype(float)
            df["avg_price"] = df["avg_price"].astype(float)
            st.session_state["portfolio_df"] = df
            portfolio_df = df
            # persist to disk
            df.to_csv(PORTFOLIO_FILE, index=False)
        except Exception as e:
            st.error(f"Invalid format: {e}")

if not portfolio_df.empty:
    st.dataframe(portfolio_df, use_container_width=True)
    edit_choice = st.radio("Need to edit your portfolio?", ["No", "Yes"], index=0, horizontal=True)
    if edit_choice == "Yes":
        st.session_state["portfolio_df"] = pd.DataFrame(columns=["symbol", "units", "avg_price"])
        if PORTFOLIO_FILE.exists():
            PORTFOLIO_FILE.unlink()
        # Trigger a full app rerun (handle different Streamlit versions)
        if hasattr(st, "rerun"):
            st.rerun()
        elif hasattr(st, "experimental_rerun"):
            st.experimental_rerun()

# === ASK TRADY AI ===
st.header("🤖 Ask Trady AI")
question = st.text_input("💬 What would you like to ask about your portfolio?")

if question and not portfolio_df.empty:
    with st.spinner("Trady AI is thinking..."):
        try:
            response = ask_trady(portfolio_df, question, model=selected_model)
            st.markdown(response)
        except Exception as e:
            st.error(f"❌ Trady AI: {e}")
else:
    st.warning("📌 Please upload or enter your portfolio before chatting with Trady AI.")
