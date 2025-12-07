"""Image-to-Code Generator Tool using Gemini 3 Pro Vision API."""

import base64
import json
import urllib.request
import urllib.error
import time
from typing import Optional

from langchain_core.tools import tool
from google import genai
from google.genai import types

from app.config import GOOGLE_API_KEY
from app.tools.tool_state import (
    get_image_from_state, 
    get_all_images_from_state, 
    has_business_dna, 
    get_business_dna,
    has_component_templates,
    get_component_templates,
    get_template,
)


def log_progress(tool_name: str, step: str, details: str = ""):
    """Log progress for tool execution - helps with debugging and UX."""
    timestamp = time.strftime("%H:%M:%S")
    if details:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}: {details}")
    else:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}")

# Frontend sandbox API URL
SANDBOX_API_URL = "http://localhost:3000/api/generate"


def save_to_sandbox(code: str, name: str, prompt: str = "", thread_id: Optional[str] = None) -> dict:
    """Save generated code to the frontend sandbox."""
    try:
        data = {
            "code": code,
            "name": name,
            "prompt": prompt,
        }
        # Add threadId if provided
        if thread_id:
            data["threadId"] = thread_id
        
        req_data = json.dumps(data).encode('utf-8')
        
        req = urllib.request.Request(
            SANDBOX_API_URL,
            data=req_data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except urllib.error.URLError as e:
        print(f"  ⚠️ [SANDBOX] Could not save to sandbox: {e}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        print(f"  ⚠️ [SANDBOX] Error saving to sandbox: {e}")
        return {"success": False, "error": str(e)}


def update_component_in_sandbox(code: str, component_id: str, name: Optional[str] = None, prompt: Optional[str] = None) -> dict:
    """Update an existing component in the frontend sandbox."""
    try:
        data = {"code": code}
        if name:
            data["name"] = name
        if prompt is not None:
            data["prompt"] = prompt
        
        url = f"{SANDBOX_API_URL}?id={component_id}"
        req_data = json.dumps(data).encode('utf-8')
        
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={'Content-Type': 'application/json'},
            method='PUT'
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result
    except urllib.error.URLError as e:
        print(f"  ⚠️ [SANDBOX] Could not update component in sandbox: {e}")
        return {"success": False, "error": str(e)}
    except Exception as e:
        print(f"  ⚠️ [SANDBOX] Error updating component in sandbox: {e}")
        return {"success": False, "error": str(e)}


def get_existing_component_code(component_id: Optional[str] = None, filename: Optional[str] = None) -> Optional[str]:
    """
    Load code from an existing component in the frontend sandbox.
    
    Args:
        component_id: The component ID to load (takes precedence)
        filename: The filename to search for (used if component_id not provided)
    
    Returns:
        The component code as a string, or None if not found
    """
    try:
        if component_id:
            url = f"{SANDBOX_API_URL}?id={component_id}&withCode=true"
        elif filename:
            # First, get all components and find the one with matching filename
            url = f"{SANDBOX_API_URL}?withCode=true"
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req, timeout=10) as response:
                result = json.loads(response.read().decode('utf-8'))
                components = result.get('components', [])
                matching = next((c for c in components if c.get('filename') == filename), None)
                if matching:
                    return matching.get('code')
            return None
        else:
            return None
        
        req = urllib.request.Request(url, method='GET')
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('code')
    except urllib.error.URLError as e:
        print(f"  ⚠️ [SANDBOX] Could not load component from sandbox: {e}")
        return None
    except Exception as e:
        print(f"  ⚠️ [SANDBOX] Error loading component from sandbox: {e}")
        return None


# Initialize Gemini client with extended timeout for image processing
client = genai.Client(
    api_key=GOOGLE_API_KEY,
    http_options={"timeout": 120000},  # 120 seconds timeout
)

# Model to use for code generation
GEMINI_MODEL = "gemini-2.5-pro"

# Store generated code for reference
_generated_code: dict[str, dict] = {}


def _format_business_dna_for_prompt(dna: dict) -> str:
    """
    Format Business DNA into a clear prompt section for code generation.
    
    This is automatically injected into generate_screen prompts when
    Business DNA has been analyzed from uploaded design references.
    
    Includes: colors, typography, spacing, components, layout templates, and UI patterns.
    """
    if not dna:
        return ""
    
    parts = ["\n\n=== 🧬 BUSINESS DNA - APPLY THIS DESIGN SYSTEM! ===\n"]
    parts.append("You MUST use these exact design specifications from the uploaded reference images:\n")
    
    if "colors" in dna:
        parts.append("\n📎 COLOR PALETTE (use these EXACT hex codes in Tailwind):")
        colors = dna["colors"]
        for name, value in colors.items():
            if isinstance(value, str) and value.startswith("#"):
                parts.append(f"  - {name}: {value} → use bg-[{value}], text-[{value}], border-[{value}]")
    
    # === CRITICAL COLOR RULES - MOST IMPORTANT SECTION ===
    parts.append("\n\n🚨 CRITICAL COLOR RULES - MUST FOLLOW EXACTLY 🚨")
    parts.append("=" * 60)
    
    # Button color rules
    if "button_variants" in dna:
        bv = dna["button_variants"]
        parts.append("\n🔵 PRIMARY BUTTONS (action buttons like 'Start', 'Create', 'Submit'):")
        if "primary" in bv and isinstance(bv["primary"], dict):
            primary = bv["primary"]
            bg = primary.get("bg", dna.get("colors", {}).get("primary_accent", "#4263EB"))
            parts.append(f"   → Background: bg-[{bg}] - MUST be blue/accent, NEVER white!")
            parts.append(f"   → Text: text-white - ALWAYS white on colored buttons!")
            if primary.get("gradient"):
                parts.append(f"   → Gradient: {primary['gradient']}")
        
        parts.append("\n🔴 DANGER BUTTONS (destructive actions, 'START ALL ANALYSIS' style):")
        if "danger" in bv and isinstance(bv["danger"], dict):
            danger = bv["danger"]
            bg = danger.get("bg", "#DC2626")
            parts.append(f"   → Background: bg-[{bg}]")
            if danger.get("bg_gradient"):
                parts.append(f"   → Gradient: bg-gradient-to-r {danger['bg_gradient']}")
            parts.append(f"   → Text: text-white")
            if danger.get("shadow"):
                parts.append(f"   → Shadow/Glow: {danger['shadow']}")
        
        parts.append("\n➕ ADD/CREATE BUTTONS (often have dashed borders):")
        if "add_button" in bv and isinstance(bv["add_button"], dict):
            add_btn = bv["add_button"]
            parts.append(f"   → Background: bg-[{add_btn.get('bg', '#1A1A1F')}]")
            parts.append(f"   → Border: border {add_btn.get('border_style', 'dashed')} border-[{add_btn.get('border', '#3F3F46').replace('1px dashed ', '').replace('1px dotted ', '')}]")
            parts.append(f"   → Text: text-[{add_btn.get('text', '#9CA3AF')}]")
    
    # Use components section for button colors if button_variants not present
    elif "components" in dna:
        comp = dna["components"]
        parts.append("\n🔵 PRIMARY BUTTONS:")
        if comp.get("button_primary_bg"):
            parts.append(f"   → Background: bg-[{comp['button_primary_bg']}] - MUST be this color, NEVER white!")
        parts.append(f"   → Text: text-[{comp.get('button_primary_text', '#FFFFFF')}] - MUST be white on colored buttons!")
        
        if comp.get("button_danger_bg"):
            parts.append("\n🔴 DANGER BUTTONS:")
            parts.append(f"   → Background: bg-[{comp['button_danger_bg']}]")
            if comp.get("button_danger_gradient"):
                parts.append(f"   → Gradient: {comp['button_danger_gradient']}")
        
        if comp.get("button_add_bg"):
            parts.append("\n➕ ADD/CREATE BUTTONS:")
            parts.append(f"   → Background: bg-[{comp['button_add_bg']}]")
            border_style = comp.get("button_add_border_style", "dashed")
            parts.append(f"   → Border: border-{border_style} border-[{comp.get('button_add_border', '#3F3F46').replace('1px dashed ', '').replace('1px dotted ', '').replace('1px solid ', '')}]")
    
    # Navbar active state rules
    if "navbar" in dna:
        navbar = dna["navbar"]
        parts.append("\n📍 NAVBAR ACTIVE STATE (CRITICAL for visual consistency):")
        if navbar.get("item_bg_active"):
            parts.append(f"   → Active item background: bg-[{navbar['item_bg_active']}]")
        if navbar.get("item_text_active"):
            parts.append(f"   → Active item text: text-[{navbar['item_text_active']}]")
        if navbar.get("active_border_bottom") and navbar["active_border_bottom"] != "none":
            parts.append(f"   → Active indicator (bottom border): {navbar['active_border_bottom']}")
            parts.append(f"   → Use: border-b-2 border-[#...] on active tab")
        if navbar.get("active_glow"):
            parts.append(f"   → Active glow effect: {navbar['active_glow']}")
    
    # Shadow rules
    if "effects" in dna:
        effects = dna["effects"]
        parts.append("\n🌑 SHADOWS (important for depth and visual hierarchy):")
        if effects.get("header_drop_shadow"):
            parts.append(f"   → Header shadow: shadow-[{effects['header_drop_shadow']}]")
            parts.append(f"   → MUST add shadow below header to separate from content!")
        if effects.get("card_shadow"):
            parts.append(f"   → Card shadow: shadow-[{effects['card_shadow']}]")
    
    # Header rules
    if "header" in dna:
        header = dna["header"]
        parts.append("\n🔝 HEADER STYLING:")
        if header.get("drop_shadow"):
            parts.append(f"   → Drop shadow: {header['drop_shadow']}")
            parts.append(f"   → Add shadow-[0_4px_12px_rgba(0,0,0,0.5)] or similar!")
        if header.get("notification_badge_color"):
            parts.append(f"   → Notification badge: bg-[{header['notification_badge_color']}]")
        if header.get("user_avatar_bg"):
            parts.append(f"   → Avatar background: bg-[{header['user_avatar_bg']}]")
    
    # Accent colors summary
    if "accent_colors" in dna:
        ac = dna["accent_colors"]
        parts.append("\n🎨 ACCENT COLOR QUICK REFERENCE:")
        if ac.get("primary_blue"):
            parts.append(f"   → Primary (buttons, active): {ac['primary_blue']}")
        if ac.get("danger_red"):
            parts.append(f"   → Danger (destructive actions): {ac['danger_red']}")
        if ac.get("success_green"):
            parts.append(f"   → Success (confirmations): {ac['success_green']}")
        if ac.get("purple_accent"):
            parts.append(f"   → Purple (avatars, badges): {ac['purple_accent']}")
    
    parts.append("\n" + "=" * 60)
    parts.append("END CRITICAL COLOR RULES\n")
    
    if "typography" in dna:
        parts.append("\n📝 TYPOGRAPHY:")
        typo = dna["typography"]
        if "font_family" in typo:
            parts.append(f"  - Font family: {typo['font_family']}")
        if "heading_weight" in typo:
            parts.append(f"  - Heading weight: {typo['heading_weight']}")
        if "body_weight" in typo:
            parts.append(f"  - Body weight: {typo['body_weight']}")
        if "heading_sizes" in typo:
            parts.append("  - Heading sizes:")
            for level, size in typo["heading_sizes"].items():
                parts.append(f"      {level}: {size}")
        if "body_size" in typo:
            parts.append(f"  - Body size: {typo['body_size']}")
    
    if "spacing" in dna:
        parts.append("\n📏 SPACING:")
        spacing = dna["spacing"]
        for name, value in spacing.items():
            parts.append(f"  - {name.replace('_', ' ').title()}: {value}")
    
    if "components" in dna:
        parts.append("\n🔲 COMPONENT STYLING:")
        comp = dna["components"]
        for name, value in comp.items():
            parts.append(f"  - {name.replace('_', ' ').title()}: {value}")
    
    # === Layout Template ===
    if "layout_template" in dna:
        parts.append("\n📐 LAYOUT TEMPLATE (CRITICAL - follow this structure!):")
        layout = dna["layout_template"]
        if "page_structure" in layout:
            parts.append(f"  - Page structure: {layout['page_structure']}")
        
        if "sidebar" in layout and isinstance(layout["sidebar"], dict):
            sidebar = layout["sidebar"]
            if sidebar.get("exists"):
                parts.append(f"  - SIDEBAR: {sidebar.get('position', 'left')} side, width {sidebar.get('width', 'w-64')}, {sidebar.get('style', 'dark')} style")
                if sidebar.get("has_logo"):
                    parts.append("    • Include logo/branding at top of sidebar")
                if sidebar.get("has_nav_items"):
                    parts.append("    • Include navigation menu items")
            else:
                parts.append("  - SIDEBAR: None (no sidebar in this design)")
        
        if "header" in layout and isinstance(layout["header"], dict):
            header = layout["header"]
            if header.get("exists"):
                parts.append(f"  - HEADER: height {header.get('height', 'h-16')}, position {header.get('style', 'sticky')}")
                features = []
                if header.get("has_breadcrumbs"):
                    features.append("breadcrumbs")
                if header.get("has_search"):
                    features.append("search bar")
                if header.get("has_user_menu"):
                    features.append("user menu/avatar")
                if features:
                    parts.append(f"    • Header should include: {', '.join(features)}")
        
        if "content_area" in layout and isinstance(layout["content_area"], dict):
            content = layout["content_area"]
            parts.append(f"  - CONTENT AREA: max-width {content.get('max_width', 'max-w-7xl')}, padding {content.get('padding', 'p-6')}")
    
    # === Common Patterns ===
    if "common_patterns" in dna:
        parts.append("\n🧩 COMMON UI PATTERNS (use these patterns!):")
        patterns = dna["common_patterns"]
        pattern_map = {
            "card_layout": "Card arrangement",
            "grid_columns": "Grid columns",
            "table_style": "Table style",
            "form_layout": "Form layout",
            "section_headers": "Section headers",
            "empty_states": "Empty states",
            "loading_states": "Loading states"
        }
        for key, label in pattern_map.items():
            if key in patterns and patterns[key]:
                parts.append(f"  - {label}: {patterns[key]}")
    
    # === UI Patterns ===
    if "ui_patterns" in dna:
        parts.append("\n🎯 UI ELEMENT PATTERNS:")
        ui = dna["ui_patterns"]
        ui_map = {
            "navigation_style": "Navigation style",
            "data_display": "Data display method",
            "action_placement": "Action button placement",
            "status_indicators": "Status indicators",
            "icon_style": "Icon style"
        }
        for key, label in ui_map.items():
            if key in ui and ui[key]:
                parts.append(f"  - {label}: {ui[key]}")
    
    if "mood" in dna:
        parts.append("\n✨ DESIGN MOOD:")
        mood = dna["mood"]
        if "overall" in mood:
            parts.append(f"  - Overall style: {mood['overall']}")
        if "feeling" in mood:
            parts.append(f"  - Feeling: {mood['feeling']}")
    
    parts.append("\n=== END BUSINESS DNA ===\n")
    
    # === COMPONENT TEMPLATES (if available) ===
    if has_component_templates():
        templates = get_component_templates()
        parts.append("\n=== 🎨 COMPONENT TEMPLATES - USE THESE EXACT COMPONENTS! ===\n")
        parts.append("These templates are extracted from the uploaded designs. USE THEM EXACTLY.\n")
        
        if templates.get("header_code"):
            parts.append("### HEADER TEMPLATE (include this EXACTLY in your component):")
            parts.append("```tsx")
            parts.append(templates["header_code"])
            parts.append("```\n")
        
        if templates.get("navbar_code"):
            parts.append("### NAVBAR TEMPLATE (include this EXACTLY, pass activeStep prop):")
            parts.append("```tsx")
            parts.append(templates["navbar_code"])
            parts.append("```\n")
        
        if templates.get("layout_code"):
            parts.append("### LAYOUT WRAPPER (your content goes in the {children} slot):")
            parts.append("```tsx")
            parts.append(templates["layout_code"])
            parts.append("```\n")
        
        parts.append("=== END COMPONENT TEMPLATES ===\n")
        parts.append("CRITICAL: Your generated screen MUST:")
        parts.append("1. Use the EXACT HeaderTemplate code - don't modify it")
        parts.append("2. Use the EXACT NavbarTemplate code - only change activeStep prop")
        parts.append("3. Put your screen content inside the LayoutTemplate")
        parts.append("4. The header and navbar must look IDENTICAL to the reference images\n")
    
    parts.append("CRITICAL INSTRUCTIONS:")
    parts.append("1. Use the EXACT hex color codes provided, not generic Tailwind colors")
    parts.append("2. Follow the LAYOUT TEMPLATE structure exactly (sidebar position, header style, etc.)")
    parts.append("3. Apply the UI PATTERNS consistently (card layouts, navigation style, etc.)")
    if has_component_templates():
        parts.append("4. USE THE COMPONENT TEMPLATES EXACTLY - they ensure visual consistency\n")
    else:
        parts.append("\n")
    
    return "\n".join(parts)


# Available shadcn/ui components - KEEP IN SYNC WITH frontend validation
AVAILABLE_SHADCN_COMPONENTS = """
AVAILABLE shadcn/ui COMPONENTS (ONLY use these - others will cause build errors!):
- Button (from @/components/ui/button)
- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter (from @/components/ui/card)
- Input (from @/components/ui/input)
- Textarea (from @/components/ui/textarea)
- Label (from @/components/ui/label)
- Checkbox (from @/components/ui/checkbox)
- Switch (from @/components/ui/switch)
- Slider (from @/components/ui/slider)
- Select, SelectTrigger, SelectContent, SelectItem, SelectValue (from @/components/ui/select)
- Badge (from @/components/ui/badge)
- Avatar, AvatarImage, AvatarFallback (from @/components/ui/avatar)
- Progress (from @/components/ui/progress)
- Skeleton (from @/components/ui/skeleton)
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell (from @/components/ui/table)
- Tabs, TabsList, TabsTrigger, TabsContent (from @/components/ui/tabs)
- Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription (from @/components/ui/dialog)
- DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem (from @/components/ui/dropdown-menu)
- Tooltip, TooltipTrigger, TooltipContent, TooltipProvider (from @/components/ui/tooltip)
- HoverCard, HoverCardTrigger, HoverCardContent (from @/components/ui/hover-card)
- ScrollArea (from @/components/ui/scroll-area)
- Separator (from @/components/ui/separator)
- Alert, AlertTitle, AlertDescription (from @/components/ui/alert)

⚠️ DO NOT USE these components (not installed, will cause build errors):
- Collapsible, Accordion, Command, Popover, Sheet, Toast, Toaster, Menubar, NavigationMenu
- RadioGroup, Form, Calendar, DatePicker, Combobox, Carousel, Drawer, Resizable
"""

# System prompt for code generation
CODE_GENERATION_SYSTEM_PROMPT = f"""You are an expert frontend developer specializing in React, Tailwind CSS, and shadcn/ui components.

Your task is to convert UI screenshots into pixel-perfect React code. Follow these rules:

1. **Accuracy**: Replicate the UI as closely as possible - same layout, colors, spacing, typography
2. **Technology Stack**:
   - React functional components with TypeScript
   - Tailwind CSS for all styling (no inline styles or CSS files)
   - shadcn/ui components where applicable (Button, Card, Input, Badge, etc.)
3. **Code Quality**:
   - Clean, readable code with proper indentation
   - Semantic HTML elements
   - Responsive considerations where obvious
4. **Color Matching**: Extract exact colors from the image and use them (hex codes in Tailwind arbitrary values like `bg-[#1a1a2e]`)
5. **Typography**: Match font sizes, weights, and spacing precisely
6. **Layout**: Use Flexbox/Grid appropriately, match padding/margins exactly
7. **CRITICAL - JSX Syntax**: 
   - In JSX text content, special characters like `>` and `<` MUST be escaped
   - Use `{{'>'}}` or `&gt;` instead of `>` in text content
   - Use `{{'<'}}` or `&lt;` instead of `<` in text content
   - Example: `<div>{{'>'}} Connecting...</div>` NOT `<div>> Connecting...</div>`
   - This prevents parsing errors and ensures the code compiles correctly
{AVAILABLE_SHADCN_COMPONENTS}
The code should be complete and runnable with a default export."""

# Structured output schema for code generation
CODE_OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "code": {
            "type": "string",
            "description": "The complete React + Tailwind component code. Must include imports and default export."
        },
        "component_name": {
            "type": "string", 
            "description": "The name of the main exported component"
        },
        "description": {
            "type": "string",
            "description": "Brief 1-2 sentence description of what the component renders"
        }
    },
    "required": ["code", "component_name", "description"]
}


