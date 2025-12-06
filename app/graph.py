"""LangGraph Design Automation Agent with powerful tools."""

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing import Annotated, TypedDict

from app.config import GOOGLE_API_KEY, SQLITE_DB_PATH
from app.middleware.image_extractor import extract_images_from_state
from app.tools.image_generator import (
    generate_design_image,
    get_generated_image,
    list_generated_images,
)
from app.tools.style_analyzer import (
    analyze_design_style,
    get_style_context,
    list_analyzed_styles,
    compare_styles,
)
from app.tools.knowledge_store import (
    store_knowledge,
    retrieve_knowledge,
    list_knowledge_documents,
    get_knowledge_document,
    delete_knowledge_document,
)
from app.tools.url_scraper import (
    scrape_brand_from_url,
    crawl_website_for_brand,
    extract_brand_identity,
)
from app.tools.code_generator import (
    image_to_code,
    modify_code,
    get_generated_code,
)


# Global checkpointer for session storage (in-memory)
_checkpointer = None


def setup_checkpointer():
    """Initialize MemorySaver for session checkpointing."""
    global _checkpointer
    if _checkpointer is None:
        print("[DB] Initializing MemorySaver for session checkpointing")
        _checkpointer = MemorySaver()
        print("[OK] MemorySaver initialized for sessions")
    return _checkpointer

# Gemini model to use
GEMINI_MODEL = "gemini-3-pro-preview"

# System prompt for the Design Automation Agent - OPTIMIZED FOR SPEED
DESIGN_AGENT_SYSTEM_PROMPT = """You are DesignForge AI. Convert UI screenshots to React code.

## ROUTING - ACT IMMEDIATELY

1. **Image uploaded** → Call `image_to_code` NOW. No questions.
2. **Change request** (colors, borders, text, layout) → Call `modify_code` NOW.
   - You do NOT need to pass current_code - it's automatic!
   - Just pass the modification_request.
3. **New design from text** → Call `generate_design_image`.

## RULES

- `image_to_code` = ONCE per session (first image)
- `modify_code` = ALL changes after that (no current_code needed!)
- NEVER output raw code - it auto-saves to sandbox
- After tool call: "✅ Done. Preview: [URL]"

## EXAMPLES

User: "alle rahmen grün"
→ Call: modify_code(modification_request="Change all borders/frames to green")

User: "make button red"  
→ Call: modify_code(modification_request="Change button color to red")

User: [uploads image]
→ Call: image_to_code(component_name="GeneratedUI")

BE FAST. Call the tool now."""


class AgentState(TypedDict):
    """State for the agent graph."""
    messages: Annotated[list, add_messages]


def create_agent_graph():
    """
    Create the Design Automation Agent with image extraction.
    
    This creates a custom graph that:
    1. Extracts images from messages and stores in tool state
    2. Runs the react agent with tools
    
    Returns:
        Compiled agent graph
    """
    # Initialize Gemini
    model = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GOOGLE_API_KEY,
        temperature=0.7,
        max_output_tokens=8192,
    )
    
    # Collect all tools
    tools = [
        # Code generation tools (uses image from state)
        image_to_code,
        modify_code,
        get_generated_code,
        # Image generation tools
        generate_design_image,
        get_generated_image,
        list_generated_images,
        # Style analysis tools
        analyze_design_style,
        get_style_context,
        list_analyzed_styles,
        compare_styles,
        # Knowledge store tools
        store_knowledge,
        retrieve_knowledge,
        list_knowledge_documents,
        get_knowledge_document,
        delete_knowledge_document,
        # URL scraping tools
        scrape_brand_from_url,
        crawl_website_for_brand,
        extract_brand_identity,
    ]
    
    # Create the base react agent
    react_agent = create_react_agent(
        model=model,
        tools=tools,
        prompt=DESIGN_AGENT_SYSTEM_PROMPT,
    )
    
    # Import here to avoid circular dependency
    from app.tools.tool_state import set_thread_id
    from langchain_core.runnables import RunnableConfig
    
    # Create a wrapper graph that extracts images and sets thread_id
    def extract_images_node(state: AgentState, config: RunnableConfig) -> AgentState:
        """Node that extracts images from messages and stores in tool state."""
        # Extract thread_id from config and store in tool state
        thread_id = config.get("configurable", {}).get("thread_id", "")
        set_thread_id(thread_id)
        if thread_id:
            print(f"  🔗 [SESSION] Thread ID set: {thread_id[:8]}...")
        
        extract_images_from_state(state)
        return state
    
    def agent_node(state: AgentState, config: RunnableConfig) -> AgentState:
        """Node that runs the react agent."""
        result = react_agent.invoke(state, config)
        return result
    
    # Build the graph
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("extract_images", extract_images_node)
    graph.add_node("agent", agent_node)
    
    # Add edges
    graph.add_edge(START, "extract_images")
    graph.add_edge("extract_images", "agent")
    graph.add_edge("agent", END)
    
    # Compile with checkpointer
    checkpointer = setup_checkpointer()
    return graph.compile(checkpointer=checkpointer)


# Export function for langgraph.json
def create_agent():
    """Entry point for LangGraph CLI."""
    return create_agent_graph()
