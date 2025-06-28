# app.py
import streamlit as st
import pandas as pd
import requests
import json
from trady_brain import ask_trady

st.set_page_config(page_title="Trady AI", page_icon="📈")

st.title("📊 Trady AI: Your Portfolio Assistant")

# === MODEL SELECTION ===
MODEL_OPTIONS = [
    "google/gemini-2.5-pro-exp-03-25:free",
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "deepseek/deepseek-r1:free",
    "moonshotai/kimi-vl-a3b-thinking:free",
    "nvidia/llama-3.1-nemotron-nano-8b-v1:free",
    "nousresearch/deephermes-3-llama-3-8b-preview:free"
]

selected_model = st.selectbox("💡 Choose AI Model", MODEL_OPTIONS, index=0, help="Select the LLM model for Trady AI:")

# === PORTFOLIO UPLOAD / INPUT ===
st.header("📊 Current Portfolio")

portfolio_df = pd.DataFrame(columns=["symbol", "units", "avg_price"])

uploaded_file = st.file_uploader("Upload your portfolio as a CSV file (symbol, units, avg_price):", type="csv")

if uploaded_file:
    try:
        portfolio_df = pd.read_csv(uploaded_file)
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
            portfolio_df = pd.DataFrame(data, columns=["symbol", "units", "avg_price"])
            portfolio_df["units"] = portfolio_df["units"].astype(float)
            portfolio_df["avg_price"] = portfolio_df["avg_price"].astype(float)
        except Exception as e:
            st.error(f"Invalid format: {e}")

if not portfolio_df.empty:
    st.dataframe(portfolio_df, use_container_width=True)

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
