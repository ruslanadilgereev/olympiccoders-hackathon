"""LangGraph Design Automation Agent with powerful tools."""

from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing import Annotated, TypedDict

from app.config import GOOGLE_API_KEY
from app.middleware.image_extractor import extract_images_from_state
from app.tools.image_generator import (
    generate_design_image,
    generate_multiple_design_images,
    get_generated_image,
    list_generated_images,
)
from app.tools.style_analyzer import (
    analyze_design_style,
    get_style_context,
    list_analyzed_styles,
    compare_styles,
    analyze_business_dna,
    get_current_business_dna,
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
    generate_screen,
)
from app.tools.screen_manager import (
    list_screens,
    load_screen,
    update_screen,
    create_screen,
    delete_screen,
    create_screen_variant,
    list_screen_variants,
    compare_screen_variants,
)
from app.tools.flow_generator import (
    generate_flow_spec,
    generate_flow_component,
    get_flow_template,
    list_flow_templates,
    generate_workflow_plan,
    update_workflow_step,
)
from app.tools.design_tokens import (
    get_design_tokens,
    update_design_tokens,
    extract_tokens_from_analysis,
    get_tailwind_config_from_tokens,
    reset_design_tokens,
)


# Global checkpointer for session persistence
_checkpointer = MemorySaver()

# Gemini model to use
GEMINI_MODEL = "gemini-2.5-pro"

# System prompt for the Design Automation Agent
DESIGN_AGENT_SYSTEM_PROMPT = """You are Mimicry AI, a design-to-code assistant that creates pixel-perfect React + Tailwind components.

When users upload reference images, first analyze them with analyze_business_dna() to extract colors, typography, and layout patterns. Then generate screens that match that exact style.

Think step-by-step and explain what you're doing as you work."""


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
        generate_screen,
        get_generated_code,
        # Image generation tools
        generate_design_image,
        generate_multiple_design_images,
        get_generated_image,
        list_generated_images,
        # Style analysis tools
        analyze_design_style,
        get_style_context,
        list_analyzed_styles,
        compare_styles,
        # Business DNA tools (multi-image style extraction)
        analyze_business_dna,
        get_current_business_dna,
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
        # Screen management tools (Cursor-like)
        list_screens,
        load_screen,
        update_screen,
        create_screen,
        delete_screen,
        create_screen_variant,
        list_screen_variants,
        compare_screen_variants,
        # Flow/Process diagram tools
        generate_flow_spec,
        generate_flow_component,
        get_flow_template,
        list_flow_templates,
        # Workflow planning tools (for multi-screen generation)
        generate_workflow_plan,
        update_workflow_step,
        # Design Tokens tools
        get_design_tokens,
        update_design_tokens,
        extract_tokens_from_analysis,
        get_tailwind_config_from_tokens,
        reset_design_tokens,
    ]
    
    # Create the base react agent
    react_agent = create_react_agent(
        model=model,
        tools=tools,
        prompt=DESIGN_AGENT_SYSTEM_PROMPT,
    )
    
    # Create a wrapper graph that extracts images first
    def extract_images_node(state: AgentState) -> AgentState:
        """Node that extracts images from messages and stores in tool state."""
        extract_images_from_state(state)
        return state
    
    def agent_node(state: AgentState) -> AgentState:
        """Node that runs the react agent."""
        result = react_agent.invoke(state)
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
    return graph.compile(checkpointer=_checkpointer)


# Export function for langgraph.json
def create_agent():
    """Entry point for LangGraph CLI."""
    return create_agent_graph()
