"""Design Tokens Tools - Extract and manage design DNA.

This module provides tools for managing design tokens (colors, typography,
spacing, etc.) that ensure consistent visual style across all generated
components and screens.

Design tokens are extracted from analyzed images and can be applied
to new components to maintain brand consistency.
"""

import json
import time
from typing import Optional
from langchain_core.tools import tool

# In-memory design tokens store (could be persisted to file or DB)
_design_tokens_store: dict = {
    "colors": {
        "primary": "#3b82f6",
        "secondary": "#6366f1",
        "accent": "#8b5cf6",
        "background": "#0f172a",
        "surface": "#1e293b",
        "text": "#f8fafc",
        "text_muted": "#94a3b8",
        "success": "#22c55e",
        "warning": "#f59e0b",
        "error": "#ef4444",
    },
    "typography": {
        "font_family": "Inter, system-ui, sans-serif",
        "font_family_mono": "JetBrains Mono, monospace",
        "heading_weight": "600",
        "body_weight": "400",
        "base_size": "16px",
        "scale_ratio": 1.25,
    },
    "spacing": {
        "unit": "4px",
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px",
    },
    "borders": {
        "radius_sm": "4px",
        "radius_md": "8px",
        "radius_lg": "12px",
        "radius_full": "9999px",
        "width": "1px",
    },
    "shadows": {
        "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    },
    "components": {
        "button": {
            "padding": "8px 16px",
            "border_radius": "8px",
            "font_weight": "500",
        },
        "card": {
            "padding": "16px",
            "border_radius": "12px",
            "background": "#1e293b",
        },
        "input": {
            "padding": "8px 12px",
            "border_radius": "6px",
            "border_color": "#334155",
        },
    },
    "metadata": {
        "name": "Default Design System",
        "description": "Default dark theme design tokens",
        "last_updated": None,
    }
}


def log_progress(tool_name: str, step: str, details: str = ""):
    """Log progress for tool execution."""
    timestamp = time.strftime("%H:%M:%S")
    if details:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}: {details}")
    else:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}")


@tool
def get_design_tokens(category: Optional[str] = None) -> dict:
    """
    Get the current design tokens.
    
    Returns the extracted design DNA (colors, typography, spacing, etc.)
    that should be used when generating new components to ensure consistency.
    
    Args:
        category: Optional category to get specific tokens.
                  Options: "colors", "typography", "spacing", "borders", "shadows", "components"
                  If not provided, returns all tokens.
    
    Returns:
        dict containing:
        - success: Boolean
        - tokens: The design tokens (all or specific category)
        - ai_notes: Usage guidance
    """
    log_progress("GET_DESIGN_TOKENS", "Retrieving", category or "all tokens")
    
    if category:
        if category in _design_tokens_store:
            return {
                "success": True,
                "tokens": {category: _design_tokens_store[category]},
                "category": category,
                "ai_notes": f"Retrieved {category} tokens. Use these values when generating components for consistency.",
            }
        else:
            return {
                "success": False,
                "error": f"Unknown category: {category}",
                "available_categories": list(_design_tokens_store.keys()),
            }
    
    return {
        "success": True,
        "tokens": _design_tokens_store,
        "ai_notes": "Retrieved all design tokens. Use these values for colors, fonts, spacing, etc. to maintain visual consistency.",
    }


