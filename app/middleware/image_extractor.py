"""Image extraction for the design automation agent.

Extracts images from incoming messages and stores them in tool state
so tools can access them.
"""
import base64
from typing import Any
from langchain_core.messages import HumanMessage

from app.tools.tool_state import set_images_in_state, clear_image_state, get_image_from_state


def extract_all_images_from_messages(messages: list) -> list[tuple[bytes, str]]:
    """
    Extract ALL image data from the last HumanMessage.
    
    Supports:
    - Base64 data URLs (data:image/jpeg;base64,...)
    - Multimodal content blocks
    
    Returns:
        List of tuples: [(image_bytes, mime_type), ...]
    """
    images = []
    
    if not messages:
        return images
    
    # Find the last HumanMessage
    last_human_msg = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_human_msg = msg
            break
        elif hasattr(msg, 'type') and msg.type == 'human':
            last_human_msg = msg
            break
        elif isinstance(msg, dict) and msg.get('role') == 'user':
            last_human_msg = msg
            break
    
    if not last_human_msg:
        return images
    
    # Get content
    if isinstance(last_human_msg, dict):
        content = last_human_msg.get('content')
    else:
        content = getattr(last_human_msg, 'content', None)
    
    if not content:
        return images
    
    # Handle multimodal content (list of parts)
    if isinstance(content, list):
        for part in content:
            if isinstance(part, dict):
                # Check for image_url type (OpenAI/Frontend format)
                if part.get("type") == "image_url":
                    url = part.get("image_url", {})
                    if isinstance(url, dict):
                        url = url.get("url", "")
                    elif not isinstance(url, str):
                        continue
                    
                    if url.startswith("data:"):
                        result = _parse_data_url(url)
                        if result[0] is not None:
                            images.append(result)
                
                # Check for image type (LangGraph Studio format)
                elif part.get("type") == "image":
                    data = part.get("data")
                    mime_type = part.get("mime_type", "image/jpeg")
                    
                    if data:
                        if isinstance(data, str):
                            try:
                                images.append((base64.b64decode(data), mime_type))
                                continue
                            except Exception as e:
                                print(f"  [WARNING] Failed to decode base64: {e}")
                        elif isinstance(data, bytes):
                            images.append((data, mime_type))
                            continue
                    
                    # Anthropic format
                    source = part.get("source", {})
                    if source.get("type") == "base64":
                        data = source.get("data", "")
                        media_type = source.get("media_type", "image/jpeg")
                        if data:
                            try:
                                images.append((base64.b64decode(data), media_type))
                            except Exception as e:
                                print(f"  [WARNING] Failed to decode base64: {e}")
    
    return images


def extract_image_from_messages(messages: list) -> tuple[bytes | None, str | None]:
    """
    Extract first image data from the last HumanMessage if present.
    
    DEPRECATED: Use extract_all_images_from_messages for multi-image support.
    
    Returns:
        Tuple of (image_bytes, mime_type) or (None, None)
    """
    images = extract_all_images_from_messages(messages)
    if images:
        return images[0]
    return None, None


def _parse_data_url(url: str) -> tuple[bytes | None, str | None]:
    """Parse a data URL and extract the binary data and MIME type."""
    try:
        if not url.startswith("data:"):
            return None, None
        
        parts = url.split(",", 1)
        if len(parts) != 2:
            return None, None
        
        header = parts[0]  # data:image/jpeg;base64
        data = parts[1]    # base64 encoded data
        
        # Extract MIME type
        mime_part = header.replace("data:", "").split(";")[0]
        
        # Decode base64
        image_bytes = base64.b64decode(data)
        
        return image_bytes, mime_part
    except Exception as e:
        print(f"  [WARNING] Failed to parse data URL: {e}")
        return None, None


def extract_images_from_state(state: dict) -> dict:
    """
    Extract images from state messages and store in tool state.
    
    This function should be called before the agent processes messages.
    Now supports multiple images!
    """
    messages = state.get("messages", [])
    
    # Extract ALL images from messages
    images = extract_all_images_from_messages(messages)
    
    if images:
        print(f"  📷 [IMAGE EXTRACTOR] Found {len(images)} image(s):")
        for i, (img_data, img_mime) in enumerate(images):
            print(f"      Image {i+1}: {len(img_data)} bytes, mime: {img_mime}")
        set_images_in_state(images)
    else:
        print(f"  ⚠️ [IMAGE EXTRACTOR] No images found in messages")
        clear_image_state()
    
    return state
