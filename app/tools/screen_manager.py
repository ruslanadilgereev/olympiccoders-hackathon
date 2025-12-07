"""Screen Manager Tools - Cursor-like file/screen operations for the agent.

This module provides tools for managing generated screens/components,
enabling the agent to:
- List all existing screens
- Load screen code for modification
- Update existing screens (without creating new files)
- Create new screens

This is CORE functionality for achieving a Cursor-like experience.
"""

import json
import urllib.request
import urllib.error
from typing import Optional
from langchain_core.tools import tool

# Frontend sandbox API URL
SANDBOX_API_URL = "http://localhost:3000/api/generate"


def _make_request(url: str, method: str = "GET", data: Optional[dict] = None) -> dict:
    """Make HTTP request to sandbox API."""
    try:
        req_data = json.dumps(data).encode('utf-8') if data else None
        headers = {'Content-Type': 'application/json'} if data else {}
        
        req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        return {"success": False, "error": f"Connection error: {e}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@tool
def list_screens() -> dict:
    """
    List all generated screens/components in the sandbox.
    
    Returns a list of all screens with their IDs, names, filenames,
    and creation timestamps. Use this to see what screens exist
    before loading or modifying them.
    
    Returns:
        dict containing:
        - success: Boolean
        - screens: List of screen objects with id, name, filename, createdAt
        - count: Number of screens
    """
    result = _make_request(SANDBOX_API_URL)
    
    if "error" in result:
        return {"success": False, "error": result["error"]}
    
    components = result.get("components", [])
    
    screens = [
        {
            "id": comp.get("id"),
            "name": comp.get("name"),
            "filename": comp.get("filename"),
            "createdAt": comp.get("createdAt"),
            "prompt": comp.get("prompt", "")[:100] + "..." if comp.get("prompt", "") else None,
        }
        for comp in components
    ]
    
    return {
        "success": True,
        "screens": screens,
        "count": len(screens),
        "ai_notes": f"Found {len(screens)} screens in the sandbox. Use load_screen(id) to view the code of a specific screen.",
    }


@tool
def load_screen(screen_id: Optional[str] = None, screen_name: Optional[str] = None) -> dict:
    """
    Load the code of an existing screen/component.
    
    ALWAYS call this before modifying a screen! This is the READ step
    of the READ → MODIFY → WRITE workflow.
    
    Args:
        screen_id: The unique ID of the screen (preferred)
        screen_name: The name of the screen (used if screen_id not provided)
    
    Returns:
        dict containing:
        - success: Boolean
        - screen: Screen metadata (id, name, filename)
        - code: The full React code of the screen
    """
    if not screen_id and not screen_name:
        return {
            "success": False,
            "error": "Either screen_id or screen_name must be provided",
        }
    
    # Get all screens with code
    url = f"{SANDBOX_API_URL}?withCode=true"
    if screen_id:
        url = f"{SANDBOX_API_URL}?id={screen_id}&withCode=true"
    
    result = _make_request(url)
    
    if "error" in result:
        return {"success": False, "error": result["error"]}
    
    # If we got a specific component
    if screen_id and "code" in result:
        return {
            "success": True,
            "screen": {
                "id": result.get("id"),
                "name": result.get("name"),
                "filename": result.get("filename"),
            },
            "code": result.get("code"),
            "ai_notes": f"Loaded screen '{result.get('name')}'. You can now analyze and modify this code.",
        }
    
    # Search by name in all components
    components = result.get("components", [])
    
    for comp in components:
        if screen_name and (comp.get("name") == screen_name or comp.get("filename") == f"{screen_name}.tsx"):
            return {
                "success": True,
                "screen": {
                    "id": comp.get("id"),
                    "name": comp.get("name"),
                    "filename": comp.get("filename"),
                },
                "code": comp.get("code"),
                "ai_notes": f"Loaded screen '{comp.get('name')}'. You can now analyze and modify this code.",
            }
        elif screen_id and comp.get("id") == screen_id:
            return {
                "success": True,
                "screen": {
                    "id": comp.get("id"),
                    "name": comp.get("name"),
                    "filename": comp.get("filename"),
                },
                "code": comp.get("code"),
                "ai_notes": f"Loaded screen '{comp.get('name')}'. You can now analyze and modify this code.",
            }
    
    return {
        "success": False,
        "error": f"Screen not found: {screen_id or screen_name}",
        "available_screens": [c.get("name") for c in components],
    }


@tool
def update_screen(
    screen_id: str,
    new_code: str,
    change_description: Optional[str] = None,
) -> dict:
    """
    Update an existing screen with new code.
    
    This is the WRITE step of the READ → MODIFY → WRITE workflow.
    Use this AFTER loading and modifying the screen code.
    
    IMPORTANT: This updates the EXISTING file, it does NOT create a new file!
    
    Args:
        screen_id: The unique ID of the screen to update (from load_screen)
        new_code: The complete updated React code
        change_description: Optional description of what was changed
    
    Returns:
        dict containing:
        - success: Boolean
        - screen: Updated screen metadata
        - code: The updated code (for frontend to refresh preview)
        - preview_url: URL to preview the updated screen
    """
    if not screen_id:
        return {"success": False, "error": "screen_id is required"}
    
    if not new_code:
        return {"success": False, "error": "new_code is required"}
    
    url = f"{SANDBOX_API_URL}?id={screen_id}"
    data = {
        "code": new_code,
        "prompt": change_description,
    }
    
    result = _make_request(url, method="PUT", data=data)
    
    if result.get("success"):
        component = result.get("component", {})
        return {
            "success": True,
            "screen": {
                "id": component.get("id", screen_id),
                "name": component.get("name"),
                "filename": component.get("filename"),
            },
            "code": new_code,  # Return code so frontend can update preview!
            "preview_url": f"http://localhost:3000{result.get('previewUrl', '/preview')}",
            "file_path": result.get("filePath"),
            "ai_notes": f"Updated screen '{component.get('name')}'. Changes: {change_description or 'Code updated'}",
        }
    
    return {
        "success": False,
        "error": result.get("error", "Failed to update screen"),
    }


@tool
def create_screen(
    name: str,
    code: str,
    description: Optional[str] = None,
) -> dict:
    """
    Create a new screen/component in the sandbox.
    
    Use this to create entirely NEW screens. For modifying existing
    screens, use load_screen + update_screen instead.
    
    Args:
        name: Name for the new screen (will become the filename)
        code: The complete React + Tailwind code for the screen
        description: Optional description of what the screen does
    
    Returns:
        dict containing:
        - success: Boolean
        - screen: Screen metadata (id, name, filename)
        - preview_url: URL to preview the new screen
    """
    if not name:
        return {"success": False, "error": "name is required"}
    
    if not code:
        return {"success": False, "error": "code is required"}
    
    data = {
        "code": code,
        "name": name,
        "prompt": description,
    }
    
    result = _make_request(SANDBOX_API_URL, method="POST", data=data)
    
    if result.get("success"):
        component = result.get("component", {})
        return {
            "success": True,
            "screen": {
                "id": component.get("id"),
                "name": component.get("name"),
                "filename": component.get("filename"),
            },
            "preview_url": f"http://localhost:3000{result.get('previewUrl', '/preview')}",
            "file_path": result.get("filePath"),
            "ai_notes": f"Created new screen '{name}'. You can view it in the preview panel.",
        }
    
    return {
        "success": False,
        "error": result.get("error", "Failed to create screen"),
    }


@tool
def delete_screen(screen_id: str) -> dict:
    """
    Delete a screen/component from the sandbox.
    
    Use with caution - this permanently removes the screen file.
    
    Args:
        screen_id: The unique ID of the screen to delete
    
    Returns:
        dict containing:
        - success: Boolean
        - message: Confirmation message
    """
    if not screen_id:
        return {"success": False, "error": "screen_id is required"}
    
    url = f"{SANDBOX_API_URL}?id={screen_id}"
    result = _make_request(url, method="DELETE")
    
    if result.get("success"):
        return {
            "success": True,
            "message": f"Screen {screen_id} deleted successfully",
            "ai_notes": "Screen has been removed from the sandbox.",
        }
    
    return {
        "success": False,
        "error": result.get("error", "Failed to delete screen"),
    }


@tool
def create_screen_variant(
    source_screen_id: str,
    variant_name: str,
    modifications: Optional[str] = None,
) -> dict:
    """
    Create a variant/alternative version of an existing screen.
    
    This allows exploration of different designs without overwriting the original.
    The variant will be named as "{OriginalName}_{variant_name}".
    
    Use this when the user says:
    - "show me an alternative"
    - "try a different layout"
    - "create a wizard version instead of tabs"
    
    Args:
        source_screen_id: ID of the screen to create a variant from
        variant_name: Name for the variant (e.g., "AltTabs", "Wizard", "Compact")
        modifications: Optional description of what makes this variant different
    
    Returns:
        dict containing:
        - success: Boolean
        - original: Original screen metadata
        - variant: New variant screen metadata
        - preview_url: URL to preview the variant
    """
    # First load the original screen
    load_result = load_screen.invoke({"screen_id": source_screen_id})
    
    if not load_result.get("success"):
        return {
            "success": False,
            "error": f"Could not load source screen: {load_result.get('error')}",
        }
    
    original_screen = load_result.get("screen", {})
    original_code = load_result.get("code", "")
    original_name = original_screen.get("name", "Screen")
    
    # Create the variant name
    new_name = f"{original_name}_{variant_name}"
    
    # Create the variant as a new screen
    create_result = create_screen.invoke({
        "name": new_name,
        "code": original_code,
        "description": f"Variant of {original_name}: {modifications or variant_name}",
    })
    
    if create_result.get("success"):
        return {
            "success": True,
            "original": original_screen,
            "variant": create_result.get("screen"),
            "preview_url": create_result.get("preview_url"),
            "file_path": create_result.get("file_path"),
            "ai_notes": f"Created variant '{new_name}' from '{original_name}'. You can now modify this variant without affecting the original.",
        }
    
    return {
        "success": False,
        "error": create_result.get("error", "Failed to create variant"),
    }


@tool
def list_screen_variants(base_name: str) -> dict:
    """
    List all variants of a screen.
    
    Looks for screens that start with the base name followed by an underscore.
    For example, if base_name is "Dashboard", finds "Dashboard_Wizard", "Dashboard_Compact", etc.
    
    Args:
        base_name: The base screen name to find variants of
    
    Returns:
        dict containing:
        - success: Boolean
        - base_screen: The original screen (if exists)
        - variants: List of variant screens
        - count: Total number of variants found
    """
    # Get all screens
    list_result = list_screens.invoke({})
    
    if not list_result.get("success"):
        return {"success": False, "error": list_result.get("error")}
    
    screens = list_result.get("screens", [])
    
    # Find base screen and variants
    base_screen = None
    variants = []
    
    for screen in screens:
        name = screen.get("name", "")
        if name == base_name:
            base_screen = screen
        elif name.startswith(f"{base_name}_"):
            variant_suffix = name[len(base_name) + 1:]
            variants.append({
                **screen,
                "variant_name": variant_suffix,
            })
    
    return {
        "success": True,
        "base_screen": base_screen,
        "variants": variants,
        "count": len(variants),
        "ai_notes": f"Found {len(variants)} variants of '{base_name}'" + 
                   (f". Base screen exists." if base_screen else ". Base screen not found."),
    }


@tool
def compare_screen_variants(screen_ids: list[str]) -> dict:
    """
    Load multiple screens for comparison.
    
    Useful when the user wants to compare different variants side-by-side.
    Returns the code for each screen so the agent can analyze differences.
    
    Args:
        screen_ids: List of screen IDs to compare (2-4 screens)
    
    Returns:
        dict containing:
        - success: Boolean
        - screens: List of screens with their code
        - comparison_notes: Brief notes about differences
    """
    if not screen_ids or len(screen_ids) < 2:
        return {
            "success": False,
            "error": "At least 2 screen IDs are required for comparison",
        }
    
    if len(screen_ids) > 4:
        return {
            "success": False,
            "error": "Maximum 4 screens can be compared at once",
        }
    
    screens = []
    for screen_id in screen_ids:
        result = load_screen.invoke({"screen_id": screen_id})
        if result.get("success"):
            screens.append({
                "id": screen_id,
                "name": result.get("screen", {}).get("name"),
                "code": result.get("code"),
                "code_length": len(result.get("code", "")),
            })
        else:
            screens.append({
                "id": screen_id,
                "error": result.get("error"),
            })
    
    successful = [s for s in screens if "code" in s]
    
    return {
        "success": len(successful) >= 2,
        "screens": screens,
        "loaded_count": len(successful),
        "ai_notes": f"Loaded {len(successful)} of {len(screen_ids)} screens for comparison. Analyze the code to identify differences.",
    }