@tool
def update_design_tokens(
    category: str,
    updates: dict,
    merge: bool = True,
) -> dict:
    """
    Update design tokens with new values.
    
    Use this after analyzing an image to store the extracted design DNA,
    or to manually update the design system.
    
    Args:
        category: Which category to update ("colors", "typography", "spacing", "borders", "shadows", "components", "metadata")
        updates: Dictionary of token updates to apply
        merge: If True, merge with existing tokens. If False, replace entirely.
    
    Returns:
        dict containing:
        - success: Boolean
        - tokens: Updated tokens for the category
        - changes: Summary of what changed
    """
    log_progress("UPDATE_DESIGN_TOKENS", "Updating", f"category: {category}")
    
    if category not in _design_tokens_store:
        return {
            "success": False,
            "error": f"Unknown category: {category}",
            "available_categories": list(_design_tokens_store.keys()),
        }
    
    if merge:
        # Merge with existing
        if isinstance(_design_tokens_store[category], dict):
            _design_tokens_store[category].update(updates)
        else:
            _design_tokens_store[category] = updates
    else:
        # Replace entirely
        _design_tokens_store[category] = updates
    
    # Update metadata timestamp
    _design_tokens_store["metadata"]["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    log_progress("UPDATE_DESIGN_TOKENS", "Complete", f"Updated {len(updates)} tokens")
    
    return {
        "success": True,
        "tokens": {category: _design_tokens_store[category]},
        "changes": list(updates.keys()),
        "ai_notes": f"Updated {len(updates)} tokens in {category}. New components should use these values.",
    }


@tool
def extract_tokens_from_analysis(style_analysis: dict) -> dict:
    """
    Extract and store design tokens from a style analysis result.
    
    Takes the output from analyze_design_style and converts it into
    structured design tokens that can be used for consistent component generation.
    
    Args:
        style_analysis: The result from analyze_design_style tool
    
    Returns:
        dict containing:
        - success: Boolean
        - extracted_tokens: The tokens that were extracted and stored
        - ai_notes: What was extracted
    """
    log_progress("EXTRACT_TOKENS", "Starting", "Processing style analysis")
    
    if not style_analysis:
        return {
            "success": False,
            "error": "No style analysis provided",
        }
    
    extracted = {}
    
    # Extract colors if present
    if "colors" in style_analysis:
        colors = style_analysis["colors"]
        color_tokens = {}
        if isinstance(colors, dict):
            if "primary" in colors:
                color_tokens["primary"] = colors["primary"]
            if "secondary" in colors:
                sec = colors["secondary"]
                color_tokens["secondary"] = sec[0] if isinstance(sec, list) and sec else sec
            if "accent" in colors:
                acc = colors["accent"]
                color_tokens["accent"] = acc[0] if isinstance(acc, list) and acc else acc
            if "background" in colors:
                color_tokens["background"] = colors["background"]
            if "text" in colors:
                color_tokens["text"] = colors["text"]
        
        if color_tokens:
            _design_tokens_store["colors"].update(color_tokens)
            extracted["colors"] = color_tokens
    
    # Extract typography if present
    if "typography" in style_analysis:
        typo = style_analysis["typography"]
        typo_tokens = {}
        if isinstance(typo, dict):
            if "font_family" in typo or "fontFamily" in typo:
                typo_tokens["font_family"] = typo.get("font_family") or typo.get("fontFamily")
            if "heading_style" in typo or "headingStyle" in typo:
                typo_tokens["heading_weight"] = typo.get("heading_style") or typo.get("headingStyle")
        
        if typo_tokens:
            _design_tokens_store["typography"].update(typo_tokens)
            extracted["typography"] = typo_tokens
    
    # Extract spacing/layout if present
    if "layout" in style_analysis:
        layout = style_analysis["layout"]
        if isinstance(layout, dict):
            spacing_tokens = {}
            if "spacing" in layout:
                spacing_tokens["unit"] = layout["spacing"]
            if spacing_tokens:
                _design_tokens_store["spacing"].update(spacing_tokens)
                extracted["spacing"] = spacing_tokens
    
    # Update metadata
    _design_tokens_store["metadata"]["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S")
    _design_tokens_store["metadata"]["description"] = "Extracted from style analysis"
    
    log_progress("EXTRACT_TOKENS", "Complete", f"Extracted {len(extracted)} categories")
    
    return {
        "success": True,
        "extracted_tokens": extracted,
        "total_categories": len(extracted),
        "ai_notes": f"Extracted design tokens from analysis. Categories updated: {', '.join(extracted.keys()) if extracted else 'none'}",
    }


@tool
def get_tailwind_config_from_tokens() -> dict:
    """
    Generate Tailwind CSS configuration from current design tokens.
    
    Converts the design tokens into a format that can be used in
    tailwind.config.js to extend the default theme.
    
    Returns:
        dict containing:
        - success: Boolean
        - tailwind_config: The Tailwind configuration object
        - css_variables: CSS custom properties for the tokens
    """
    log_progress("TAILWIND_CONFIG", "Generating", "Converting tokens to Tailwind format")
    
    tokens = _design_tokens_store
    
    # Build Tailwind config extend section
    tailwind_extend = {
        "colors": {
            "primary": tokens["colors"].get("primary"),
            "secondary": tokens["colors"].get("secondary"),
            "accent": tokens["colors"].get("accent"),
            "background": tokens["colors"].get("background"),
            "surface": tokens["colors"].get("surface"),
            "muted": tokens["colors"].get("text_muted"),
        },
        "fontFamily": {
            "sans": [tokens["typography"].get("font_family", "Inter")],
            "mono": [tokens["typography"].get("font_family_mono", "monospace")],
        },
        "borderRadius": {
            "sm": tokens["borders"].get("radius_sm"),
            "md": tokens["borders"].get("radius_md"),
            "lg": tokens["borders"].get("radius_lg"),
        },
        "spacing": {
            "xs": tokens["spacing"].get("xs"),
            "sm": tokens["spacing"].get("sm"),
            "md": tokens["spacing"].get("md"),
            "lg": tokens["spacing"].get("lg"),
            "xl": tokens["spacing"].get("xl"),
        },
    }
    
    # Build CSS variables
    css_vars = f"""
:root {{
  /* Colors */
  --color-primary: {tokens['colors'].get('primary', '#3b82f6')};
  --color-secondary: {tokens['colors'].get('secondary', '#6366f1')};
  --color-accent: {tokens['colors'].get('accent', '#8b5cf6')};
  --color-background: {tokens['colors'].get('background', '#0f172a')};
  --color-surface: {tokens['colors'].get('surface', '#1e293b')};
  --color-text: {tokens['colors'].get('text', '#f8fafc')};
  --color-text-muted: {tokens['colors'].get('text_muted', '#94a3b8')};
  
  /* Typography */
  --font-family: {tokens['typography'].get('font_family', 'Inter, system-ui, sans-serif')};
  --font-family-mono: {tokens['typography'].get('font_family_mono', 'monospace')};
  
  /* Spacing */
  --space-xs: {tokens['spacing'].get('xs', '4px')};
  --space-sm: {tokens['spacing'].get('sm', '8px')};
  --space-md: {tokens['spacing'].get('md', '16px')};
  --space-lg: {tokens['spacing'].get('lg', '24px')};
  --space-xl: {tokens['spacing'].get('xl', '32px')};
  
  /* Borders */
  --radius-sm: {tokens['borders'].get('radius_sm', '4px')};
  --radius-md: {tokens['borders'].get('radius_md', '8px')};
  --radius-lg: {tokens['borders'].get('radius_lg', '12px')};
}}
""".strip()
    
    log_progress("TAILWIND_CONFIG", "Complete", "Config generated")
    
    return {
        "success": True,
        "tailwind_config": {
            "theme": {
                "extend": tailwind_extend
            }
        },
        "css_variables": css_vars,
        "ai_notes": "Generated Tailwind config and CSS variables. Use these in your project for consistent styling.",
    }


@tool
def reset_design_tokens() -> dict:
    """
    Reset design tokens to default values.
    
    Use this to start fresh with the default design system.
    
    Returns:
        dict confirming the reset
    """
    global _design_tokens_store
    
    _design_tokens_store = {
        "colors": {
            "primary": "#3b82f6",
            "secondary": "#6366f1",
            "accent": "#8b5cf6",
            "background": "#0f172a",
            "surface": "#1e293b",
            "text": "#f8fafc",
            "text_muted": "#94a3b8",
            "success": "#22c55e",
            "warning": "#f59e0b",
            "error": "#ef4444",
        },
        "typography": {
            "font_family": "Inter, system-ui, sans-serif",
            "font_family_mono": "JetBrains Mono, monospace",
            "heading_weight": "600",
            "body_weight": "400",
            "base_size": "16px",
            "scale_ratio": 1.25,
        },
        "spacing": {
            "unit": "4px",
            "xs": "4px",
            "sm": "8px",
            "md": "16px",
            "lg": "24px",
            "xl": "32px",
            "2xl": "48px",
        },
        "borders": {
            "radius_sm": "4px",
            "radius_md": "8px",
            "radius_lg": "12px",
            "radius_full": "9999px",
            "width": "1px",
        },
        "shadows": {
            "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
        },
        "components": {
            "button": {
                "padding": "8px 16px",
                "border_radius": "8px",
                "font_weight": "500",
            },
            "card": {
                "padding": "16px",
                "border_radius": "12px",
                "background": "#1e293b",
            },
            "input": {
                "padding": "8px 12px",
                "border_radius": "6px",
                "border_color": "#334155",
            },
        },
        "metadata": {
            "name": "Default Design System",
            "description": "Default dark theme design tokens",
            "last_updated": time.strftime("%Y-%m-%d %H:%M:%S"),
        }
    }
    
    log_progress("RESET_TOKENS", "Complete", "Reset to defaults")
    
    return {
        "success": True,
        "message": "Design tokens reset to defaults",
        "ai_notes": "Design tokens have been reset. The default dark theme is now active.",
    }


