# app.py
import streamlit as st
from trady_brain import ask_trady

st.set_page_config(page_title="Trady AI", page_icon="📊")
st.title("📊 Trady AI – Your Personal Wealth Bot")
st.caption("Powered by OpenRouter (Free Model)")

user_input = st.text_input("💬 Ask something about your investments:")

if user_input:
    with st.spinner("Thinking..."):
        reply = ask_trady(user_input)
        st.markdown(f"**🤖 Trady AI:** {reply}")
