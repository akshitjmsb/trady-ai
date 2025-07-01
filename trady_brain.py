# trady_brain.py
import os
from datetime import date
import yfinance as yf
import pandas as pd
from dotenv import load_dotenv

# LangChain imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import tool, AgentExecutor, create_react_agent
from langchain_community.tools import DuckDuckGoSearchRun
from langchain import hub

load_dotenv()

# --- DEFINE TOOLS ---
@tool
def get_stock_price(symbol: str) -> str:
    """Fetches the latest stock price for a given stock symbol from Yahoo Finance."""
    try:
        ticker = yf.Ticker(symbol)
        todays_data = ticker.history(period='1d')
        if todays_data.empty:
            return f"Could not find price data for {symbol}."
        price = todays_data['Close'].iloc[-1]
        return f"The latest price of {symbol} is ${price:.2f}."
    except Exception as e:
        return f"Error fetching price for {symbol}: {e}"

@tool
def get_financial_news(query: str) -> str:
    """Searches for recent financial news about a company or topic."""
    try:
        # First try DuckDuckGo
        search = DuckDuckGoSearchRun()
        result = search.run(f"financial news about {query}")
        if not result or "Ratelimit" in str(result):
            raise Exception("DuckDuckGo rate limit reached")
        return result
    except Exception as e:
        # Fallback to SerpAPI if available
        serpapi_key = os.getenv('SERPAPI_API_KEY')
        if serpapi_key:
            from langchain_community.utilities import GoogleSerperAPIWrapper
            search = GoogleSerperAPIWrapper(serpapi_api_key=serpapi_key)
            return search.run(f"financial news about {query}")
        else:
            return "Unable to fetch financial news at the moment due to rate limits. Please try again later or set up a SERPAPI_API_KEY in your .env file for more reliable results."

# --- MAIN AGENT FUNCTION ---
def ask_trady(portfolio_df: pd.DataFrame, question: str):
    """The main function that runs the LangChain agent."""
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if not google_api_key:
        return "❌ Google API key not found. Please set it in .env as GOOGLE_API_KEY."

    # 1. Initialize the LLM
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro-latest", google_api_key=google_api_key)

    # 2. Define the tools the agent can use
    tools = [get_stock_price, get_financial_news]

    # 3. Get the prompt template
    # This prompt tells the agent how to behave.
    prompt = hub.pull("hwchase17/react")

    # 4. Create the agent
    agent = create_react_agent(llm, tools, prompt)

    # 5. Create the Agent Executor
    # This is the runtime for the agent.
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

    # 6. Format the input for the agent
    # We include the portfolio context along with the user's question.
    portfolio_string = portfolio_df.to_string(index=False)
    input_prompt = f"""
    You are Trady AI, a helpful financial assistant. Today is {date.today().isoformat()}.

    Here is the user's current portfolio:
    {portfolio_string}

    Analyze the user's question and use your available tools to provide a helpful and comprehensive response.

    User's question: {question}
    """

    # 7. Invoke the agent and return the response
    try:
        response = agent_executor.invoke({"input": input_prompt})
        return response.get('output', "No response generated.")
    except Exception as e:
        return f"❌ Error while running LangChain agent: {e}"

# --- Example Usage ---
if __name__ == "__main__":
    # Create a dummy portfolio DataFrame for testing
    data = {
        'symbol': ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
        'shares': [10, 5, 12, 3],
        'avg_price': [150.0, 1200.0, 250.0, 700.0]
    }
    portfolio_df_test = pd.DataFrame(data)

    print("--- Test 1: Asking for a stock price (should use get_stock_price tool) ---")
    question1 = "What is the current price of GOOGL?"
    result1 = ask_trady(portfolio_df_test, question1)
    print(f"\nFinal Answer:\n{result1}")

    print("\n\n--- Test 2: Asking for news (should use get_financial_news tool) ---")
    question2 = "What is the latest news about Tesla?"
    result2 = ask_trady(portfolio_df_test, question2)
    print(f"\nFinal Answer:\n{result2}")

    print("\n\n--- Test 3: Asking a portfolio-related question ---")
    question3 = "Based on the latest news, should I be worried about my Apple stock?"
    result3 = ask_trady(portfolio_df_test, question3)
    print(f"\nFinal Answer:\n{result3}")