"""Design Automation Tools for LangGraph Agent."""

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

__all__ = [
    # Image generation
    "generate_design_image",
    "generate_multiple_design_images",
    "get_generated_image",
    "list_generated_images",
    # Style analysis
    "analyze_design_style",
    "get_style_context",
    "list_analyzed_styles",
    "compare_styles",
    # Knowledge store
    "store_knowledge",
    "retrieve_knowledge",
    "list_knowledge_documents",
    "get_knowledge_document",
    "delete_knowledge_document",
    # URL scraping
    "scrape_brand_from_url",
    "crawl_website_for_brand",
    "extract_brand_identity",
    # Code generation
    "image_to_code",
    "modify_code",
    "get_generated_code",
    "generate_screen",
    # Screen management (Cursor-like)
    "list_screens",
    "load_screen",
    "update_screen",
    "create_screen",
    "delete_screen",
    "create_screen_variant",
    "list_screen_variants",
    "compare_screen_variants",
    # Flow/Process diagrams
    "generate_flow_spec",
    "generate_flow_component",
    "get_flow_template",
    "list_flow_templates",
    # Workflow planning (multi-screen progress)
    "generate_workflow_plan",
    "update_workflow_step",
    # Design Tokens (Design DNA)
    "get_design_tokens",
    "update_design_tokens",
    "extract_tokens_from_analysis",
    "get_tailwind_config_from_tokens",
    "reset_design_tokens",
]

