"""Style Analyzer Tool using Gemini 3 Pro Vision API."""

import base64
import json
from typing import Optional

from langchain_core.tools import tool
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY
from app.tools.tool_state import (
    get_image_from_state,
    get_all_images_from_state,
    get_business_dna,
    set_business_dna,
    has_business_dna,
    get_component_templates,
    set_component_templates,
    has_component_templates,
)


# Initialize Gemini client with extended timeout for image processing
client = genai.Client(
    api_key=GOOGLE_API_KEY,
    http_options={"timeout": 120000},  # 120 seconds timeout
)

# Model to use - using stable 2.5 Flash for reliability
GEMINI_MODEL = "gemini-2.5-pro"

# Store analyzed styles for reference
_analyzed_styles: dict[str, dict] = {}


@tool
def analyze_business_dna() -> dict:
    """
    Analyze ALL uploaded design images to extract PIXEL-PERFECT "Business DNA".
    
    This tool examines all uploaded reference images together to extract:
    1. EXACT colors (hex codes) for every UI element
    2. EXACT dimensions (header height, sidebar width in pixels)
    3. EXACT typography (font sizes, weights, line heights)
    4. EXACT effects (shadows, glows, borders with precise values)
    5. Component templates (header, navbar, layout) as reusable JSX
    
    CALL THIS FIRST when a user uploads design reference images!
    
    The extracted DNA ensures generated screens look IDENTICAL to the
    uploaded designs - same header, same navbar, same colors everywhere.
    
    Returns:
        dict containing:
        - success: Whether analysis succeeded
        - image_count: Number of images analyzed
        - business_dna: Pixel-perfect design tokens
        - templates_generated: Whether component templates were created
    """
    try:
        # Get ALL images from state
        images = get_all_images_from_state()
        
        if not images:
            return {
                "success": False,
                "error": "No images found. Please upload design reference images first.",
            }
        
        print(f"  🧬 [PIXEL-PERFECT DNA] Analyzing {len(images)} images for exact extraction...")
        
        # Build content parts with all images
        parts = []
        for i, (img_bytes, mime_type) in enumerate(images):
            print(f"      Processing image {i+1}: {len(img_bytes)} bytes")
            parts.append(types.Part.from_bytes(data=img_bytes, mime_type=mime_type or "image/jpeg"))
        
        # PIXEL-PERFECT EXTRACTION PROMPT - ENHANCED FOR GRANULAR EXTRACTION
        analysis_prompt = """You are an expert UI designer extracting PIXEL-PERFECT design specifications.

Analyze ALL provided images as a SINGLE app design system. Extract EXACT values - not approximations.
Sample colors DIRECTLY from the pixels. Do not guess or use defaults.

Return a STRICT JSON with these EXACT specifications:

{
    "colors": {
        "header_bg": "#EXACT_HEX - header background color",
        "sidebar_bg": "#EXACT_HEX - sidebar/navbar background",
        "content_bg": "#EXACT_HEX - main content area background",
        "card_bg": "#EXACT_HEX - card/panel background",
        "primary_accent": "#EXACT_HEX - main accent color (buttons, active states) - usually BLUE",
        "primary_accent_glow": "#EXACT_HEX with alpha - glow effect color (e.g., #4263EB33)",
        "secondary_accent": "#EXACT_HEX - secondary accent if present",
        "danger_accent": "#EXACT_HEX - red/danger color for destructive actions or warnings",
        "danger_accent_gradient": "linear-gradient(...) if gradient visible on danger buttons",
        "success_accent": "#EXACT_HEX - green/success color",
        "text_primary": "#EXACT_HEX - main text color (usually white on dark)",
        "text_secondary": "#EXACT_HEX - secondary/muted text",
        "text_label": "#EXACT_HEX - label/caption text",
        "border_default": "#EXACT_HEX - default border color",
        "border_active": "#EXACT_HEX - active/focused border",
        "icon_default": "#EXACT_HEX - default icon color",
        "icon_active": "#EXACT_HEX - active icon color"
    },
    "dimensions": {
        "header_height": "64px or exact value",
        "sidebar_width": "72px or 280px - exact value",
        "content_max_width": "1280px or exact value",
        "content_padding": "32px or exact value",
        "card_padding": "24px or exact value",
        "card_border_radius": "8px or exact value",
        "button_border_radius": "6px or exact value",
        "input_border_radius": "6px or exact value",
        "button_padding_x": "16px",
        "button_padding_y": "8px",
        "input_height": "40px",
        "avatar_size": "32px",
        "icon_size_sm": "16px",
        "icon_size_md": "20px",
        "icon_size_lg": "24px"
    },
    "typography": {
        "font_family": "Inter or exact font name",
        "font_family_mono": "JetBrains Mono or exact",
        "heading_1_size": "32px",
        "heading_1_weight": "700",
        "heading_2_size": "24px",
        "heading_2_weight": "600",
        "heading_3_size": "18px",
        "heading_3_weight": "600",
        "body_size": "14px",
        "body_weight": "400",
        "body_line_height": "1.5",
        "label_size": "12px",
        "label_weight": "500",
        "label_transform": "uppercase or none",
        "button_size": "14px",
        "button_weight": "500"
    },
    "effects": {
        "card_shadow": "0 1px 3px rgba(0,0,0,0.3) or exact CSS shadow",
        "card_border": "1px solid #HEX or none",
        "button_shadow": "none or exact CSS shadow",
        "active_glow": "0 0 20px rgba(66,99,235,0.3) - blue glow for active tabs",
        "active_border_bottom": "2px solid #4263EB - active tab indicator at bottom",
        "active_border_top": "none or 2px solid #HEX if indicator at top",
        "hover_bg_change": "#HEX - background on hover",
        "focus_ring": "2px solid #HEX - focus outline",
        "header_drop_shadow": "0 4px 12px rgba(0,0,0,0.5) - shadow BELOW header separating it from content - IMPORTANT!",
        "section_divider_shadow": "inset shadow or border between sections if visible",
        "inset_shadow": "inset 0 1px 2px rgba(0,0,0,0.1) if visible on inputs/cards"
    },
    "button_variants": {
        "primary": {
            "bg": "#EXACT_HEX - primary button background (MUST be blue/accent like #4263EB or #3B5BDB)",
            "bg_hover": "#EXACT_HEX - slightly darker on hover",
            "text": "#FFFFFF or exact - text MUST be white on colored buttons",
            "border": "none or border style",
            "shadow": "none or shadow style",
            "gradient": "linear-gradient(...) if button has gradient"
        },
        "secondary": {
            "bg": "#EXACT_HEX - secondary button background (often transparent or dark gray)",
            "text": "#EXACT_HEX - secondary button text",
            "border": "1px solid #HEX - exact border color",
            "shadow": "none or shadow"
        },
        "ghost": {
            "bg": "transparent",
            "text": "#EXACT_HEX",
            "border": "none",
            "hover_bg": "#EXACT_HEX with low opacity"
        },
        "outline": {
            "bg": "transparent",
            "text": "#EXACT_HEX",
            "border": "1px solid #HEX"
        },
        "danger": {
            "bg": "#EXACT_HEX - red/danger button background (e.g., #DC2626 or #EF4444)",
            "bg_gradient": "linear-gradient(135deg, #DC2626, #B91C1C) - if gradient visible",
            "text": "#FFFFFF",
            "border": "none",
            "shadow": "0 4px 14px rgba(220,38,38,0.4) - if glow/shadow visible"
        },
        "success": {
            "bg": "#EXACT_HEX - green/success button background",
            "text": "#FFFFFF",
            "border": "none"
        },
        "add_button": {
            "bg": "#EXACT_HEX - lighter gray for add/create buttons",
            "text": "#EXACT_HEX",
            "border": "1px dashed #HEX - EXACT border style (dashed/dotted/solid)",
            "border_style": "dashed or dotted or solid",
            "icon": "plus icon style"
        },
        "icon_button": {
            "bg": "transparent or #EXACT_HEX",
            "text": "#EXACT_HEX",
            "hover_bg": "#EXACT_HEX",
            "size": "32px or 40px"
        }
    },
    "header": {
        "exists": true,
        "position": "fixed or sticky",
        "bg_color": "#EXACT_HEX",
        "border_bottom": "1px solid #HEX or none",
        "drop_shadow": "0 4px 12px rgba(0,0,0,0.5) - shadow below header - CRITICAL for visual separation",
        "logo_position": "left",
        "logo_text": "exact logo text if visible",
        "logo_bg_color": "#EXACT_HEX - background of logo container if present",
        "logo_icon_color": "#EXACT_HEX",
        "has_notifications": true,
        "notification_badge_color": "#EXACT_HEX - red badge color",
        "notification_badge_position": "top-right of bell icon",
        "has_settings": true,
        "has_user_menu": true,
        "user_avatar_bg": "#EXACT_HEX - avatar background color (often purple like #7C3AED)",
        "user_avatar_text": "#EXACT_HEX - avatar text/initials color",
        "user_avatar_ring": "ring-2 ring-#HEX if visible",
        "company_selector": true,
        "company_icon": "building or castle icon style"
    },
    "navbar": {
        "type": "horizontal_stepper or sidebar or tabs",
        "bg_color": "#EXACT_HEX",
        "item_bg_inactive": "#EXACT_HEX - background of inactive items",
        "item_bg_active": "#EXACT_HEX - background of active item (often blue like #3B5BDB)",
        "item_bg_completed": "#EXACT_HEX - background of completed items",
        "item_text_inactive": "#EXACT_HEX - text color of inactive items",
        "item_text_active": "#FFFFFF - text color of active item",
        "item_text_completed": "#EXACT_HEX - text color of completed items",
        "active_indicator_type": "background_fill or bottom_border or top_border or glow",
        "active_indicator_color": "#EXACT_HEX - color of the active indicator",
        "active_border_bottom": "2px solid #EXACT_HEX - EXACT border if present at bottom of active tab",
        "active_border_top": "none or 2px solid #EXACT_HEX",
        "active_glow": "shadow-[inset_0_0_12px_rgba(255,255,255,0.1)] - if glow visible",
        "has_checkmark_icon": true,
        "checkmark_color": "#EXACT_HEX",
        "item_padding": "px-3 py-2 or exact",
        "item_gap": "gap-[1px] or exact",
        "steps": ["STEP 1 NAME", "STEP 2 NAME", "etc - EXACT step names visible"]
    },
    "layout": {
        "structure": "header_top_with_content or sidebar_left or full_width",
        "main_bg": "#EXACT_HEX",
        "sidebar_exists": false,
        "sidebar_width": "0 or exact if exists",
        "content_layout": "grid or single_column or split",
        "grid_columns": "3 or 2 - typical grid columns",
        "section_gap": "32px or exact",
        "card_gap": "16px or exact"
    },
    "components": {
        "button_primary_bg": "#EXACT_HEX - MUST be the accent/brand color (BLUE like #4263EB or #3B5BDB), NEVER white",
        "button_primary_text": "#FFFFFF - MUST be white on blue buttons",
        "button_primary_hover": "#EXACT_HEX - darker shade on hover",
        "button_danger_bg": "#EXACT_HEX - red for danger buttons (e.g., #DC2626)",
        "button_danger_gradient": "linear-gradient(135deg, #DC2626, #B91C1C) if gradient",
        "button_danger_text": "#FFFFFF",
        "button_success_bg": "#EXACT_HEX - green for success",
        "button_secondary_bg": "#EXACT_HEX - usually darker gray or transparent",
        "button_secondary_text": "#EXACT_HEX - usually light gray",
        "button_secondary_border": "#EXACT_HEX - border color",
        "button_ghost_bg": "transparent",
        "button_ghost_text": "#EXACT_HEX",
        "button_ghost_hover_bg": "#EXACT_HEX with alpha - subtle highlight",
        "button_add_bg": "#EXACT_HEX - lighter shade for add/create buttons",
        "button_add_border": "1px dashed #HEX or 1px dotted #HEX - often DASHED for add buttons",
        "button_add_border_style": "dashed or dotted or solid",
        "button_add_text": "#EXACT_HEX",
        "input_bg": "#EXACT_HEX",
        "input_border": "#EXACT_HEX",
        "input_text": "#EXACT_HEX",
        "input_placeholder": "#EXACT_HEX",
        "select_bg": "#EXACT_HEX",
        "select_border": "#EXACT_HEX",
        "card_bg": "#EXACT_HEX",
        "card_border": "#EXACT_HEX or none",
        "card_shadow": "exact CSS shadow if visible",
        "badge_bg": "#EXACT_HEX",
        "badge_text": "#EXACT_HEX",
        "progress_bar_bg": "#EXACT_HEX - background track",
        "progress_bar_fill": "#EXACT_HEX - filled portion (often teal/cyan like #10B981)",
        "table_header_bg": "#EXACT_HEX",
        "table_row_hover": "#EXACT_HEX",
        "table_border": "#EXACT_HEX"
    },
    "accent_colors": {
        "primary_blue": "#EXACT_HEX - main blue accent (e.g., #4263EB, #3B5BDB)",
        "primary_blue_glow": "0 0 20px rgba(66,99,235,0.3)",
        "danger_red": "#EXACT_HEX - red for danger/destructive (e.g., #DC2626, #EF4444)",
        "danger_red_gradient": "linear-gradient(135deg, #DC2626, #B91C1C) if visible",
        "danger_red_glow": "0 4px 14px rgba(220,38,38,0.4) if visible",
        "success_green": "#EXACT_HEX - green for success (e.g., #10B981, #22C55E)",
        "warning_yellow": "#EXACT_HEX - yellow for warnings",
        "info_blue": "#EXACT_HEX - info/secondary blue",
        "purple_accent": "#EXACT_HEX - purple if used (e.g., #7C3AED for avatars)"
    },
    "brand": {
        "logo_text": "exact text",
        "logo_colors": ["#HEX1", "#HEX2"],
        "logo_bg_shape": "circle or rounded-square",
        "logo_bg_color": "#EXACT_HEX",
        "company_name_visible": "Company Name if visible",
        "tagline": "any visible tagline"
    }
}

CRITICAL INSTRUCTIONS - READ CAREFULLY:

1. **EXACT HEX CODES**: Sample colors DIRECTLY from the image pixels. Do not use generic colors.

2. **BUTTONS ARE CRITICAL**:
   - Primary action buttons (like "START ANALYSIS", "CREATE", "SUBMIT") MUST use the accent color (usually BLUE like #4263EB or #3B5BDB), NEVER white background
   - Button text on colored backgrounds MUST be white (#FFFFFF)
   - Danger buttons (red) often have gradients - capture the full gradient if visible
   - Add/Create buttons often have DASHED or DOTTED borders - note the exact border-style

3. **NAVBAR ACTIVE STATE IS CRITICAL**:
   - Active tab often has colored background (blue) or bottom border
   - If there's a bottom border on active tab, capture the exact color and width (e.g., "2px solid #4263EB")
   - If there's a glow effect, capture it

4. **SHADOWS ARE IMPORTANT**:
   - Header MUST have drop shadow separating it from content
   - Capture exact shadow values (e.g., "0 4px 12px rgba(0,0,0,0.5)")
   - Note any inset shadows on cards or inputs

5. **ACCENT COLORS**:
   - Capture ALL accent colors: blue, red/danger, green/success
   - If danger buttons have gradients (like "START ALL ANALYSIS"), capture the gradient

6. **DASHED/DOTTED BORDERS**:
   - Add buttons often have dashed or dotted borders
   - Capture the border-style explicitly (dashed, dotted, or solid)

7. Output must be valid JSON"""

        parts.append(types.Part.from_text(text=analysis_prompt))
        
        # Call Gemini with all images
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(role="user", parts=parts),
            ],
            config=types.GenerateContentConfig(
                temperature=0.1,  # Very low temperature for precise extraction
                max_output_tokens=8192,
            ),
        )
        
        analysis_text = response.text
        print(f"  🧬 [PIXEL-PERFECT DNA] Received analysis ({len(analysis_text)} chars)")
        
        # Parse the JSON response
        try:
            cleaned_text = analysis_text
            if "```json" in cleaned_text:
                cleaned_text = cleaned_text.split("```json")[1].split("```")[0]
            elif "```" in cleaned_text:
                cleaned_text = cleaned_text.split("```")[1].split("```")[0]
            
            business_dna = json.loads(cleaned_text.strip())
        except json.JSONDecodeError as e:
            print(f"  ⚠️ [PIXEL-PERFECT DNA] JSON parse failed: {e}")
            business_dna = {"raw_analysis": analysis_text}
        
        # Add metadata
        business_dna["_metadata"] = {
            "image_count": len(images),
            "model": GEMINI_MODEL,
            "extraction_type": "pixel_perfect",
        }
        
        # Store in tool state for automatic injection
        set_business_dna(business_dna)
        
        # Now generate component templates from the DNA
        print(f"  🎨 [PIXEL-PERFECT DNA] Generating component templates...")
        templates_result = _generate_component_templates_from_dna(business_dna, images)
        
        # Generate a human-readable summary
        summary = _generate_dna_summary(business_dna)
        
        print(f"  ✅ [PIXEL-PERFECT DNA] Extraction complete! DNA + templates stored.")
        
        return {
            "success": True,
            "image_count": len(images),
            "business_dna": business_dna,
            "summary": summary,
            "templates_generated": templates_result.get("success", False),
            "template_names": templates_result.get("templates", []),
            "message": f"Analyzed {len(images)} images with pixel-perfect extraction. Design DNA and component templates stored for all generations.",
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ [PIXEL-PERFECT DNA] Analysis failed: {error_msg}")
        return {
            "success": False,
            "error": f"Business DNA analysis failed: {error_msg}",
        }


@tool
def get_current_business_dna() -> dict:
    """
    Get the currently stored Business DNA.
    
    Use this to check what design DNA has been extracted from uploaded images.
    
    Returns:
        dict with the current Business DNA or message if not yet analyzed
    """
    dna = get_business_dna()
    if dna:
        return {
            "success": True,
            "has_business_dna": True,
            "business_dna": dna,
            "summary": _generate_dna_summary(dna),
        }
    return {
        "success": True,
        "has_business_dna": False,
        "message": "No Business DNA has been analyzed yet. Upload design reference images and call analyze_business_dna() first.",
    }


def _generate_dna_summary(dna: dict) -> str:
    """Generate a human-readable summary of the Business DNA."""
    parts = []
    
    if "colors" in dna:
        colors = dna["colors"]
        parts.append(f"🎨 Colors: Primary {colors.get('primary', 'N/A')}, Secondary {colors.get('secondary', 'N/A')}")
    
    if "typography" in dna:
        typo = dna["typography"]
        parts.append(f"📝 Typography: {typo.get('font_family', 'sans-serif')}, headings {typo.get('heading_weight', 'bold')}")
    
    if "components" in dna:
        comp = dna["components"]
        parts.append(f"🔲 Components: {comp.get('border_radius', 'rounded')}, {comp.get('shadow', 'shadow-md')}")
    
    if "layout_template" in dna:
        layout = dna["layout_template"]
        structure = layout.get('page_structure', 'unknown')
        sidebar_info = ""
        if layout.get('sidebar', {}).get('exists'):
            sidebar_info = f", sidebar {layout['sidebar'].get('position', 'left')}"
        parts.append(f"📐 Layout: {structure}{sidebar_info}")
    
    if "common_patterns" in dna:
        patterns = dna["common_patterns"]
        parts.append(f"🧩 Patterns: {patterns.get('card_layout', 'grid')} cards, {patterns.get('data_display', 'tables')} data")
    
    if "mood" in dna:
        mood = dna["mood"]
        parts.append(f"✨ Mood: {mood.get('overall', 'modern')} - {mood.get('feeling', '')}")
    
    return "\n".join(parts) if parts else "Design DNA extracted (see full details)"


def _generate_component_templates_from_dna(dna: dict, images: list) -> dict:
    """
    Generate pixel-perfect component templates (Header, Navbar, Layout) from DNA.
    
    This creates actual JSX code that can be injected into all generated screens
    to ensure the header and navbar look IDENTICAL everywhere.
    """
    try:
        if not images:
            return {"success": False, "error": "No images for template generation"}
        
        print(f"  🎨 [TEMPLATES] Generating component templates from DNA...")
        
        # Use the first image as the primary reference for templates
        img_bytes, mime_type = images[0]
        
        # Build the template generation prompt with DNA context
        template_prompt = f"""You are an expert React developer. Generate EXACT pixel-perfect React component code.

DESIGN DNA (use these EXACT values):
{json.dumps(dna, indent=2)}

Using the image and DNA above, generate THREE separate React components that can be REUSED across all screens:

1. **HeaderTemplate** - The EXACT header from the image:
   - Use exact colors from DNA (header_bg, text colors, etc.)
   - Include logo/brand (position, colors from DNA brand section)
   - Include notification bell with badge if present
   - Include settings icon if present
   - Include user avatar/menu (use avatar colors from DNA)
   - Include any company selector dropdown

2. **NavbarTemplate** - The EXACT navigation/stepper from the image:
   - Use exact colors from DNA (navbar section)
   - Include ALL step names from DNA (navbar.steps)
   - Include active state styling (glow, border, background from DNA)
   - Include completion checkmarks if present
   - Pass activeStep as a prop to highlight current step

3. **LayoutTemplate** - The shell that wraps content:
   - Use exact background colors from DNA
   - Include HeaderTemplate at top
   - Include NavbarTemplate below header
   - Include a {{children}} slot for page content
   - Use exact padding/spacing from DNA dimensions

Return as JSON with this structure:
{{
    "header_code": "// Full React component code for HeaderTemplate with exact Tailwind classes using DNA colors",
    "navbar_code": "// Full React component code for NavbarTemplate with activeStep prop",
    "layout_code": "// Full React component code for LayoutTemplate that uses Header and Navbar"
}}

CRITICAL RULES:
1. Use EXACT hex codes from DNA in Tailwind arbitrary values: bg-[#111318], text-[#F8F9FA]
2. Use EXACT dimensions: h-[64px], w-[72px], p-[32px]
3. Include ALL icons from lucide-react that are visible
4. The header and navbar must look IDENTICAL to the screenshot
5. Make components self-contained with all imports
6. Use TypeScript with proper types
7. Export each component as default"""

        # Call Gemini with the image
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=img_bytes, mime_type=mime_type or "image/jpeg"),
                        types.Part.from_text(text=template_prompt),
                    ],
                ),
            ],
            config=types.GenerateContentConfig(
                temperature=0.2,
                max_output_tokens=16384,
            ),
        )
        
        response_text = response.text
        print(f"  🎨 [TEMPLATES] Received template code ({len(response_text)} chars)")
        
        # Parse the JSON response
        try:
            cleaned_text = response_text
            if "```json" in cleaned_text:
                cleaned_text = cleaned_text.split("```json")[1].split("```")[0]
            elif "```" in cleaned_text:
                cleaned_text = cleaned_text.split("```")[1].split("```")[0]
            
            templates = json.loads(cleaned_text.strip())
        except json.JSONDecodeError as e:
            print(f"  ⚠️ [TEMPLATES] JSON parse failed, extracting code blocks: {e}")
            # Try to extract code blocks manually
            templates = _extract_code_blocks_from_response(response_text)
        
        if templates:
            # Store templates in tool state
            set_component_templates(templates)
            
            template_names = [k for k in templates.keys() if templates[k]]
            print(f"  ✅ [TEMPLATES] Generated {len(template_names)} templates: {', '.join(template_names)}")
            
            return {
                "success": True,
                "templates": template_names,
            }
        else:
            print(f"  ⚠️ [TEMPLATES] No templates could be extracted")
            return {"success": False, "error": "Failed to extract templates"}
        
    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ [TEMPLATES] Generation failed: {error_msg}")
        return {"success": False, "error": error_msg}


