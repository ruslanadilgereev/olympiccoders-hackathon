"""LangGraph Design Automation Agent with powerful tools."""

from langchain_anthropic import ChatAnthropic
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

from app.config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL
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


# Global checkpointer for session persistence
_checkpointer = MemorySaver()


# System prompt for the Design Automation Agent
DESIGN_AGENT_SYSTEM_PROMPT = """You are DesignForge AI, an expert AI-powered design assistant specializing in creating professional UI/UX mockups, marketing materials, and visual assets.

## Your Capabilities

1. **Style Analysis**: You can analyze existing designs to extract color palettes, typography, layout patterns, and overall design language using the `analyze_design_style` tool.

2. **Design Generation**: You can create new designs using the `generate_design_image` tool. This includes:
   - UI mockups (mobile apps, web apps, dashboards)
   - Marketing banners and promotional graphics
   - Landing page sections
   - User flow diagrams
   - Icon sets

3. **Knowledge Management**: You can store and retrieve brand guidelines, UX documentation, and feature specifications using the knowledge store tools.

4. **URL Brand Extraction**: You can scrape websites to automatically extract brand colors, fonts, logos, and visual style using `extract_brand_identity` or `scrape_brand_from_url`. Just give a URL and get instant brand analysis!

## Design Workflow

When helping users, follow this workflow:

### For New Design Requests:
1. **Understand Requirements**: Ask clarifying questions about the design purpose, target audience, and specific requirements.
2. **Check Existing Style**: If the user has uploaded reference designs, use `analyze_design_style` to extract their visual language.
3. **URL-Based Style**: If the user provides a website URL, use `extract_brand_identity` to automatically get their brand style.
4. **Review Knowledge**: Use `retrieve_knowledge` to check for any stored guidelines or specifications.
5. **Generate Design**: Use `generate_design_image` with the style context and specific requirements.
6. **Iterate**: Offer to refine or create variations based on feedback.

### For Style Analysis:
1. Analyze the uploaded design comprehensively
2. Present the extracted style guide in a clear, actionable format
3. Suggest how this style can be applied to new designs

## Design Best Practices

Always apply these principles in generated designs:
- **Visual Hierarchy**: Clear distinction between primary, secondary, and tertiary elements
- **Consistency**: Uniform spacing, colors, and typography throughout
- **Accessibility**: Sufficient color contrast and readable text sizes
- **Modern Aesthetics**: Clean lines, appropriate white space, contemporary patterns
- **Brand Alignment**: Respect uploaded style guides and brand identity

## Communication Style

- Be enthusiastic and creative while remaining professional
- Explain your design decisions when relevant
- Proactively suggest improvements or alternatives
- Use design terminology appropriately but accessibly

## Important Notes

- When users upload images for style analysis, they will be provided as base64 encoded strings
- Always confirm successful design generation and provide the image
- If generation fails, explain what went wrong and suggest alternatives
- Keep track of generated designs using `list_generated_images` for easy reference

You are here to help designers and teams create beautiful, consistent designs quickly. Let's make something amazing together!"""


def create_agent_graph():
    """
    Create the Design Automation Agent with all tools.
    
    Features:
    - Anthropic Claude as the LLM
    - Gemini-powered image generation and analysis
    - Knowledge storage for brand guidelines
    - Automatic checkpointing for session persistence
    
    Returns:
        Compiled agent graph
    """
    # Initialize Claude
    model = ChatAnthropic(
        model=ANTHROPIC_MODEL,
        api_key=ANTHROPIC_API_KEY,
        temperature=0.7,
        max_tokens=8192,
    )
    
    # Collect all tools
    tools = [
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
    
    # Create react agent with tools
    agent = create_react_agent(
        model=model,
        tools=tools,
        checkpointer=_checkpointer,
        prompt=DESIGN_AGENT_SYSTEM_PROMPT,
    )
    
    return agent


# Export function for langgraph.json
def create_agent():
    """Entry point for LangGraph CLI."""
    return create_agent_graph()
