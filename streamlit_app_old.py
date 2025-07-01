import streamlit as st
import pandas as pd
from pathlib import Path
from trady_brain import ask_trady

# --- Page Config ---
st.set_page_config(
    page_title="Trady AI",
    page_icon="💹",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items={
        'Get Help': 'https://github.com/yourusername/trady-ai',
        'Report a bug': 'https://github.com/yourusername/trady-ai/issues',
        'About': "# Trady AI\nYour intelligent portfolio assistant"
    }
)

# Custom Header
st.markdown(
    """
    <style>
        .header {
            padding: 1.5rem 0;
            border-bottom: 1px solid #2a2b3a;
            margin-bottom: 2rem;
        }
        .header h1 {
            font-size: 2.5rem;
            margin: 0;
            background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
        }
        .header p {
            color: #a1a1aa;
            margin: 0.5rem 0 0 0;
            font-size: 1.1rem;
        }
    </style>
    <div class="header">
        <h1>Trady AI</h1>
        <p>Your intelligent portfolio assistant</p>
    </div>
    """,
    unsafe_allow_html=True
)

# --- CSS Styling ---
def load_css():
    st.markdown("""
    <style>
        /* Main Container */
        .main {
            background-color: #0f0f17;
            color: #e0e0e0;
        }
        
        /* Sidebar */
        .css-1d391kg {
            background-color: #1a1b26 !important;
            border-right: 1px solid #2a2b3a;
        }
        
        /* Text Colors */
        h1, h2, h3, h4, h5, h6, p, label, .stMarkdown {
            color: #e0e0e0 !important;
        }
        
        /* Buttons */
        .stButton>button {
            background-color: #7c3aed;
            color: white;
            border-radius: 6px;
            border: none;
            padding: 0.5rem 1rem;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .stButton>button:hover {
            background-color: #6d28d9;
            transform: translateY(-1px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Secondary Buttons */
        .stButton>button[kind="secondary"] {
            background-color: #2a2b3a;
            color: #e0e0e0;
        }
        
        .stButton>button[kind="secondary"]:hover {
            background-color: #3a3b4a;
        }
        
        /* Input Fields */
        .stTextInput>div>div>input,
        .stNumberInput>div>div>input,
        .stTextArea>div>div>textarea {
            background-color: #1a1b26;
            border: 1px solid #2a2b3a;
            color: #e0e0e0;
            border-radius: 6px;
        }
        
        /* Dataframes */
        .dataframe {
            background-color: #1a1b26;
            border-radius: 8px;
            border: 1px solid #2a2b3a;
        }
        
        .dataframe th {
            background-color: #2a2b3a !important;
            color: #e0e0e0 !important;
        }
        
        .dataframe td {
            color: #e0e0e0 !important;
            border-bottom: 1px solid #2a2b3a !important;
        }
        
        /* Chat Messages */
        .stChatMessage {
            padding: 0.75rem 1rem;
            border-radius: 8px;
            margin: 0.5rem 0;
            max-width: 85%;
        }
        
        .stChatMessage[data-testid="stChatMessage"] {
            background-color: #1a1b26;
            border: 1px solid #2a2b3a;
        }
        
        .stChatMessage[data-testid="stChatMessage"] .stMarkdown {
            color: #e0e0e0 !important;
        }
        
        /* Tabs */
        .stTabs [data-baseweb="tab-list"] {
            gap: 8px;
        }
        
        .stTabs [data-baseweb="tab"] {
            background-color: #1a1b26;
            color: #e0e0e0 !important;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            margin: 0;
            transition: all 0.2s;
        }
        
        .stTabs [aria-selected="true"] {
            background-color: #7c3aed !important;
            color: white !important;
        }
        
        /* Expander */
        .streamlit-expander {
            background-color: #1a1b26;
            border: 1px solid #2a2b3a;
            border-radius: 8px;
        }
        
        .streamlit-expanderHeader {
            color: #e0e0e0 !important;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #1a1b26;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #7c3aed;
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #6d28d9;
        }
    </style>
    """, unsafe_allow_html=True)

