#!/usr/bin/env python3
"""Test script with streaming support using LangGraph Python SDK."""

import sys
import os
from typing import Optional

try:
    from langgraph_sdk import get_sync_client
except ImportError:
    print("❌ langgraph-sdk not installed. Installing...")
    os.system("pip install langgraph-sdk")
    from langgraph_sdk import get_sync_client

# Default LangGraph dev server URL
DEFAULT_URL = "http://127.0.0.1:2024"
GRAPH_ID = "agent"


def test_langgraph_backend_streaming(message: str = "hi", api_url: Optional[str] = None) -> None:
    """
    Test the LangGraph backend with streaming to see thinking and real-time responses.
    
    Args:
        message: The message to send (default: "hi")
        api_url: The LangGraph API URL (default: http://127.0.0.1:2024)
    """
    if api_url is None:
        api_url = DEFAULT_URL
    
    print(f"🧪 Testing LangGraph backend (STREAMING) at {api_url}")
    print(f"📤 Sending message: '{message}'")
    print("-" * 50)
    
    # Initialize client
    client = get_sync_client(url=api_url)
    
    # Create a thread
    try:
        print("1️⃣ Creating thread...")
        thread = client.threads.create()
        # Handle both dict and object responses
        thread_id = thread.get("thread_id") if isinstance(thread, dict) else getattr(thread, "thread_id", None)
        if not thread_id:
            print(f"❌ Unexpected thread response format: {thread}")
            sys.exit(1)
        print(f"✅ Thread created: {thread_id}")
        
    except Exception as e:
        print(f"❌ Error creating thread: {e}")
        print("💡 Make sure the LangGraph server is running:")
        print("   langgraph dev")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Create an assistant (or use existing)
    try:
        print("\n2️⃣ Creating/getting assistant...")
        assistant = client.assistants.create(
            graph_id=GRAPH_ID,
            name="Test Assistant"
        )
        # Handle both dict and object responses
        assistant_id = assistant.get("assistant_id") if isinstance(assistant, dict) else getattr(assistant, "assistant_id", None)
        if not assistant_id:
            print(f"❌ Unexpected assistant response format: {assistant}")
            sys.exit(1)
        print(f"✅ Assistant created: {assistant_id}")
        
    except Exception as e:
        print(f"❌ Error creating assistant: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Send a message with streaming
    try:
        print(f"\n3️⃣ Sending message '{message}' (with streaming)...")
        print("-" * 50)
        print("📡 Streaming response (you'll see thinking and real-time updates):\n")
        
        # Stream the run
        stream = client.runs.stream(
            thread_id=thread_id,
            assistant_id=assistant_id,
            input={
                "messages": [
                    {
                        "role": "user",
                        "content": message
                    }
                ]
            },
            stream_mode=["events", "messages", "values"]
        )
        
        # Process streaming events
        current_text = ""
        last_printed_text = ""
        thinking_shown = False
        active_tools = set()
        event_count = 0
        
        for event in stream:
            event_count += 1
            try:
                # StreamPart has 'event' and 'data' attributes
                event_type = getattr(event, 'event', None)
                event_data = getattr(event, 'data', {})
                
                if not event_type:
                    continue
                
                # Handle nested events structure (events mode wraps events in 'data')
                if event_type == "events" and isinstance(event_data, dict):
                    # This is a wrapper event, extract the actual event
                    nested_event = event_data.get('event', '')
                    nested_data = event_data.get('data', {})
                    if nested_event:
                        event_type = nested_event
                        event_data = nested_data
                
                # Handle different event types
                if event_type == "on_chat_model_start":
                    if not thinking_shown:
                        print("💭 Thinking...")
                        thinking_shown = True
                
                elif event_type == "on_chat_model_stream":
                    # Streaming text chunks
                    chunk_data = event_data.get('chunk', {}) if isinstance(event_data, dict) else {}
                    
                    # Extract content from chunk
                    content = None
                    if isinstance(chunk_data, dict):
                        content = chunk_data.get('content', '')
                        # Also check kwargs for Gemini format
                        if not content and 'kwargs' in chunk_data:
                            kwargs = chunk_data.get('kwargs', {})
                            content = kwargs.get('content', '') if isinstance(kwargs, dict) else ''
                    elif hasattr(chunk_data, 'content'):
                        content = chunk_data.content
                    elif hasattr(chunk_data, 'kwargs'):
                        kwargs = chunk_data.kwargs
                        content = kwargs.get('content', '') if isinstance(kwargs, dict) else ''
                    
                    if isinstance(content, str) and content:
                        current_text += content
                        if current_text != last_printed_text:
                            print(f"\r🤖 {current_text}", end="", flush=True)
                            last_printed_text = current_text
                    elif isinstance(content, list):
                        for part in content:
                            if isinstance(part, dict) and part.get("type") == "text":
                                text = part.get("text", "")
                                if text:
                                    current_text += text
                                    if current_text != last_printed_text:
                                        print(f"\r🤖 {current_text}", end="", flush=True)
                                        last_printed_text = current_text
                
                elif event_type == "on_tool_start":
                    # event_data contains nested event data
                    nested_data = event_data.get('data', {}) if isinstance(event_data, dict) else event_data
                    # Try multiple ways to get tool name
                    tool_name = (nested_data.get('name', '') if isinstance(nested_data, dict) else '') or \
                               (event_data.get('name', '') if isinstance(event_data, dict) else '') or \
                               'unknown_tool'
                    tool_input = nested_data.get('input', {}) if isinstance(nested_data, dict) else {}
                    active_tools.add(tool_name)
                    print(f"\n🔧 Using tool: {tool_name}")
                    if tool_input:
                        import json
                        args_str = json.dumps(tool_input, indent=2) if isinstance(tool_input, dict) else str(tool_input)
                        if len(args_str) > 200:
                            args_str = args_str[:200] + "..."
                        print(f"   Args: {args_str}")
                
                elif event_type == "on_tool_end":
                    # event_data contains nested event data
                    nested_data = event_data.get('data', {}) if isinstance(event_data, dict) else event_data
                    # Try multiple ways to get tool name
                    tool_name = (nested_data.get('name', '') if isinstance(nested_data, dict) else '') or \
                               (event_data.get('name', '') if isinstance(event_data, dict) else '') or \
                               'unknown_tool'
                    tool_output = nested_data.get('output', {}) if isinstance(nested_data, dict) else {}
                    active_tools.discard(tool_name)
                    
                    # Check for code in output
                    if isinstance(tool_output, dict):
                        if tool_output.get("code"):
                            print(f"\n✅ Code generated by {tool_name}")
                        elif tool_output.get("filename"):
                            print(f"\n✅ Image generated: {tool_output.get('filename')}")
                        else:
                            success = tool_output.get("success", False)
                            if success:
                                notes = tool_output.get("ai_notes", "")
                                if notes:
                                    print(f"\n✅ {tool_name}: {notes}")
                                else:
                                    print(f"\n✅ {tool_name} completed")
                            else:
                                error = tool_output.get("error", "Unknown error")
                                print(f"\n❌ {tool_name} error: {error}")
                    else:
                        print(f"\n✅ {tool_name} completed")
                
                elif event_type == "messages":
                    # Message update
                    messages = event_data.get('messages', []) if isinstance(event_data, dict) else []
                    if isinstance(messages, list):
                        for msg in messages:
                            if isinstance(msg, (list, tuple)) and len(msg) >= 2:
                                msg_type, msg_data = msg[0], msg[1]
                                if msg_type in ["ai", "AIMessageChunk"] and isinstance(msg_data, dict):
                                    content = msg_data.get("content", "")
                                    if isinstance(content, str) and content and content != current_text:
                                        current_text = content
                                        print(f"\r🤖 {current_text}", end="", flush=True)
                                        last_printed_text = current_text
                            elif isinstance(msg, dict):
                                if msg.get("type") == "ai" or msg.get("role") == "assistant":
                                    content = msg.get("content", "")
                                    if isinstance(content, str) and content and content != current_text:
                                        current_text = content
                                        print(f"\r🤖 {current_text}", end="", flush=True)
                                        last_printed_text = current_text
                
                elif event_type == "values":
                    # State update
                    messages = event_data.get("messages", []) if isinstance(event_data, dict) else []
                    for msg in reversed(messages):
                        if isinstance(msg, dict) and (msg.get("type") == "ai" or msg.get("role") == "assistant"):
                            content = msg.get("content", "")
                            if isinstance(content, str) and content and content != current_text:
                                current_text = content
                                print(f"\r🤖 {current_text}", end="", flush=True)
                                last_printed_text = current_text
                            break
                
                # Also handle 'events' wrapper type
                elif event_type == "events":
                    # Already handled above in the nested event extraction
                    pass
                
            except Exception as e:
                # Show errors for debugging (only first few)
                if event_count <= 10:
                    print(f"\n⚠️ Error processing event {event_count} ({event_type}): {e}")
                continue
        
        # Final newline
        print("\n")
        print("=" * 50)
        print("✅ Streaming completed!")
        
        if current_text:
            print(f"\n📝 Final response: {current_text}")
        
    except Exception as e:
        print(f"\n❌ Error during streaming: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    # Get message from command line or use default
    message = sys.argv[1] if len(sys.argv) > 1 else "hi"
    
    # Get API URL from environment or use default
    api_url = os.getenv("LANGGRAPH_API_URL", DEFAULT_URL)
    
    test_langgraph_backend_streaming(message, api_url)
