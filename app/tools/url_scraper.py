"""URL Scraper Tool using Firecrawl for brand information extraction."""

import os
import json
from typing import Optional

from langchain_core.tools import tool

try:
    from firecrawl import FirecrawlApp
    FIRECRAWL_AVAILABLE = True
except ImportError:
    FIRECRAWL_AVAILABLE = False

from app.config import FIRECRAWL_API_KEY


# Initialize Firecrawl client
_firecrawl_client = None


def _get_client():
    """Get or create the Firecrawl client."""
    global _firecrawl_client
    
    if not FIRECRAWL_AVAILABLE:
        return None
    
    if _firecrawl_client is None and FIRECRAWL_API_KEY:
        _firecrawl_client = FirecrawlApp(api_key=FIRECRAWL_API_KEY)
    
    return _firecrawl_client


@tool
def scrape_brand_from_url(
    url: str,
    extract_images: bool = True,
) -> dict:
    """
    Scrape brand information from a website URL using Firecrawl.
    
    This tool extracts brand colors, typography hints, logo, and overall
    visual style from a website. Perfect for quickly understanding a
    brand's design language without manual uploads.
    
    Args:
        url: The website URL to scrape (e.g., "https://example.com")
        extract_images: Whether to extract image URLs from the page
    
    Returns:
        dict containing:
        - title: Page title
        - description: Meta description
        - content: Main page content (markdown)
        - images: List of image URLs found
        - metadata: Additional metadata
        - brand_hints: Extracted brand information
    """
    client = _get_client()
    
    if not client:
        return {
            "error": "Firecrawl not available. Please install firecrawl-py and set FIRECRAWL_API_KEY.",
        }
    
    try:
        # Scrape the URL
        result = client.scrape_url(
            url,
            params={
                "formats": ["markdown", "html"],
                "includeTags": ["img", "link", "meta", "style"],
                "onlyMainContent": False,
            }
        )
        
        # Extract brand-relevant information
        brand_hints = _extract_brand_hints(result)
        
        # Get images if requested
        images = []
        if extract_images and result.get("html"):
            images = _extract_image_urls(result.get("html", ""), url)
        
        return {
            "success": True,
            "url": url,
            "title": result.get("metadata", {}).get("title", ""),
            "description": result.get("metadata", {}).get("description", ""),
            "content": result.get("markdown", "")[:5000],  # Limit content size
            "images": images[:20],  # Limit to 20 images
            "metadata": result.get("metadata", {}),
            "brand_hints": brand_hints,
        }
        
    except Exception as e:
        return {
            "error": f"Failed to scrape URL: {str(e)}",
            "url": url,
        }


