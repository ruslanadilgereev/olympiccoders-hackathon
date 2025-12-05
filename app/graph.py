"""LangGraph agent definition using langgraph prebuilt react agent."""
from langchain_anthropic import ChatAnthropic
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

from app.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL


# Global checkpointer for session persistence
_checkpointer = MemorySaver()


def create_agent_graph():
    """
    Create a simple chat agent using LangGraph's prebuilt react agent.
    
    Features:
    - Anthropic Claude as the LLM
    - No tools (pure chat)
    - Automatic checkpointing for session persistence
    
    Returns:
        Compiled agent graph
    """
    # Initialize Claude
    model = ChatAnthropic(
        model=ANTHROPIC_MODEL,
        api_key=ANTHROPIC_API_KEY,
        temperature=0.7,
        max_tokens=4096,
    )
    
    # Create react agent without tools
    agent = create_react_agent(
        model=model,
        tools=[],  # No tools - simple chat agent
        checkpointer=_checkpointer,
    )
    
    return agent


# Export function for langgraph.json
def create_agent():
    """Entry point for LangGraph CLI."""
    return create_agent_graph()