def _extract_code_blocks_from_response(text: str) -> dict:
    """Extract code blocks from response if JSON parsing fails."""
    templates = {}
    
    # Look for header code
    if "HeaderTemplate" in text or "header_code" in text:
        # Try to find the code block
        import re
        header_match = re.search(r'header_code["\s:]+[`\'"]*(.*?)[`\'"]*(?=,\s*["\']navbar|$)', text, re.DOTALL)
        if header_match:
            templates["header_code"] = header_match.group(1).strip()
    
    # Look for navbar code
    if "NavbarTemplate" in text or "navbar_code" in text:
        navbar_match = re.search(r'navbar_code["\s:]+[`\'"]*(.*?)[`\'"]*(?=,\s*["\']layout|$)', text, re.DOTALL)
        if navbar_match:
            templates["navbar_code"] = navbar_match.group(1).strip()
    
    # Look for layout code  
    if "LayoutTemplate" in text or "layout_code" in text:
        layout_match = re.search(r'layout_code["\s:]+[`\'"]*(.*?)[`\'"]*(?=\s*}|$)', text, re.DOTALL)
        if layout_match:
            templates["layout_code"] = layout_match.group(1).strip()
    
    return templates


def get_business_dna_for_prompt() -> str:
    """
    Get the Business DNA formatted for injection into generation prompts.
    
    This is called internally by code_generator.py to inject style context.
    """
    dna = get_business_dna()
    if not dna:
        return ""
    
    # Format as a clear style guide for the LLM
    prompt_parts = ["\n\n=== BUSINESS DNA (Apply this design system!) ===\n"]
    
    if "colors" in dna:
        prompt_parts.append("COLOR PALETTE (use these EXACT hex codes):")
        for name, value in dna["colors"].items():
            if isinstance(value, str):
                prompt_parts.append(f"  - {name}: {value}")
    
    if "typography" in dna:
        prompt_parts.append("\nTYPOGRAPHY:")
        typo = dna["typography"]
        prompt_parts.append(f"  - Font: {typo.get('font_family', 'sans-serif')}")
        prompt_parts.append(f"  - Heading weight: {typo.get('heading_weight', 'bold')}")
        if "heading_sizes" in typo:
            for level, size in typo["heading_sizes"].items():
                prompt_parts.append(f"  - {level}: {size}")
    
    if "spacing" in dna:
        prompt_parts.append("\nSPACING:")
        spacing = dna["spacing"]
        for name, value in spacing.items():
            prompt_parts.append(f"  - {name}: {value}")
    
    if "components" in dna:
        prompt_parts.append("\nCOMPONENT STYLING:")
        comp = dna["components"]
        for name, value in comp.items():
            prompt_parts.append(f"  - {name}: {value}")
    
    if "mood" in dna:
        prompt_parts.append(f"\nDESIGN MOOD: {dna['mood'].get('overall', '')} - {dna['mood'].get('feeling', '')}")
    
    prompt_parts.append("\n=== END BUSINESS DNA ===\n")
    
    return "\n".join(prompt_parts)