# Initialize session state
if 'conversation' not in st.session_state:
    st.session_state.conversation = []

# --- File Paths ---
PORTFOLIO_FILE = Path(__file__).with_name(".trady_portfolio.csv")

# --- Sidebar ---
with st.sidebar:
    st.markdown(
        """
        <style>
            /* Sidebar header */
            .sidebar .sidebar-content {
                background-color: #0f0f17;
            }
            
            /* Section headers */
            .sidebar h3 {
                color: #8b5cf6 !important;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin: 1.5rem 0 0.75rem 0;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #2a2b3a;
            }
            
            /* File uploader */
            .stFileUploader {
                border: 1px dashed #4b5563;
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 0.5rem 0;
            }
            
            /* Form elements */
            .stTextInput, .stNumberInput {
                margin-bottom: 0.5rem;
            }
            
            /* Dividers */
            .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent, #4b5563, transparent);
                margin: 1.5rem 0;
            }
        </style>
        """,
        unsafe_allow_html=True
    )
    
    # Sidebar Header
    st.markdown(
        """
        <div style="margin-bottom: 2rem;">
            <h1 style="font-size: 1.5rem; margin: 0 0 0.25rem 0; color: #e0e0e0;">Trady AI</h1>
            <p style="font-size: 0.9rem; color: #a1a1aa; margin: 0;">Portfolio Management</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    st.markdown("### Portfolio Management")
    
    # Portfolio Upload
    uploaded_file = st.file_uploader("Upload Portfolio (CSV)", type="csv", 
                                   help="Upload a CSV with columns: symbol, units, avg_price")
    
    if uploaded_file:
        try:
            portfolio_df = pd.read_csv(uploaded_file)
            st.session_state.portfolio_df = portfolio_df
            portfolio_df.to_csv(PORTFOLIO_FILE, index=False)
            st.success("Portfolio uploaded successfully!")
        except Exception as e:
            st.error(f"Error reading file: {e}")
    
    # Manual Entry
    st.markdown("---")
    st.markdown("### Add Stock Manually")
    with st.form("add_stock"):
        col1, col2 = st.columns(2)
        with col1:
            symbol = st.text_input("Symbol", placeholder="AAPL")
            units = st.number_input("Units", min_value=0.0, step=0.1, format="%.2f")
        with col2:
            avg_price = st.number_input("Avg. Price", min_value=0.0, step=0.01, format="%.2f")
        
        if st.form_submit_button("Add to Portfolio", use_container_width=True) and symbol:
            if 'portfolio_df' not in st.session_state:
                st.session_state.portfolio_df = pd.DataFrame(columns=["symbol", "units", "avg_price"])
            
            new_row = pd.DataFrame({
                'symbol': [symbol.upper()],
                'units': [units],
                'avg_price': [avg_price]
            })
            st.session_state.portfolio_df = pd.concat([st.session_state.portfolio_df, new_row], ignore_index=True)
            st.session_state.portfolio_df.to_csv(PORTFOLIO_FILE, index=False)
            st.rerun()
    
    # Clear Portfolio
    if st.button("Clear Portfolio", type="secondary", use_container_width=True):
        if PORTFOLIO_FILE.exists():
            PORTFOLIO_FILE.unlink()
        st.session_state.portfolio_df = pd.DataFrame(columns=["symbol", "units", "avg_price"])
        st.session_state.conversation = []
        st.rerun()
    
    st.markdown("---")
    st.markdown("### About")
    st.markdown("Trady AI helps you analyze your stock portfolio using AI.")
    st.markdown("*Version 2.0*")

# --- Main Content ---
load_css()

# Initialize portfolio if not exists
if 'portfolio_df' not in st.session_state:
    if PORTFOLIO_FILE.exists():
        st.session_state.portfolio_df = pd.read_csv(PORTFOLIO_FILE)
    else:
        st.session_state.portfolio_df = pd.DataFrame(columns=["symbol", "units", "avg_price"])

portfolio_df = st.session_state.portfolio_df

# Portfolio Summary
st.markdown("### 📊 Portfolio Overview")

if not portfolio_df.empty:
    # Calculate portfolio metrics
    portfolio_df['current_value'] = portfolio_df['units'] * portfolio_df['avg_price']
    total_investment = portfolio_df['current_value'].sum()
    
    # Display metrics in cards
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(
            f"""
            <div style="
                background: linear-gradient(135deg, #1a1b26 0%, #2a2b3a 100%);
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid #2a2b3a;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            ">
                <p style="color: #a1a1aa; margin: 0 0 0.5rem 0; font-size: 0.9rem;">Total Value</p>
                <h2 style="color: #e0e0e0; margin: 0; font-size: 1.75rem;">${total_investment:,.2f}</h2>
            </div>
            """,
            unsafe_allow_html=True
        )
    
    with col2:
        st.markdown(
            f"""
            <div style="
                background: linear-gradient(135deg, #1a1b26 0%, #2a2b3a 100%);
                padding: 1.5rem;
                border-radius: 12px;
                border: 1px solid #2a2b3a;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            ">
                <p style="color: #a1a1aa; margin: 0 0 0.5rem 0; font-size: 0.9rem;">Total Stocks</p>
                <h2 style="color: #e0e0e0; margin: 0; font-size: 1.75rem;">{len(portfolio_df)}</h2>
            </div>
            """,
            unsafe_allow_html=True
        )
    
    # Portfolio Table
    st.markdown("### 📋 Your Holdings")
    st.dataframe(
        portfolio_df.style.format({
            'units': '{:,.2f}',
            'avg_price': '${:,.2f}',
            'current_value': '${:,.2f}'
        })
        .apply(lambda x: ['background: #1a1b26' for i in x], axis=0)
        .set_properties(**{
            'background-color': '#1a1b26',
            'color': '#e0e0e0',
            'border': '1px solid #2a2b3a',
            'border-radius': '8px'
        }),
        use_container_width=True,
        hide_index=True
    )
else:
    st.markdown(
        """
        <div style="
            background: linear-gradient(135deg, #1a1b26 0%, #2a2b3a 100%);
            padding: 2rem;
            border-radius: 12px;
            border: 1px dashed #4b5563;
            text-align: center;
            margin: 1rem 0;
        ">
            <h3 style="color: #e0e0e0; margin: 0 0 1rem 0;">Your portfolio is empty</h3>
            <p style="color: #a1a1aa; margin: 0;">Add stocks using the sidebar to get started.</p>
        </div>
        """,
        unsafe_allow_html=True
    )

# Chat Interface
st.markdown("---")
st.markdown("### 💬 Ask Trady AI")
st.markdown(
    """
    <style>
        .chat-container {
            background: #1a1b26;
            border: 1px solid #2a2b3a;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 1rem 0;
        }
        .chat-message {
            margin-bottom: 1.5rem;
        }
        .chat-message:last-child {
            margin-bottom: 0;
        }
    </style>
    """,
    unsafe_allow_html=True
)

# Display conversation history
for message in st.session_state.conversation:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User input
if prompt := st.chat_input("Ask me anything about your portfolio..."):
    # Add user message to chat
    st.session_state.conversation.append({"role": "user", "content": prompt})
    
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Get AI response
    with st.chat_message("assistant"):
        with st.spinner("Analyzing..."):
            try:
                if not portfolio_df.empty:
                    response = ask_trady(portfolio_df, prompt)
                else:
                    response = "Please add stocks to your portfolio before asking questions."
                
                # Display response
                st.markdown(response)
                
                # Add AI response to conversation
                st.session_state.conversation.append({"role": "assistant", "content": response})
                
            except Exception as e:
                error_msg = f"❌ Error: {str(e)}"
                st.error(error_msg)
                st.session_state.conversation.append({"role": "assistant", "content": error_msg})
