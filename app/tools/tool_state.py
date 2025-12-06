"""Global tool state for sharing data between middleware and tools.

This allows middleware to extract images from messages and make them
available to tools without the agent needing to pass them.
"""
from typing import Optional, Any

# Global state dictionary
_tool_state: dict = {
    "image_data": None,
    "image_mime": None,
    "thread_id": None,  # Current chat session ID
    "current_code": None,  # Last generated/modified code
    "component_name": None,  # Current component name
}


def get_tool_state() -> dict:
    """Get the current tool state."""
    return _tool_state


def set_tool_state(state: dict) -> None:
    """Set the tool state."""
    global _tool_state
    _tool_state = state


def get_image_from_state() -> tuple[bytes | None, str | None]:
    """Get image data and mime type from tool state."""
    return _tool_state.get("image_data"), _tool_state.get("image_mime")


def set_image_in_state(image_data: bytes | None, image_mime: str | None) -> None:
    """Set image data in tool state."""
    _tool_state["image_data"] = image_data
    _tool_state["image_mime"] = image_mime


def clear_image_state() -> None:
    """Clear image data from state."""
    _tool_state["image_data"] = None
    _tool_state["image_mime"] = None


def get_thread_id() -> str | None:
    """Get current thread ID from tool state."""
    return _tool_state.get("thread_id")


def set_thread_id(thread_id: str | None) -> None:
    """Set current thread ID in tool state."""
    _tool_state["thread_id"] = thread_id


def get_current_code() -> tuple[str | None, str | None]:
    """Get current code and component name from tool state."""
    return _tool_state.get("current_code"), _tool_state.get("component_name")


def set_current_code(code: str | None, component_name: str | None = None) -> None:
    """Set current code in tool state - called after image_to_code or modify_code."""
    _tool_state["current_code"] = code
    if component_name:
        _tool_state["component_name"] = component_name
    print(f"  💾 [STATE] Code saved: {len(code) if code else 0} chars")


def clear_code_state() -> None:
    """Clear code from state."""
    _tool_state["current_code"] = None
    _tool_state["component_name"] = None
