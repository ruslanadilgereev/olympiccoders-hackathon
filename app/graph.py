"""LangGraph Design Automation Agent with powerful tools."""

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing import Annotated, TypedDict

from app.config import GOOGLE_API_KEY
from app.middleware.image_extractor import extract_images_from_state
from app.tools.code_generator import image_to_code, modify_code, get_generated_code
from app.tools.tool_state import set_thread_id
from langchain_core.runnables import RunnableConfig


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

# System prompt - OPTIMIZED FOR SPEED, PREVENTS LOOPS
DESIGN_AGENT_SYSTEM_PROMPT = """You are DesignForge AI.

ROUTING:
- Image uploaded → image_to_code(component_name="GeneratedUI") - ONCE per session
- Text request → modify_code(modification_request="...") - ONCE per request

CRITICAL RULES:
1. Call EXACTLY ONE tool per user message, then STOP
2. NEVER call the same tool twice in a row
3. After tool completes, respond with "✅ Done. Preview: http://localhost:3000/preview"
4. Do NOT call modify_code again after it returns success
5. Do NOT explain or elaborate - just confirm completion

FORBIDDEN:
- Multiple tool calls per request
- Calling modify_code more than once
- Calling image_to_code after code exists
"""


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
    model = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GOOGLE_API_KEY,
        temperature=0,  # Deterministic = faster
    )
    
    # Only core tools for speed
    tools = [image_to_code, modify_code, get_generated_code]
    
    react_agent = create_react_agent(model=model, tools=tools, prompt=DESIGN_AGENT_SYSTEM_PROMPT)
    
    def extract_images_node(state: AgentState, config: RunnableConfig) -> AgentState:
        thread_id = config.get("configurable", {}).get("thread_id", "")
        set_thread_id(thread_id)
        extract_images_from_state(state)
        return state
    
    def agent_node(state: AgentState, config: RunnableConfig) -> AgentState:
        # Limit recursion to prevent infinite loops in ReAct agent
        limited_config = {**config, "recursion_limit": 10}
        return react_agent.invoke(state, limited_config)
    
    # Build the graph
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("extract_images", extract_images_node)
    graph.add_node("agent", agent_node)
    
    # Add edges
    graph.add_edge(START, "extract_images")
    graph.add_edge("extract_images", "agent")
    graph.add_edge("agent", END)
    
    # Compile with checkpointer and recursion limit to prevent loops
    checkpointer = setup_checkpointer()
    return graph.compile(
        checkpointer=checkpointer,
        # Limit iterations: 1 tool call should be enough per request
        # This prevents the agent from looping endlessly
    )


# Export function for langgraph.json
def create_agent():
    """Entry point for LangGraph CLI."""
    return create_agent_graph()
