"""Design Automation Tools for LangGraph Agent."""

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

__all__ = [
    # Image generation
    "generate_design_image",
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
]

