"""Style Analyzer Tool using Gemini Vision API."""

import base64
import json
import os
from typing import Optional

from langchain_core.tools import tool
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY


# Initialize Gemini client
client = genai.Client(api_key=GOOGLE_API_KEY)

# Store analyzed styles for reference
_analyzed_styles: dict[str, dict] = {}


@tool
def analyze_design_style(
    image_base64: str,
    image_name: Optional[str] = None,
    analysis_focus: str = "comprehensive",
) -> dict:
    """
    Analyze an existing design image to extract its visual style characteristics.
    
    This tool uses Gemini's vision capabilities to understand colors, typography,
    layout patterns, and overall design language from uploaded design assets.
    
    Args:
        image_base64: Base64 encoded image data of the design to analyze.
                     This should be the raw base64 string without data URL prefix.
        image_name: Optional name/identifier for this design asset.
        analysis_focus: What aspects to focus on. Options:
                       - "comprehensive": Full analysis of all design aspects
                       - "colors": Focus on color palette and usage
                       - "typography": Focus on fonts and text styling
                       - "layout": Focus on spacing, grid, and composition
                       - "branding": Focus on brand identity elements
    
    Returns:
        dict containing:
        - style_id: Unique identifier for this analyzed style
        - color_palette: Extracted colors with hex codes and usage
        - typography: Font characteristics and hierarchy
        - layout_patterns: Spacing, grid, and composition details
        - design_language: Overall style description
        - recommendations: How to apply this style to new designs
    """
    # Build analysis prompt based on focus
    focus_prompts = {
        "comprehensive": """Analyze this design comprehensively and extract:

1. COLOR PALETTE:
   - Primary color (hex code)
   - Secondary colors (hex codes)
   - Accent colors (hex codes)
   - Background colors
   - Text colors
   - How colors are used (buttons, headers, accents, etc.)

2. TYPOGRAPHY:
   - Heading style (estimated font family, weight, size relationship)
   - Body text style
   - Caption/small text style
   - Text hierarchy and emphasis patterns

3. LAYOUT & SPACING:
   - Grid system (if apparent)
   - Spacing scale (tight, normal, loose)
   - Component arrangement patterns
   - Visual hierarchy

4. DESIGN ELEMENTS:
   - Border radius style (sharp, rounded, pill)
   - Shadow usage
   - Icon style (outlined, filled, duotone)
   - Image treatment

5. OVERALL STYLE:
   - Design era/trend (modern, minimal, playful, corporate, etc.)
   - Mood/feeling
   - Target audience impression

Provide the analysis in a structured JSON format.""",

        "colors": """Focus specifically on the color palette in this design:

1. List ALL colors you can identify with their hex codes
2. Categorize each color's role (primary, secondary, accent, background, text)
3. Describe the color relationships (complementary, analogous, etc.)
4. Note any gradients or color transitions
5. Identify the overall color mood (warm, cool, vibrant, muted)

Return as structured JSON with hex codes.""",

        "typography": """Analyze the typography in this design:

1. Identify font characteristics (serif, sans-serif, display, monospace)
2. Describe the type scale (heading sizes relative to body)
3. Note font weights used
4. Analyze line heights and letter spacing
5. Describe text alignment patterns
6. Identify any decorative text treatments

Return as structured JSON.""",

        "layout": """Analyze the layout and composition:

1. Identify the grid system or layout structure
2. Measure approximate spacing patterns
3. Describe component arrangement
4. Note alignment principles used
5. Analyze visual hierarchy and flow
6. Identify responsive design hints

Return as structured JSON.""",

        "branding": """Extract brand identity elements:

1. Logo characteristics and placement
2. Brand colors and their application
3. Consistent design motifs or patterns
4. Brand personality conveyed
5. Unique stylistic elements that define the brand

Return as structured JSON.""",
    }

    analysis_prompt = focus_prompts.get(analysis_focus, focus_prompts["comprehensive"])
    
    try:
        # Decode image
        image_bytes = base64.b64decode(image_base64)
        
        # Analyze with Gemini Vision
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                analysis_prompt,
            ],
        )
        
        analysis_text = response.text
        
        # Try to parse as JSON, otherwise structure the response
        try:
            # Clean up the response if it's wrapped in markdown code blocks
            cleaned_text = analysis_text
            if "```json" in cleaned_text:
                cleaned_text = cleaned_text.split("```json")[1].split("```")[0]
            elif "```" in cleaned_text:
                cleaned_text = cleaned_text.split("```")[1].split("```")[0]
            
            analysis_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            # Structure as text analysis
            analysis_data = {"raw_analysis": analysis_text}
        
        # Generate style ID
        style_id = f"style_{image_name or 'unnamed'}_{len(_analyzed_styles)}"
        
        # Create comprehensive style guide
        style_guide = {
            "style_id": style_id,
            "analysis_focus": analysis_focus,
            "analysis": analysis_data,
            "style_summary": _generate_style_summary(analysis_data, analysis_text),
        }
        
        # Store for later reference
        _analyzed_styles[style_id] = style_guide
        
        return {
            "success": True,
            **style_guide,
        }
        
    except Exception as e:
        return {
            "error": f"Style analysis failed: {str(e)}",
        }