@tool
def analyze_design_style(
    image_name: Optional[str] = None,
    analysis_focus: str = "comprehensive",
) -> dict:
    """
    Analyze an uploaded design image to extract its visual style characteristics.
    
    This tool uses Gemini 3 Pro's vision capabilities to understand colors, typography,
    layout patterns, and overall design language from uploaded design assets.
    
    The image is automatically extracted from the user's message - you don't need
    to pass the image data, just call this tool.
    
    Args:
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
        # Get image from tool state (extracted by middleware)
        image_bytes, media_type = get_image_from_state()
        
        if not image_bytes:
            return {
                "error": "No image found. Please upload an image first.",
            }
        
        print(f"  🎨 [ANALYZE_STYLE] Processing image: {len(image_bytes)} bytes, mime: {media_type}")
        
        # Analyze with Gemini 3 Pro Vision
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=image_bytes, mime_type=media_type or "image/jpeg"),
                        types.Part.from_text(text=analysis_prompt),
                    ],
                ),
            ],
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=4096,
            ),
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
            "model_used": GEMINI_MODEL,
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
            model=GEMINI_MODEL,
            contents=comparison_prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=4096,
            ),
        )
        
        return {
            "success": True,
            "style_1": style_id_1,
            "style_2": style_id_2,
            "comparison": response.text,
            "model_used": GEMINI_MODEL,
        }
        
    except Exception as e:
        return {
            "error": f"Comparison failed: {str(e)}",
        }