@tool
def image_to_code(
    component_name: str = "GeneratedUI",
    image_index: int = 0,
    additional_instructions: Optional[str] = None,
) -> dict:
    """
    Convert an uploaded UI screenshot into React + Tailwind CSS code.
    
    This tool uses Gemini 3 Pro's vision capabilities to analyze a UI screenshot
    and generate pixel-perfect React code that replicates the design.
    
    The images are automatically extracted from the user's message - you just need
    to specify which image to convert using the image_index parameter.
    
    Args:
        component_name: Name for the generated React component (default: "GeneratedUI")
        image_index: Which image to convert (0-based index). If user uploaded 15 images,
                    use 0-14. Default is 0 (first image). Use this to select a specific
                    image like "image 10" by passing image_index=9.
        additional_instructions: Optional extra instructions for code generation,
                                e.g., "Make it responsive" or "Use dark theme"
    
    Returns:
        dict containing:
        - code: The generated React + Tailwind code
        - component_name: Name of the component
        - success: Boolean indicating if generation succeeded
        - image_used: Which image index was used
    """
    try:
        log_progress("IMAGE_TO_CODE", "Starting", f"Component: {component_name}, Image index: {image_index}")
        
        # Get ALL images from tool state (extracted by middleware)
        log_progress("IMAGE_TO_CODE", "Step 1/4", "Loading images from state")
        all_images = get_all_images_from_state()
        
        if not all_images:
            return {
                "success": False,
                "error": "No images found. Please upload an image first.",
                "component_name": component_name,
            }
        
        # Validate image_index
        if image_index < 0 or image_index >= len(all_images):
            return {
                "success": False,
                "error": f"Invalid image_index {image_index}. You uploaded {len(all_images)} images (use index 0-{len(all_images)-1}).",
                "component_name": component_name,
                "available_images": len(all_images),
            }
        
        # Get the specific image by index
        image_bytes, image_mime = all_images[image_index]
        log_progress("IMAGE_TO_CODE", "Step 2/4", f"Using image {image_index+1} of {len(all_images)}: {len(image_bytes)} bytes, {image_mime}")
        
        # Check for Business DNA to apply design system
        business_dna_context = ""
        if has_business_dna():
            dna = get_business_dna()
            log_progress("IMAGE_TO_CODE", "Step 2.5/4", "🧬 Business DNA detected! Applying design system...")
            business_dna_context = _format_business_dna_for_prompt(dna)
        
        # Build the prompt
        user_prompt = f"""{CODE_GENERATION_SYSTEM_PROMPT}

Analyze this UI screenshot and convert it to a React component named "{component_name}".

Generate complete, runnable React + Tailwind CSS code that replicates this UI exactly.
{business_dna_context}
Requirements:
- Use TypeScript
- Use Tailwind CSS for ALL styling
- Match colors, spacing, and layout precisely
- Use shadcn/ui components where appropriate (Button, Card, Input, Badge, Tabs, etc.)
- Include all visible text content
- Make interactive elements look clickable"""

        if additional_instructions:
            user_prompt += f"\n\nAdditional instructions: {additional_instructions}"

        user_prompt += "\n\nReturn the code in the structured JSON format specified."

        log_progress("IMAGE_TO_CODE", "Step 3/4", "Calling Gemini Vision API...")
        
        # Call Gemini 3 Pro Vision with structured output
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=image_bytes, mime_type=image_mime or "image/jpeg"),
                        types.Part.from_text(text=user_prompt),
                    ],
                ),
            ],
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=16384,
                response_mime_type="application/json",
                response_schema=CODE_OUTPUT_SCHEMA,
            ),
        )
        
        log_progress("IMAGE_TO_CODE", "Step 4/4", "Processing response...")
        
        # Parse structured JSON output - clean and simple!
        result = json.loads(response.text)
        generated_code = result.get("code", "")
        component_name = result.get("component_name", component_name)

        # Store for reference
        code_id = f"code_{component_name}_{len(_generated_code)}"
        _generated_code[code_id] = {
            "code": generated_code,
            "component_name": component_name,
        }
        
        log_progress("IMAGE_TO_CODE", "Complete", f"Generated {len(generated_code)} chars of code")
        
        # Auto-save to sandbox
        log_progress("IMAGE_TO_CODE", "Saving", "Saving to sandbox...")
        sandbox_result = save_to_sandbox(generated_code, component_name, additional_instructions or "")
        
        # Always return the code so frontend can update sandbox immediately
        preview_url = "/preview"
        file_path = f"src/generated/components/{component_name}.tsx"
        
        if sandbox_result.get("success"):
            preview_url = sandbox_result.get("previewUrl", preview_url)
            file_path = sandbox_result.get("filePath", file_path)
            print(f"  📁 [SANDBOX] Saved to: {file_path}")
        else:
            print(f"  ⚠️ [SANDBOX] Save failed: {sandbox_result.get('error')}")
        
        return {
            "success": True,
            "code": generated_code,  # Frontend needs this to update sandbox!
            "component_name": component_name,
            "code_id": code_id,
            "preview_url": f"http://localhost:3000{preview_url}",
            "file_path": file_path,
            "model_used": GEMINI_MODEL,
            "image_used": image_index,
            "total_images": len(all_images),
            "ai_notes": f"Successfully converted image {image_index+1} of {len(all_images)} to {component_name} component with {len(generated_code)} characters of React + Tailwind code.",
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ [IMAGE_TO_CODE] Error: {error_msg}")
        
        if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
            return {
                "success": False,
                "error": "Rate limit erreicht. Bitte warte einen Moment und versuche es erneut.",
                "component_name": component_name,
                "image_index": image_index,
                "retry": True,
            }
        elif "400" in error_msg or "invalid" in error_msg.lower():
            return {
                "success": False,
                "error": f"Ungültige Anfrage: Das Bild konnte nicht verarbeitet werden.",
                "component_name": component_name,
                "image_index": image_index,
            }
        else:
            return {
                "success": False,
                "error": f"Fehler: {error_msg}",
                "component_name": component_name,
                "image_index": image_index,
            }


@tool
def modify_code(
    modification_request: str,
    current_code: Optional[str] = None,
    component_id: Optional[str] = None,
    component_filename: Optional[str] = None,
    selected_element: Optional[str] = None,
) -> dict:
    """
    Modify existing React code based on user instructions.
    
    This tool takes existing code and applies modifications based on
    natural language instructions, optionally targeting a specific element.
    
    Args:
        modification_request: Natural language description of the desired change,
                            e.g., "Make the button red" or "Add a header"
        current_code: The current React component code to modify (optional if component_id/filename provided)
        component_id: Optional component ID to load and update (takes precedence over current_code)
        component_filename: Optional filename to search for and update (used if component_id not provided)
        selected_element: Optional description of the selected element to modify,
                         e.g., "Button with text 'Submit'" or "The main card"
    
    Returns:
        dict containing:
        - code: The modified React code
        - changes_made: Description of what was changed
        - success: Boolean indicating if modification succeeded
        - component_id: ID of the updated component (if component_id was provided)
    """
    try:
        log_progress("MODIFY_CODE", "Starting", f"Request: {modification_request[:50]}...")
        
        # Load code from existing component if component_id or filename provided
        code_to_modify = current_code
        update_existing = False
        existing_component_id = None
        
        if component_id:
            log_progress("MODIFY_CODE", "Step 0/4", f"Loading existing component: {component_id}")
            code_to_modify = get_existing_component_code(component_id=component_id)
            if code_to_modify:
                update_existing = True
                existing_component_id = component_id
                log_progress("MODIFY_CODE", "Step 0/4", f"Loaded {len(code_to_modify)} chars from existing component")
            else:
                return {
                    "success": False,
                    "error": f"Component with ID '{component_id}' not found",
                }
        elif component_filename:
            log_progress("MODIFY_CODE", "Step 0/4", f"Loading existing component by filename: {component_filename}")
            code_to_modify = get_existing_component_code(filename=component_filename)
            if code_to_modify:
                update_existing = True
                log_progress("MODIFY_CODE", "Step 0/4", f"Loaded {len(code_to_modify)} chars from existing component")
            else:
                return {
                    "success": False,
                    "error": f"Component with filename '{component_filename}' not found",
                }
        elif not current_code:
            return {
                "success": False,
                "error": "Either current_code, component_id, or component_filename must be provided",
            }
        
        if selected_element:
            log_progress("MODIFY_CODE", "Step 1/4", f"Target element: {selected_element[:30]}...")
        else:
            log_progress("MODIFY_CODE", "Step 1/4", "Analyzing code structure...")
        
        # Check for Business DNA to maintain design system
        business_dna_context = ""
        if has_business_dna():
            dna = get_business_dna()
            log_progress("MODIFY_CODE", "Step 1.5/4", "🧬 Business DNA detected! Applying design system...")
            business_dna_context = _format_business_dna_for_prompt(dna)
        
        user_prompt = f"""You are an expert React developer. Modify the given code according to the user's request.
Keep the code structure intact and only change what's necessary.
Maintain the same coding style and conventions.
Output only the complete modified code, no explanations.
{business_dna_context}
CRITICAL - JSX Syntax Rules:
- In JSX text content, special characters like `>` and `<` MUST be escaped
- Use `{{'>'}}` or `&gt;` instead of `>` in text content
- Use `{{'<'}}` or `&lt;` instead of `<` in text content
- Example: `<div>{{'>'}} Connecting...</div>` NOT `<div>> Connecting...</div>`
- This prevents parsing errors and ensures the code compiles correctly
{AVAILABLE_SHADCN_COMPONENTS}
Here is the current React component code:

```tsx
{code_to_modify}
```

Modification request: {modification_request}"""

        if selected_element:
            user_prompt += f"\n\nThe user has selected this element: {selected_element}"
            user_prompt += "\nApply the modification specifically to this element."

        user_prompt += """

Apply the requested modification and return the complete updated code.
Keep all other parts of the code unchanged.
Return the code in the structured JSON format specified."""

        log_progress("MODIFY_CODE", "Step 2/4", "Calling Gemini API...")
        
        # Structured output schema for modifications
        modify_schema = {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The complete modified React component code"
                },
                "changes_summary": {
                    "type": "string",
                    "description": "Brief summary of what was changed"
                }
            },
            "required": ["code", "changes_summary"]
        }

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=16384,
                response_mime_type="application/json",
                response_schema=modify_schema,
            ),
        )
        
        log_progress("MODIFY_CODE", "Step 3/4", "Processing response...")
        
        # Parse structured JSON output - clean!
        result = json.loads(response.text)
        modified_code = result.get("code", "")
        
        log_progress("MODIFY_CODE", "Complete", f"Modified {len(modified_code)} chars of code")
        
        changes_summary = result.get("changes_summary", "Code modified successfully")
        
        # Save or update in sandbox
        if update_existing and existing_component_id:
            log_progress("MODIFY_CODE", "Saving", f"Updating existing component: {existing_component_id}")
            sandbox_result = update_component_in_sandbox(
                modified_code, 
                existing_component_id, 
                prompt=modification_request
            )
            
            preview_url = "/preview"
            file_path = None
            
            if sandbox_result.get("success"):
                component = sandbox_result.get("component", {})
                preview_url = sandbox_result.get("previewUrl", f"/preview?id={existing_component_id}")
                file_path = sandbox_result.get("filePath", f"src/generated/components/{component.get('filename', 'unknown')}")
                print(f"  📁 [SANDBOX] Updated existing component: {file_path}")
            else:
                print(f"  ⚠️ [SANDBOX] Update failed: {sandbox_result.get('error')}")
            
            return {
                "success": True,
                "code": modified_code,
                "component_id": existing_component_id,
                "component_name": component.get("name", "Updated Component") if sandbox_result.get("success") else "Updated Component",
                "preview_url": f"http://localhost:3000{preview_url}",
                "file_path": file_path or f"src/generated/components/updated.tsx",
                "modification_applied": modification_request,
                "targeted_element": selected_element,
                "model_used": GEMINI_MODEL,
                "ai_notes": f"Updated existing component: {changes_summary}",
            }
        else:
            # Create new component (original behavior)
            component_name = f"Modified_{len(_generated_code)}"
            log_progress("MODIFY_CODE", "Saving", "Saving new component to sandbox...")
            sandbox_result = save_to_sandbox(modified_code, component_name, modification_request)
            
            preview_url = "/preview"
            file_path = f"src/generated/components/{component_name}.tsx"
            
            if sandbox_result.get("success"):
                preview_url = sandbox_result.get("previewUrl", preview_url)
                file_path = sandbox_result.get("filePath", file_path)
                print(f"  📁 [SANDBOX] Modified code saved to: {file_path}")
            else:
                print(f"  ⚠️ [SANDBOX] Save failed: {sandbox_result.get('error')}")
            
            # Always return code so frontend can update sandbox!
            return {
                "success": True,
                "code": modified_code,
                "component_name": component_name,
                "preview_url": f"http://localhost:3000{preview_url}",
                "file_path": file_path,
                "modification_applied": modification_request,
                "targeted_element": selected_element,
                "model_used": GEMINI_MODEL,
                "ai_notes": f"Modified code: {changes_summary}",
            }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Code modification failed: {str(e)}",
        }


