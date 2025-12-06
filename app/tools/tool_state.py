"""Global tool state for sharing data between middleware and tools.

This allows middleware to extract images from messages and make them
available to tools without the agent needing to pass them.
"""
from typing import Optional, Any

# Global state dictionary
_tool_state: dict = {
    "image_data": None,
    "image_mime": None,
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


