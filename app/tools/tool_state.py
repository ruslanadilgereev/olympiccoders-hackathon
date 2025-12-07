"""Global tool state for sharing data between middleware and tools.

This allows middleware to extract images from messages and make them
available to tools without the agent needing to pass them.

Also stores the analyzed "Business DNA" - the design style extracted from
uploaded reference images that persists across the session.
"""
from typing import Optional, Any


# Global state dictionary
_tool_state: dict = {
    "images": [],           # List of (bytes, mime) tuples - ALL uploaded images
    "image_data": None,     # Single image (backward compatibility)
    "image_mime": None,     # Single image mime (backward compatibility)
    "business_dna": None,   # Analyzed design style context (persists across session)
    "component_templates": None,  # Extracted component templates (header, navbar, layout)
}


def get_tool_state() -> dict:
    """Get the current tool state."""
    return _tool_state


def set_tool_state(state: dict) -> None:
    """Set the tool state."""
    global _tool_state
    _tool_state = state


# === Multi-Image Support ===

def get_all_images_from_state() -> list[tuple[bytes, str]]:
    """Get ALL images from tool state."""
    return _tool_state.get("images", [])


def set_images_in_state(images: list[tuple[bytes, str]]) -> None:
    """Set multiple images in tool state."""
    _tool_state["images"] = images
    # Also set single image for backward compatibility
    if images:
        _tool_state["image_data"] = images[0][0]
        _tool_state["image_mime"] = images[0][1]
    else:
        _tool_state["image_data"] = None
        _tool_state["image_mime"] = None


def get_image_from_state() -> tuple[bytes | None, str | None]:
    """Get first image data and mime type from tool state (backward compatible)."""
    return _tool_state.get("image_data"), _tool_state.get("image_mime")


def set_image_in_state(image_data: bytes | None, image_mime: str | None) -> None:
    """Set single image data in tool state (backward compatible)."""
    _tool_state["image_data"] = image_data
    _tool_state["image_mime"] = image_mime
    # Also update images list
    if image_data:
        _tool_state["images"] = [(image_data, image_mime)]
    else:
        _tool_state["images"] = []


def clear_image_state() -> None:
    """Clear image data from state."""
    _tool_state["image_data"] = None
    _tool_state["image_mime"] = None
    _tool_state["images"] = []


# === Business DNA (Design Style Context) ===

def get_business_dna() -> Optional[dict]:
    """
    Get the analyzed Business DNA from tool state.
    
    This contains the design style extracted from uploaded reference images,
    including colors, typography, spacing, mood, and other design tokens.
    
    Returns:
        dict with style analysis or None if not analyzed yet
    """
    return _tool_state.get("business_dna")


def set_business_dna(dna: dict) -> None:
    """
    Store the analyzed Business DNA in tool state.
    
    This persists across the session and is automatically injected
    into code generation prompts.
    
    Args:
        dna: dict containing analyzed design style (colors, typography, etc.)
    """
    _tool_state["business_dna"] = dna
    print(f"  🧬 [BUSINESS DNA] Stored design DNA with {len(dna)} properties")


def clear_business_dna() -> None:
    """Clear the Business DNA from state."""
    _tool_state["business_dna"] = None


def has_business_dna() -> bool:
    """Check if Business DNA has been analyzed."""
    return _tool_state.get("business_dna") is not None


# === Component Templates (Header, Navbar, Layout) ===

def get_component_templates() -> Optional[dict]:
    """
    Get the extracted component templates from tool state.
    
    Component templates are pixel-perfect React code for:
    - header_code: Exact header JSX (logo, notifications, user avatar)
    - navbar_code: Exact navbar/stepper JSX (tabs, active states, glows)
    - layout_code: Shell that wraps content with header + navbar
    - card_styles: Reusable card styling patterns
    - button_styles: Button variant patterns
    
    Returns:
        dict with templates or None if not yet extracted
    """
    return _tool_state.get("component_templates")


def set_component_templates(templates: dict) -> None:
    """
    Store extracted component templates in tool state.
    
    These templates are injected into ALL generated screens to ensure
    visual consistency - the header and navbar look identical everywhere.
    
    Args:
        templates: dict containing header_code, navbar_code, layout_code, etc.
    """
    _tool_state["component_templates"] = templates
    template_keys = list(templates.keys()) if templates else []
    print(f"  🎨 [TEMPLATES] Stored {len(template_keys)} component templates: {', '.join(template_keys)}")


def clear_component_templates() -> None:
    """Clear the component templates from state."""
    _tool_state["component_templates"] = None


def has_component_templates() -> bool:
    """Check if component templates have been extracted."""
    templates = _tool_state.get("component_templates")
    return templates is not None and len(templates) > 0


def get_template(template_name: str) -> Optional[str]:
    """
    Get a specific component template by name.
    
    Args:
        template_name: One of 'header_code', 'navbar_code', 'layout_code', etc.
    
    Returns:
        The template code string or None if not found
    """
    templates = _tool_state.get("component_templates")
    if templates:
        return templates.get(template_name)
    return None
