# 🤖 Trady AI – Your Personal AI Portfolio Assistant

Trady AI is a powerful, self-hosted application that provides insightful analysis of your investment portfolio. It combines a sleek, modern Next.js frontend with a robust FastAPI backend, leveraging Large Language Models (LLMs) to answer your financial questions securely on your local machine.

---

## ✨ Features

- **Modern UI**: A clean and responsive user interface built with Next.js, TypeScript, and shadcn-ui.
- **Interactive Portfolio Management**: Upload your portfolio via a file or enter stocks manually.
- **AI-Powered Chat**: Ask complex financial questions about your holdings and get intelligent, data-driven answers.
- **Secure & Private**: Your financial data and API keys never leave your local machine.
- **Extensible Agent Logic**: The backend uses LangChain and Gemini to create a powerful, tool-augmented financial agent.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn-ui
- **Backend**: FastAPI, Python, LangChain, Google Gemini
- **Monorepo**: Managed with npm workspaces (for potential future expansion).

---

## 🚀 Getting Started

This project is structured as a monorepo with two main components: `frontend` and `backend`.

### Prerequisites

- Node.js (v18 or later)
- Python (v3.9 or later)
- An active Python virtual environment (recommended)

### Environment Setup

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd trady-ai
    ```

2.  **Set up API Keys**:
    Create a `.env` file in the root of the project directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and add your API keys for Google (for the Gemini model) and SerpAPI (for financial news searches):
    ```
    GOOGLE_API_KEY="your_google_api_key_here"
    SERPAPI_API_KEY="your_serpapi_api_key_here"
    ```

### Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Activate your Python virtual environment**.

3.  **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the FastAPI server**:
    ```bash
    uvicorn main:app --reload
    ```
    The backend will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory** (from the root):
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies**:
    ```bash
    npm install
    ```

3.  **Run the Next.js development server**:
    ```bash
    npm run dev
    ```
    The frontend will be running at `http://localhost:3000`.

---

## 📂 Project Structure

```
/trady-ai
├── /backend         # FastAPI application
│   ├── /routers     # API endpoint definitions
│   ├── main.py      # FastAPI app entry point
│   └── trady_brain.py # Core LangChain agent logic
├── /frontend        # Next.js application
│   ├── /src
│   │   ├── /app     # Next.js App Router pages and APIs
│   │   ├── /components # Reusable React components
│   │   └── /lib     # Utility functions
│   └── tailwind.config.ts # Tailwind CSS configuration
├── .env             # API keys and environment variables (gitignored)
├── .env.example     # Example environment file
└── README.md        # This file
```
