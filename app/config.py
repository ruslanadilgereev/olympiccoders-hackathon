"""Configuration settings for Design Automation Agent."""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Google AI Configuration (for Gemini - main AI engine)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Firecrawl Configuration (for URL scraping)
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")

# ChromaDB Configuration
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")

# LangSmith Configuration (optional, for tracing & monitoring)
LANGSMITH_TRACING = os.getenv("LANGSMITH_TRACING", "false")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")
LANGSMITH_PROJECT = os.getenv("LANGSMITH_PROJECT", "hackathon-agent")
LANGSMITH_ENDPOINT = os.getenv("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com")

# Set environment variables that LangSmith library expects
if LANGSMITH_TRACING == "true" and LANGSMITH_API_KEY:
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = LANGSMITH_API_KEY
    os.environ["LANGCHAIN_PROJECT"] = LANGSMITH_PROJECT
    os.environ["LANGCHAIN_ENDPOINT"] = LANGSMITH_ENDPOINT

# Validate configuration
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable must be set")

print("[OK] Google AI configured (Gemini 3 Pro)")

if LANGSMITH_TRACING == "true" and LANGSMITH_API_KEY:
    print(f"[OK] LangSmith Tracing enabled: Project '{LANGSMITH_PROJECT}'")
else:
    print("[INFO] LangSmith Tracing disabled (set LANGSMITH_TRACING=true to enable)")
