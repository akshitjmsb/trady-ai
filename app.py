# app.py
import streamlit as st
import pandas as pd
from trady_brain import ask_trady

st.set_page_config(page_title="Trady AI", page_icon="📊")
st.title("📊 Trady AI – Your Personal Wealth Bot")
st.caption("🔐 Secure & Private | Data stays on your machine")

# Upload CSV file
st.subheader("📂 Upload Your Portfolio CSV")
st.markdown("Upload a CSV file containing your portfolio holdings with the following column headers:")
st.code("symbol, units, avg_price", language="text")

uploaded_file = st.file_uploader("Choose your portfolio CSV file", type=["csv"])

if uploaded_file:
    try:
        df = pd.read_csv(uploaded_file)
        if {'symbol', 'units', 'avg_price'}.issubset(df.columns):
            portfolio = df.to_dict(orient="records")
            st.session_state["portfolio"] = portfolio
            st.success("✅ Portfolio loaded successfully from CSV!")
        else:
            st.error("❌ CSV must contain columns: symbol, units, avg_price")
    except Exception as e:
        st.error(f"❌ Error reading CSV: {e}")

# Manual Holdings form (fallback)
st.subheader("✍️ Or Enter Holdings Manually")
st.markdown("Input your portfolio manually, one line per holding, using the format:")
st.code("VEQT.TO, 10, 28.50", language="text")

with st.form("holdings_form"):
    tickers = st.text_area("📥 Holdings Input",
                          placeholder="Example: VEQT.TO, 10, 28.50")
    submitted = st.form_submit_button("💾 Save Portfolio")

if submitted:
    portfolio = []
    for line in tickers.strip().splitlines():
        try:
            symbol, units, avg_price = line.strip().split(',')
            portfolio.append({
                "symbol": symbol.strip(),
                "units": float(units.strip()),
                "avg_price": float(avg_price.strip())
            })
        except ValueError:
            st.error(f"❌ Invalid line format: {line}")
    st.session_state["portfolio"] = portfolio
    st.success("✅ Portfolio saved successfully!")

# Model selection
def get_model_list():
    return [
        "mistralai/mixtral-8x7b",
        "openai/gpt-3.5-turbo",
        "openai/gpt-4-turbo",
        "anthropic/claude-3-opus",
        "meta-llama/llama-3-70b-instruct"
    ]

st.subheader("🧠 Choose AI Model")
st.session_state["selected_model"] = st.selectbox(
    "Select the LLM model for Trady AI:", get_model_list(), index=0
)

# Show saved portfolio and enable chat
if "portfolio" in st.session_state and st.session_state["portfolio"]:
    st.subheader("📊 Current Portfolio")
    st.dataframe(pd.DataFrame(st.session_state["portfolio"]))

    st.subheader("🤖 Ask Trady AI")
    user_input = st.text_input("💬 What would you like to ask about your portfolio?")

    if user_input:
        with st.spinner("Thinking..."):
            reply = ask_trady(user_input, st.session_state["portfolio"], st.session_state["selected_model"])
            st.markdown(f"**🤖 Trady AI:** {reply}")
else:
    st.warning("📌 Please upload or enter your portfolio before chatting with Trady AI.")