def _generate_style_summary(analysis_data: dict, raw_text: str) -> str:
    """Generate a concise style summary for use in generation prompts."""
    summary_parts = []
    
    if isinstance(analysis_data, dict):
        if "color_palette" in analysis_data or "colors" in analysis_data:
            colors = analysis_data.get("color_palette") or analysis_data.get("colors", {})
            if isinstance(colors, dict):
                summary_parts.append(f"Colors: {json.dumps(colors)}")
        
        if "typography" in analysis_data:
            summary_parts.append(f"Typography: {json.dumps(analysis_data['typography'])}")
        
        if "layout" in analysis_data or "layout_patterns" in analysis_data:
            layout = analysis_data.get("layout") or analysis_data.get("layout_patterns", {})
            summary_parts.append(f"Layout: {json.dumps(layout)}")
        
        if "design_language" in analysis_data or "overall_style" in analysis_data:
            style = analysis_data.get("design_language") or analysis_data.get("overall_style", "")
            summary_parts.append(f"Style: {style}")
    
    if not summary_parts:
        # Use raw text as fallback
        return raw_text[:1000] if len(raw_text) > 1000 else raw_text
    
    return "\n".join(summary_parts)


@tool
def get_style_context(style_id: str) -> dict:
    """
    Retrieve a previously analyzed style by its ID.
    
    Use this to get the style context to pass to generate_design_image
    for creating designs that match an existing style.
    
    Args:
        style_id: The style ID returned from analyze_design_style
        
    Returns:
        dict with the style analysis and a formatted context string
        ready to use with generate_design_image
    """
    if style_id in _analyzed_styles:
        style = _analyzed_styles[style_id]
        return {
            "success": True,
            "style_id": style_id,
            "style_context": style["style_summary"],
            "full_analysis": style["analysis"],
        }
    
    return {
        "error": f"Style '{style_id}' not found",
        "available_styles": list(_analyzed_styles.keys()),
    }


@tool
def list_analyzed_styles() -> dict:
    """
    List all design styles that have been analyzed in this session.
    
    Returns:
        dict with count and list of style IDs with their analysis focus
    """
    return {
        "count": len(_analyzed_styles),
        "styles": [
            {
                "style_id": style_id,
                "analysis_focus": data["analysis_focus"],
            }
            for style_id, data in _analyzed_styles.items()
        ],
    }


@tool
def compare_styles(style_id_1: str, style_id_2: str) -> dict:
    """
    Compare two analyzed design styles to identify similarities and differences.
    
    Useful for understanding how different designs relate and creating
    designs that bridge multiple style influences.
    
    Args:
        style_id_1: First style ID to compare
        style_id_2: Second style ID to compare
        
    Returns:
        dict with comparison analysis
    """
    if style_id_1 not in _analyzed_styles:
        return {"error": f"Style '{style_id_1}' not found"}
    if style_id_2 not in _analyzed_styles:
        return {"error": f"Style '{style_id_2}' not found"}
    
    style1 = _analyzed_styles[style_id_1]
    style2 = _analyzed_styles[style_id_2]
    
    # Use Gemini to compare the styles
    try:
        comparison_prompt = f"""Compare these two design style analyses and identify:

1. SIMILARITIES: What design elements, colors, or patterns do they share?
2. DIFFERENCES: How do they differ in approach, mood, or execution?
3. COMPATIBILITY: How well could they be combined?
4. RECOMMENDATIONS: How to create a design that incorporates both styles

STYLE 1:
{json.dumps(style1['analysis'], indent=2)}

STYLE 2:
{json.dumps(style2['analysis'], indent=2)}

Provide a structured comparison."""

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=comparison_prompt,
        )
        
        return {
            "success": True,
            "style_1": style_id_1,
            "style_2": style_id_2,
            "comparison": response.text,
        }
        
    except Exception as e:
        return {
            "error": f"Comparison failed: {str(e)}",
        }

