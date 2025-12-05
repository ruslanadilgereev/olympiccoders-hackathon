"""Configuration settings for Design Automation Agent."""
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Anthropic Configuration
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL") or "claude-sonnet-4-20250514"

# Google AI Configuration (for Gemini image generation)
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
if not ANTHROPIC_API_KEY:
    raise ValueError("ANTHROPIC_API_KEY environment variable must be set")

if not GOOGLE_API_KEY:
    print("[WARNING] GOOGLE_API_KEY not set - image generation will not work")

print(f"[OK] Anthropic configured: {ANTHROPIC_MODEL}")

if GOOGLE_API_KEY:
    print("[OK] Google AI configured for image generation")

if LANGSMITH_TRACING == "true" and LANGSMITH_API_KEY:
    print(f"[OK] LangSmith Tracing enabled: Project '{LANGSMITH_PROJECT}'")
else:
    print("[INFO] LangSmith Tracing disabled (set LANGSMITH_TRACING=true to enable)")