@tool
def generate_screen(
    name: str,
    description: str,
    style_reference: Optional[str] = None,
    reference_screen_id: Optional[str] = None,
    reference_image_index: Optional[int] = None,
) -> dict:
    """
    Generate a single React screen/component from a text description.
    
    This tool creates a standalone React component based on the description.
    Use this to generate screens one at a time - the agent controls the loop.
    
    For multi-screen scenarios, call this tool multiple times:
    1. Generate first screen
    2. Use the returned component_id as reference_screen_id for subsequent screens
       to maintain consistent styling
    
    Args:
        name: Name for the React component (e.g., "LoginScreen", "Dashboard")
        description: Detailed description of what the screen should show.
                    Include layout, content, colors, and functionality details.
        style_reference: Optional text description of visual style to apply
                        (e.g., "dark theme with blue accents, corporate look")
        reference_screen_id: Optional ID of an existing screen to match styling.
                            The code from this screen will be used as a style guide.
        reference_image_index: Optional index of an uploaded image to use as visual reference.
                              0-based index (image 10 = index 9). The image will be sent to
                              Gemini along with the description so it can match the visual style.
    
    Returns:
        dict containing:
        - success: Boolean indicating if generation succeeded
        - component_name: Name of the generated component
        - component_id: ID of the saved component (use this for reference_screen_id in next calls)
        - code: The generated React code
        - preview_url: URL to preview the screen
        - file_path: Path where the component was saved
        - reference_image_used: Which image index was used as reference (if any)
    """
    try:
        log_progress("GENERATE_SCREEN", "Starting", f"Screen: {name}")
        
        # Check for Business DNA (extracted from uploaded design references)
        business_dna_context = ""
        if has_business_dna():
            dna = get_business_dna()
            log_progress("GENERATE_SCREEN", "Step 0/4", "🧬 Business DNA detected! Injecting design system...")
            business_dna_context = _format_business_dna_for_prompt(dna)
        
        # Get reference image if specified
        reference_image = None
        reference_image_mime = None
        if reference_image_index is not None:
            all_images = get_all_images_from_state()
            if all_images:
                if 0 <= reference_image_index < len(all_images):
                    reference_image, reference_image_mime = all_images[reference_image_index]
                    log_progress("GENERATE_SCREEN", "Step 0.5/4", f"📷 Using image {reference_image_index+1} of {len(all_images)} as visual reference")
                else:
                    log_progress("GENERATE_SCREEN", "Step 0.5/4", f"⚠️ Invalid image_index {reference_image_index}, have {len(all_images)} images")
        
        # Load reference screen code if provided
        reference_code = None
        if reference_screen_id:
            log_progress("GENERATE_SCREEN", "Step 1/4", f"Loading reference screen: {reference_screen_id}")
            reference_code = get_existing_component_code(component_id=reference_screen_id)
            if reference_code:
                log_progress("GENERATE_SCREEN", "Step 1/4", f"Loaded {len(reference_code)} chars as style reference")
            else:
                log_progress("GENERATE_SCREEN", "Step 1/4", "Reference screen not found, continuing without")
        else:
            log_progress("GENERATE_SCREEN", "Step 1/4", "No reference screen, generating fresh")
        
        # Build the prompt
        style_context = ""
        if style_reference:
            style_context = f"\n\nSTYLE REQUIREMENTS:\n{style_reference}"
        
        reference_context = ""
        if reference_code:
            reference_context = f"""

STYLE REFERENCE CODE:
You must match the visual style (colors, typography, spacing, component patterns) of this existing screen:

```tsx
{reference_code}
```

Extract and reuse:
- Color scheme (exact hex codes)
- Typography styles (font sizes, weights)
- Spacing patterns (padding, margins, gaps)
- Component styling patterns (cards, buttons, etc.)
- Layout patterns (grids, flex layouts)
"""
        
        # Add reference image context if we have one - WITH SCENE DECOMPOSITION RULES
        image_reference_context = ""
        if reference_image:
            image_reference_context = f"""

VISUAL REFERENCE IMAGE PROVIDED - CRITICAL INSTRUCTIONS:

🎨 STYLE EXTRACTION (DO this):
- Extract the EXACT color palette (header bg, button colors, text colors, borders)
- Match the EXACT typography (font sizes, weights, letter spacing)
- Copy the EXACT spacing patterns (padding, margins, gaps between elements)
- Replicate the EXACT component styling (button radius, shadows, borders)
- Match the header, navbar, and layout structure PIXEL-PERFECTLY

🚫 SCENE DECOMPOSITION (DO NOT simply copy content):
The reference image shows a specific screen state. DO NOT just rebuild what you see!
Instead:
1. EXTRACT the visual STYLE (colors, fonts, spacing, shadows)
2. APPLY that style to the DESCRIPTION provided ("{name}" - "{description[:100]}...")
3. Generate NEW content that matches the description while using the extracted style

Example of WRONG approach:
- Image shows a "History Analysis" screen → You generate "History Analysis" even if description says "Settings"
- Image shows 3 table rows → You copy those exact 3 rows

Example of CORRECT approach:
- Image shows a "History Analysis" screen with blue headers and rounded tables
- Description says "Settings page with user preferences"
- You generate a SETTINGS PAGE using the same blue headers, rounded tables, and visual style

🎯 YOUR TASK:
1. From the image: Extract colors, fonts, shadows, borders, spacing, layout patterns
2. From the description: Understand what content/functionality to build
3. Generate: A screen that LOOKS like it belongs to the same app (matching style) but shows the content described

The generated screen must be VISUALLY INDISTINGUISHABLE from the reference app in terms of:
- Header appearance (same background, logo position, icons)
- Navigation styling (same active states, borders, colors)
- Button colors (EXACT hex codes - primary buttons MUST use the accent color)
- Typography (same sizes, weights, colors)
- Shadows and borders (EXACT CSS shadow values)
- Overall dark/light theme"""

        # Check if we have component templates
        has_templates = has_component_templates()
        template_instruction = ""
        if has_templates:
            templates = get_component_templates()
            template_instruction = """
CRITICAL - TEMPLATE USAGE:
Component templates have been extracted from the reference images. Your generated component MUST:
1. Include the EXACT HeaderTemplate code at the top of your component
2. Include the EXACT NavbarTemplate code below the header
3. Put your unique screen content below the navbar
4. The header and navbar must be PIXEL-PERFECT matches to the reference images
5. DO NOT modify the header or navbar - only generate the main content area differently

The templates are included in the BUSINESS DNA section above. Copy them EXACTLY into your component.
"""
            log_progress("GENERATE_SCREEN", "Step 1.5/4", "🎨 Component templates available - will inject header/navbar")

        user_prompt = f"""You are an expert frontend developer specializing in React, Tailwind CSS, and shadcn/ui components.

Generate a STATIC React component based on this description:

COMPONENT NAME: {name}

DESCRIPTION:
{description}
{business_dna_context}
{style_context}
{reference_context}
{image_reference_context}
{template_instruction}

REQUIREMENTS:
1. React functional component with TypeScript
2. Tailwind CSS for ALL styling (no inline styles or CSS files)
3. shadcn/ui components where applicable (Button, Card, Input, Badge, etc.)
4. Static component - use mock data, no state management needed
5. Complete, runnable code with default export
6. CRITICAL - JSX Syntax: 
   - In JSX text content, special characters like `>` and `<` MUST be escaped
   - Use `{{'>'}}` or `&gt;` instead of `>` in text content
   - Use `{{'<'}}` or `&lt;` instead of `<` in text content
7. If COMPONENT TEMPLATES are provided above, you MUST include them EXACTLY
   - Copy the header and navbar code exactly as provided
   - Only change the main content area based on the description
   - This ensures all screens look like they're from the same app
8. CRITICAL - COLOR ACCURACY:
   - Primary buttons MUST use the accent color (blue like #4263EB or #3B5BDB), NEVER white background
   - Button text on colored backgrounds MUST be white
   - Danger buttons (red) should use exact red from DNA
   - Apply ALL shadows from the Business DNA (especially header drop shadow)
9. If a reference image is provided:
   - Extract and use the EXACT visual style from the image
   - Generate content based on the DESCRIPTION, not the image content
   - The screen should look like it belongs to the same app as the reference
{AVAILABLE_SHADCN_COMPONENTS}
Return the code in the structured JSON format specified."""

        log_progress("GENERATE_SCREEN", "Step 2/4", "Calling Gemini API...")
        
        # Schema for screen generation
        screen_schema = {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The complete React + Tailwind component code"
                },
                "component_name": {
                    "type": "string",
                    "description": "The name of the component"
                },
                "description": {
                    "type": "string",
                    "description": "Brief description of what this screen shows"
                }
            },
            "required": ["code", "component_name", "description"]
        }
        
        # Build content - multimodal if we have a reference image
        if reference_image:
            log_progress("GENERATE_SCREEN", "Step 2/4", f"Including reference image in request ({len(reference_image)} bytes)")
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(data=reference_image, mime_type=reference_image_mime or "image/jpeg"),
                        types.Part.from_text(text=user_prompt),
                    ],
                ),
            ]
        else:
            contents = user_prompt
        
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=16384,
                response_mime_type="application/json",
                response_schema=screen_schema,
            ),
        )
        
        log_progress("GENERATE_SCREEN", "Step 3/4", "Processing response...")
        
        result = json.loads(response.text)
        generated_code = result.get("code", "")
        component_name = result.get("component_name", name)
        
        log_progress("GENERATE_SCREEN", "Step 4/4", f"Generated {len(generated_code)} chars")
        
        # Save to sandbox
        log_progress("GENERATE_SCREEN", "Saving", f"Saving {component_name} to sandbox...")
        sandbox_result = save_to_sandbox(generated_code, component_name, description[:200])
        
        preview_url = "/preview"
        file_path = f"src/generated/components/{component_name}.tsx"
        component_id = None
        
        if sandbox_result.get("success"):
            preview_url = sandbox_result.get("previewUrl", preview_url)
            file_path = sandbox_result.get("filePath", file_path)
            component_id = sandbox_result.get("component", {}).get("id")
            print(f"  📁 [SANDBOX] Saved to: {file_path}")
        else:
            print(f"  ⚠️ [SANDBOX] Save failed: {sandbox_result.get('error')}")
        
        log_progress("GENERATE_SCREEN", "Complete", f"Screen '{component_name}' ready")
        
        # Build ai_notes with reference info
        ai_notes = f"Generated screen '{component_name}'."
        if reference_image_index is not None and reference_image:
            ai_notes += f" Used image {reference_image_index+1} as visual reference."
        ai_notes += f" Use component_id='{component_id}' as reference_screen_id for consistent styling in subsequent screens."
        
        return {
            "success": True,
            "component_name": component_name,
            "component_id": component_id,
            "code": generated_code,
            "preview_url": f"http://localhost:3000{preview_url}",
            "file_path": file_path,
            "description": result.get("description", description[:100]),
            "model_used": GEMINI_MODEL,
            "reference_image_used": reference_image_index if reference_image else None,
            "ai_notes": ai_notes,
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ [GENERATE_SCREEN] Error: {error_msg}")
        
        if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
            return {
                "success": False,
                "error": "Rate limit reached. Please wait a moment and try again.",
                "component_name": name,
                "reference_image_index": reference_image_index,
                "retry": True,
            }
        else:
            return {
                "success": False,
                "error": f"Screen generation failed: {error_msg}",
                "component_name": name,
                "reference_image_index": reference_image_index,
            }


@tool
def get_generated_code(code_id: str) -> dict:
    """
    Retrieve previously generated code by its ID.
    
    Args:
        code_id: The unique identifier returned from image_to_code
        
    Returns:
        dict with code and metadata, or error if not found
    """
    if code_id in _generated_code:
        return {
            "success": True,
            **_generated_code[code_id],
        }
    return {
        "success": False,
        "error": f"Code with ID '{code_id}' not found",
        "available_ids": list(_generated_code.keys()),
    }