def _extract_brand_hints(result: dict) -> dict:
    """Extract brand-relevant hints from scraped content."""
    hints = {
        "colors": [],
        "fonts": [],
        "logo_candidates": [],
        "style_keywords": [],
    }
    
    html = result.get("html", "")
    
    # Extract colors from CSS variables and inline styles
    import re
    
    # Find hex colors
    hex_colors = re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', html)
    hints["colors"] = list(set(hex_colors))[:10]
    
    # Find RGB/RGBA colors
    rgb_colors = re.findall(r'rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)', html)
    hints["colors"].extend(list(set(rgb_colors))[:5])
    
    # Find font families
    font_families = re.findall(r'font-family\s*:\s*([^;}"\']+)', html)
    hints["fonts"] = list(set(font_families))[:5]
    
    # Find logo candidates (images with logo in name/alt)
    logo_imgs = re.findall(r'<img[^>]*(?:logo|brand|icon)[^>]*src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    hints["logo_candidates"] = logo_imgs[:5]
    
    # Extract style keywords from meta tags and content
    metadata = result.get("metadata", {})
    if metadata.get("keywords"):
        hints["style_keywords"] = metadata["keywords"].split(",")[:10]
    
    return hints


def _extract_image_urls(html: str, base_url: str) -> list:
    """Extract image URLs from HTML."""
    import re
    from urllib.parse import urljoin
    
    # Find all img src attributes
    img_srcs = re.findall(r'<img[^>]*src=["\']([^"\']+)["\']', html, re.IGNORECASE)
    
    # Convert relative URLs to absolute
    absolute_urls = []
    for src in img_srcs:
        if src.startswith("data:"):
            continue  # Skip data URLs
        if src.startswith("//"):
            src = "https:" + src
        elif not src.startswith("http"):
            src = urljoin(base_url, src)
        absolute_urls.append(src)
    
    return list(set(absolute_urls))


@tool
def crawl_website_for_brand(
    url: str,
    max_pages: int = 5,
) -> dict:
    """
    Crawl multiple pages of a website to build a comprehensive brand profile.
    
    This tool explores the main pages of a website (homepage, about, products)
    to gather a complete picture of the brand's visual identity.
    
    Args:
        url: The starting URL (usually homepage)
        max_pages: Maximum number of pages to crawl (default: 5)
    
    Returns:
        dict with aggregated brand information from multiple pages
    """
    client = _get_client()
    
    if not client:
        return {
            "error": "Firecrawl not available. Please install firecrawl-py and set FIRECRAWL_API_KEY.",
        }
    
    try:
        # Start a crawl
        crawl_result = client.crawl_url(
            url,
            params={
                "limit": max_pages,
                "scrapeOptions": {
                    "formats": ["markdown"],
                }
            },
            poll_interval=2,
        )
        
        # Aggregate brand information
        all_colors = set()
        all_fonts = set()
        all_images = []
        page_summaries = []
        
        for page in crawl_result.get("data", []):
            hints = _extract_brand_hints({"html": page.get("html", ""), "metadata": page.get("metadata", {})})
            all_colors.update(hints.get("colors", []))
            all_fonts.update(hints.get("fonts", []))
            
            page_summaries.append({
                "url": page.get("metadata", {}).get("sourceURL", ""),
                "title": page.get("metadata", {}).get("title", ""),
            })
        
        return {
            "success": True,
            "url": url,
            "pages_crawled": len(crawl_result.get("data", [])),
            "aggregated_colors": list(all_colors)[:15],
            "aggregated_fonts": list(all_fonts)[:10],
            "pages": page_summaries,
            "brand_summary": f"Crawled {len(crawl_result.get('data', []))} pages from {url}",
        }
        
    except Exception as e:
        return {
            "error": f"Failed to crawl website: {str(e)}",
            "url": url,
        }


@tool
def extract_brand_identity(url: str) -> dict:
    """
    Extract comprehensive brand identity from a website URL.
    
    This is the primary tool to use when a user provides a URL and wants
    to analyze the brand's visual style. It scrapes the page and provides
    a structured brand analysis ready to use for design generation.
    
    Args:
        url: The website URL to analyze
    
    Returns:
        dict with structured brand identity information including:
        - colors: Brand color palette
        - typography: Font information
        - imagery: Key images and logo
        - tone: Brand voice/tone based on content
        - style_guide: Generated style guide summary
    """
    # First scrape the main page
    scrape_result = scrape_brand_from_url.invoke({"url": url, "extract_images": True})
    
    if "error" in scrape_result:
        return scrape_result
    
    # Build brand identity profile
    brand_identity = {
        "success": True,
        "url": url,
        "company_name": scrape_result.get("title", "").split("|")[0].split("-")[0].strip(),
        "tagline": scrape_result.get("description", ""),
        "colors": {
            "detected": scrape_result.get("brand_hints", {}).get("colors", []),
            "note": "Colors extracted from CSS. Primary color is likely the most frequently used.",
        },
        "typography": {
            "fonts": scrape_result.get("brand_hints", {}).get("fonts", []),
            "note": "Font families detected in the stylesheet.",
        },
        "imagery": {
            "logo_candidates": scrape_result.get("brand_hints", {}).get("logo_candidates", []),
            "key_images": scrape_result.get("images", [])[:10],
        },
        "content_preview": scrape_result.get("content", "")[:1000],
        "style_guide_prompt": _generate_style_guide_prompt(scrape_result),
    }
    
    return brand_identity


def _generate_style_guide_prompt(scrape_result: dict) -> str:
    """Generate a style guide prompt from scraped data."""
    hints = scrape_result.get("brand_hints", {})
    
    colors = hints.get("colors", [])[:5]
    fonts = hints.get("fonts", [])[:3]
    
    prompt_parts = [
        f"Brand: {scrape_result.get('title', 'Unknown')}",
        f"Colors: {', '.join(colors) if colors else 'Not detected'}",
        f"Fonts: {', '.join(fonts) if fonts else 'System fonts'}",
        f"Style: Modern web design based on {scrape_result.get('url', '')}",
    ]
    
    return "\n".join(prompt_parts)

