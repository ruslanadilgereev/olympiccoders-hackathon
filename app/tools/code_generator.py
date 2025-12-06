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
from app.tools.tool_state import get_image_from_state, get_thread_id, get_current_code, set_current_code


def log_progress(tool_name: str, step: str, details: str = ""):
    """Log progress for tool execution - helps with debugging and UX."""
    timestamp = time.strftime("%H:%M:%S")
    if details:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}: {details}")
    else:
        print(f"  [{timestamp}] 🔄 [{tool_name}] {step}")

# Frontend sandbox API URL
SANDBOX_API_URL = "http://localhost:3000/api/generate"


def save_to_sandbox(code: str, name: str, prompt: str = "", thread_id: str = "") -> dict:
    """Save generated code to the frontend sandbox."""
    try:
        data = json.dumps({
            "code": code,
            "name": name,
            "prompt": prompt,
            "threadId": thread_id,
        }).encode('utf-8')
        
        req = urllib.request.Request(
            SANDBOX_API_URL,
            data=data,
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


# Initialize Gemini client with extended timeout for image processing
client = genai.Client(
    api_key=GOOGLE_API_KEY,
    http_options={"timeout": 120000},  # 120 seconds timeout
)

# Model Configuration - Differentiated for speed vs quality
# Pro for initial image analysis (quality matters)
MODEL_IMAGE_TO_CODE = "gemini-3-pro-preview"
# Flash for modifications (speed matters, code context already exists)  
MODEL_MODIFY = "gemini-2.5-flash"

# Store generated code for reference
_generated_code: dict[str, dict] = {}


# System prompt for code generation
CODE_GENERATION_SYSTEM_PROMPT = """You are an expert frontend developer specializing in React, Tailwind CSS, and shadcn/ui components.

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
   - ALWAYS import ALL icons used from lucide-react (e.g., `import { Mail, User, Lock } from 'lucide-react'`)
4. **Color Matching**: Extract exact colors from the image and use them (hex codes in Tailwind arbitrary values like `bg-[#1a1a2e]`)
5. **Typography**: Match font sizes, weights, and spacing precisely
6. **Layout**: Use Flexbox/Grid appropriately, match padding/margins exactly

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
    additional_instructions: Optional[str] = None,
) -> dict:
    """
    Convert the uploaded UI screenshot into React + Tailwind CSS code.
    
    This tool uses Gemini 3 Pro's vision capabilities to analyze a UI screenshot
    and generate pixel-perfect React code that replicates the design.
    
    The image is automatically extracted from the user's message - you don't need
    to pass the image data, just call this tool.
    
    Args:
        component_name: Name for the generated React component (default: "GeneratedUI")
        additional_instructions: Optional extra instructions for code generation,
                                e.g., "Make it responsive" or "Use dark theme"
    
    Returns:
        dict containing:
        - code: The generated React + Tailwind code
        - component_name: Name of the component
        - success: Boolean indicating if generation succeeded
    """
    try:
        log_progress("IMAGE_TO_CODE", "Starting", f"Component: {component_name}")
        
        # Get image from tool state (extracted by middleware)
        log_progress("IMAGE_TO_CODE", "Step 1/4", "Loading image from state")
        image_bytes, image_mime = get_image_from_state()
        
        if not image_bytes:
            return {
                "success": False,
                "error": "No image found. Please upload an image first.",
                "component_name": component_name,
            }
        
        log_progress("IMAGE_TO_CODE", "Step 2/4", f"Image loaded: {len(image_bytes)} bytes, {image_mime}")
        
        # Build the prompt
        user_prompt = f"""{CODE_GENERATION_SYSTEM_PROMPT}

Analyze this UI screenshot and convert it to a React component named "{component_name}".

Generate complete, runnable React + Tailwind CSS code that replicates this UI exactly.

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

        log_progress("IMAGE_TO_CODE", "Step 3/4", f"Calling {MODEL_IMAGE_TO_CODE}...")
        
        # Call Gemini Pro Vision with structured output
        response = client.models.generate_content(
            model=MODEL_IMAGE_TO_CODE,
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
                temperature=0.2,
                max_output_tokens=12000,
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
        
        # CRITICAL: Store code in state for modify_code to use!
        set_current_code(generated_code, component_name)
        
        # Auto-save to sandbox with thread_id for session linking
        thread_id = get_thread_id() or ""
        log_progress("IMAGE_TO_CODE", "Saving", f"Saving to sandbox (thread: {thread_id[:8] if thread_id else 'none'})...")
        sandbox_result = save_to_sandbox(generated_code, component_name, additional_instructions or "", thread_id)
        
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
            "model_used": MODEL_IMAGE_TO_CODE,
            "ai_notes": f"Successfully converted UI screenshot to {component_name} component with {len(generated_code)} characters of React + Tailwind code.",
        }
        
    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ [IMAGE_TO_CODE] Error: {error_msg}")
        
        if "429" in error_msg or "quota" in error_msg.lower() or "rate" in error_msg.lower():
            return {
                "success": False,
                "error": "Rate limit erreicht. Bitte warte einen Moment und versuche es erneut.",
                "component_name": component_name,
                "retry": True,
            }
        elif "400" in error_msg or "invalid" in error_msg.lower():
            return {
                "success": False,
                "error": f"Ungültige Anfrage: Das Bild konnte nicht verarbeitet werden.",
                "component_name": component_name,
            }
        else:
            return {
                "success": False,
                "error": f"Fehler: {error_msg}",
                "component_name": component_name,
            }


@tool
def modify_code(
    modification_request: str,
    current_code: Optional[str] = None,
    selected_element: Optional[str] = None,
) -> dict:
    """
    Modify existing React code based on user instructions.
    
    This tool automatically uses the last generated code from the session.
    You do NOT need to pass current_code - it's retrieved automatically!
    
    Args:
        modification_request: Natural language description of the desired change,
                            e.g., "Make the button red" or "Add a header"
        current_code: Optional - will be auto-retrieved from state if not provided
        selected_element: Optional description of the selected element to modify
    
    Returns:
        dict containing:
        - code: The modified React code
        - changes_made: Description of what was changed
        - success: Boolean indicating if modification succeeded
    """
    try:
        log_progress("MODIFY_CODE", "Starting", f"Request: {modification_request[:50]}...")
        
        # AUTO-RETRIEVE CODE FROM STATE if not provided!
        if not current_code:
            stored_code, stored_name = get_current_code()
            if stored_code:
                current_code = stored_code
                log_progress("MODIFY_CODE", "Step 1/3", f"Using stored code: {len(current_code)} chars")
            else:
                return {
                    "success": False,
                    "error": "No code found in session. Please generate code first with image_to_code.",
                }
        else:
            log_progress("MODIFY_CODE", "Step 1/3", f"Using provided code: {len(current_code)} chars")
        
        if selected_element:
            log_progress("MODIFY_CODE", "Element", f"Target: {selected_element[:30]}...")
        
        user_prompt = f"""You are an expert React developer. Modify the given code according to the user's request.

CRITICAL RULES:
1. Keep the code structure intact and only change what's necessary
2. Maintain the same coding style and conventions
3. ALWAYS ensure ALL icons used are imported from lucide-react
4. If you add any icon, ADD IT TO THE IMPORT STATEMENT
5. Output the COMPLETE code including all imports

Here is the current React component code:

```tsx
{current_code}
```

Modification request: {modification_request}"""

        if selected_element:
            user_prompt += f"\n\nThe user has selected this element: {selected_element}"
            user_prompt += "\nApply the modification specifically to this element."

        user_prompt += """

Apply the requested modification and return the complete updated code.
Keep all other parts of the code unchanged.
Return the code in the structured JSON format specified."""

        log_progress("MODIFY_CODE", "Step 2/3", f"Calling {MODEL_MODIFY} (fast)...")
        
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
            model=MODEL_MODIFY,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,  # Lower for more predictable modifications
                max_output_tokens=8192,
                response_mime_type="application/json",
                response_schema=modify_schema,
            ),
        )
        
        log_progress("MODIFY_CODE", "Step 3/3", "Processing response...")
        
        # Parse structured JSON output - clean!
        result = json.loads(response.text)
        modified_code = result.get("code", "")
        
        log_progress("MODIFY_CODE", "Complete", f"Modified {len(modified_code)} chars of code")
        
        # CRITICAL: Update code in state for next modification!
        set_current_code(modified_code)
        
        # Auto-save to sandbox with thread_id for session linking
        component_name = f"Modified_{len(_generated_code)}"
        thread_id = get_thread_id() or ""
        log_progress("MODIFY_CODE", "Saving", f"Saving to sandbox (thread: {thread_id[:8] if thread_id else 'none'})...")
        sandbox_result = save_to_sandbox(modified_code, component_name, modification_request, thread_id)
        
        preview_url = "/preview"
        file_path = f"src/generated/components/{component_name}.tsx"
        
        if sandbox_result.get("success"):
            preview_url = sandbox_result.get("previewUrl", preview_url)
            file_path = sandbox_result.get("filePath", file_path)
            print(f"  📁 [SANDBOX] Modified code saved to: {file_path}")
        else:
            print(f"  ⚠️ [SANDBOX] Save failed: {sandbox_result.get('error')}")
        
        changes_summary = result.get("changes_summary", "Code modified successfully")
        
        # Always return code so frontend can update sandbox!
        return {
            "success": True,
            "code": modified_code,
            "component_name": component_name,
            "preview_url": f"http://localhost:3000{preview_url}",
            "file_path": file_path,
            "modification_applied": modification_request,
            "targeted_element": selected_element,
            "model_used": MODEL_MODIFY,
            "ai_notes": f"Modified code: {changes_summary}",
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Code modification failed: {str(e)}",
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
