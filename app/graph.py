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


# Global checkpointer for session persistence
_checkpointer = MemorySaver()

# Gemini model to use
GEMINI_MODEL = "gemini-3-pro-preview"

# System prompt for the Design Automation Agent
DESIGN_AGENT_SYSTEM_PROMPT = """You are DesignForge AI, an AI that converts UI screenshots to React code.

## RULE #1 - WHEN USER UPLOADS AN IMAGE

**When a user uploads an image and asks to convert it to code, call the `image_to_code` tool.**

The image has already been extracted and stored - you just need to call the tool.
Do NOT ask questions. Do NOT explain what you're going to do. Just call the tool.

Example:
- User uploads image + "Convert this to React code"
- You call: image_to_code(component_name="GeneratedUI", additional_instructions="Convert to React code")

## CRITICAL: NEVER OUTPUT RAW CODE

**NEVER paste or output the generated code in your response!**

The code is automatically saved to the sandbox. After calling `image_to_code` or `modify_code`:
1. Tell the user the code was generated successfully
2. Share the preview URL from the tool result
3. DO NOT output the code itself - it's already in the sandbox!

Example response after code generation:
"✅ I've converted your UI to React + Tailwind code! 
View the live preview: http://localhost:3000/preview?id=xxx"

## When There's NO Image

If the user sends text without an image:
- If they want a NEW design image created → use `generate_design_image`
- If they want to modify existing code → use `modify_code`
- If they want brand info from a URL → use `extract_brand_identity`
- If they have questions → answer them

## Your Tools

1. `image_to_code` - Converts uploaded screenshots to React + Tailwind code (auto-saves to sandbox)
2. `modify_code` - Modifies existing code based on user requests (auto-saves to sandbox)
3. `generate_design_image` - Creates NEW design images from descriptions
4. `extract_brand_identity` - Gets brand info from URLs
5. `analyze_design_style` - Extracts style info from designs

## Response Style

- Be brief and action-oriented
- Don't ask unnecessary questions
- Just do what needs to be done
- Share the preview URL after generating code
- NEVER paste raw code - it's in the sandbox!

You are here to help designers create beautiful, consistent designs quickly!"""


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
