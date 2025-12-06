#!/usr/bin/env python3
"""Performance test: 3 turns - generate login screen, convert to code, modify button color."""

import sys
import os
import time
import re
import base64
from typing import Optional, Tuple

try:
    from langgraph_sdk import get_sync_client
except ImportError:
    print("❌ langgraph-sdk not installed. Installing...")
    os.system("pip install langgraph-sdk")
    from langgraph_sdk import get_sync_client

# Default LangGraph dev server URL
DEFAULT_URL = "http://127.0.0.1:2024"
GRAPH_ID = "agent"


def extract_image_filename(response_text: str) -> Optional[str]:
    """Extract image filename from response text."""
    # Look for patterns like /outputs/design_xxx.png or design_xxx.png
    patterns = [
        r'/outputs/(design_[a-f0-9]+_\d{8}_\d{6}\.png)',
        r'outputs/(design_[a-f0-9]+_\d{8}_\d{6}\.png)',
        r'design_([a-f0-9]+_\d{8}_\d{6}\.png)',
        r'design_([a-f0-9]+_\d{8}_\d{6})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, response_text)
        if match:
            filename = match.group(1) if '(' in pattern else match.group(0)
            # Ensure .png extension
            if not filename.endswith('.png'):
                filename += '.png'
            return filename
    
    return None


def get_latest_image_from_outputs() -> Optional[str]:
    """Get the most recently created image from outputs folder."""
    outputs_dir = "outputs"
    if not os.path.exists(outputs_dir):
        return None
    
    # Get all PNG files
    image_files = [
        f for f in os.listdir(outputs_dir)
        if f.startswith("design_") and f.endswith(".png")
    ]
    
    if not image_files:
        return None
    
    # Sort by modification time (newest first)
    image_files.sort(
        key=lambda f: os.path.getmtime(os.path.join(outputs_dir, f)),
        reverse=True
    )
    
    return image_files[0]


def read_image_as_base64(image_path: str) -> Optional[str]:
    """Read image file and return as base64 string."""
    try:
        if not os.path.exists(image_path):
            return None
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
            return base64.b64encode(image_bytes).decode('utf-8')
    except Exception as e:
        print(f"⚠️ Error reading image: {e}")
        return None


def send_message_and_get_response(client, thread_id: str, assistant_id: str, message: str, image_base64: Optional[str] = None) -> Tuple[str, float, dict]:
    """
    Send a message and get the full response with timing.
    Returns: (response_text, elapsed_time, stats_dict)
    """
    print(f"\n📤 Sending: {message[:60]}...")
    if image_base64:
        image_size_kb = len(image_base64) * 3 / 4 / 1024  # Approximate size
        print(f"   📸 With image (~{image_size_kb:.1f} KB base64)")
    
    start_time = time.time()
    
    # Prepare message content - IMPORTANT: Images must be sent as image_url type, not text!
    if image_base64:
        # Format: Array with text and image_url objects (like Gemini expects)
        message_content = [
            {"type": "text", "text": message},
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{image_base64}"
                }
            }
        ]
    else:
        message_content = message
    
    # Stream the run
    stream = client.runs.stream(
        thread_id=thread_id,
        assistant_id=assistant_id,
        input={
            "messages": [
                {
                    "role": "user",
                    "content": message_content
                }
            ]
        },
        stream_mode=["events", "messages", "values"]
    )
    
    # Process streaming events
    current_text = ""
    last_printed_text = ""
    tools_used = []
    tool_times = {}
    tool_outputs = {}  # Store tool outputs to extract code
    
    for event in stream:
        try:
            event_type = getattr(event, 'event', None)
            event_data = getattr(event, 'data', {})
            
            if not event_type:
                continue
            
            # Handle nested events structure
            if event_type == "events" and isinstance(event_data, dict):
                nested_event = event_data.get('event', '')
                nested_data = event_data.get('data', {})
                if nested_event:
                    event_type = nested_event
                    event_data = nested_data
            
            # Track tool usage
            if event_type == "on_tool_start":
                nested_data = event_data.get('data', {}) if isinstance(event_data, dict) else event_data
                # Try multiple ways to get tool name
                tool_name = (nested_data.get('name', '') if isinstance(nested_data, dict) else '') or \
                           (event_data.get('name', '') if isinstance(event_data, dict) else '') or \
                           'unknown_tool'
                if tool_name not in tools_used:
                    tools_used.append(tool_name)
                    tool_times[tool_name] = time.time()
                    print(f"\n   🔧 Tool started: {tool_name}")
            
            elif event_type == "on_tool_end":
                nested_data = event_data.get('data', {}) if isinstance(event_data, dict) else event_data
                # Try multiple ways to get tool name
                tool_name = (nested_data.get('name', '') if isinstance(nested_data, dict) else '') or \
                           (event_data.get('name', '') if isinstance(event_data, dict) else '') or \
                           'unknown_tool'
                if tool_name in tool_times:
                    start_time = tool_times[tool_name]
                    if isinstance(start_time, float) and start_time > 1000000000:  # It's a timestamp
                        elapsed = time.time() - start_time
                    else:
                        elapsed = start_time  # Already elapsed time
                    tool_times[tool_name] = elapsed
                    print(f"   ✅ Tool finished: {tool_name} ({elapsed:.2f}s)")
                
                # Store tool output to extract code later
                tool_output = nested_data.get('output', {}) if isinstance(nested_data, dict) else {}
                if isinstance(tool_output, dict):
                    if tool_output.get('code'):
                        tool_outputs[tool_name] = tool_output
                        print(f"   📝 Code found in {tool_name} output ({len(tool_output.get('code', ''))} chars)")
                    # Also check if output is a string that might contain JSON with code
                    elif isinstance(tool_output, str):
                        try:
                            parsed = json.loads(tool_output)
                            if isinstance(parsed, dict) and parsed.get('code'):
                                tool_outputs[tool_name] = parsed
                                print(f"   📝 Code found in {tool_name} output (JSON string)")
                        except:
                            pass
            
            # Handle streaming text
            if event_type == "on_chat_model_stream":
                chunk_data = event_data.get('chunk', {}) if isinstance(event_data, dict) else {}
                content = None
                if isinstance(chunk_data, dict):
                    content = chunk_data.get('content', '')
                    if not content and 'kwargs' in chunk_data:
                        kwargs = chunk_data.get('kwargs', {})
                        content = kwargs.get('content', '') if isinstance(kwargs, dict) else ''
                
                if isinstance(content, str) and content:
                    current_text += content
                    if current_text != last_printed_text:
                        print(f"\r🤖 {current_text[:100]}...", end="", flush=True)
                        last_printed_text = current_text
            
            elif event_type == "values":
                messages = event_data.get("messages", []) if isinstance(event_data, dict) else []
                for msg in reversed(messages):
                    if isinstance(msg, dict) and (msg.get("type") == "ai" or msg.get("role") == "assistant"):
                        content = msg.get("content", "")
                        if isinstance(content, str) and content and content != current_text:
                            current_text = content
                            print(f"\r🤖 {current_text[:100]}...", end="", flush=True)
                            last_printed_text = current_text
                        break
        
        except Exception:
            continue
    
    elapsed_time = time.time() - start_time
    print(f"\r{' ' * 120}\r", end="")  # Clear line
    
    stats = {
        "tools_used": tools_used,
        "tool_times": tool_times,
        "response_length": len(current_text),
        "tool_outputs": tool_outputs
    }
    
    return current_text, elapsed_time, stats


def test_performance():
    """Run 3-turn performance test."""
    api_url = os.getenv("LANGGRAPH_API_URL", DEFAULT_URL)
    
    print("=" * 70)
    print("🚀 PERFORMANCE TEST: 3 Turns")
    print("=" * 70)
    print("Turn 1: Generate login screen (image)")
    print("Turn 2: Convert image to code")
    print("Turn 3: Modify button color (should be fast - 1 line change)")
    print("=" * 70)
    
    # Initialize client
    client = get_sync_client(url=api_url)
    
    # Create thread and assistant
    print("\n📋 Setting up...")
    thread = client.threads.create()
    thread_id = thread.get("thread_id") if isinstance(thread, dict) else thread.thread_id
    
    assistant = client.assistants.create(
        graph_id=GRAPH_ID,
        name="Performance Test Assistant"
    )
    assistant_id = assistant.get("assistant_id") if isinstance(assistant, dict) else assistant.assistant_id
    
    print(f"✅ Thread: {thread_id[:8]}...")
    print(f"✅ Assistant: {assistant_id[:8]}...")
    
    results = []
    
    # TURN 1: Generate login screen
    print("\n" + "=" * 70)
    print("TURN 1: Generate Login Screen")
    print("=" * 70)
    
    turn1_message = "Erstelle ein modernes Login-Formular mit Email und Passwort Feldern"
    response1, time1, stats1 = send_message_and_get_response(client, thread_id, assistant_id, turn1_message)
    
    print(f"✅ Turn 1 completed in {time1:.2f} seconds")
    if stats1["tools_used"]:
        print(f"   Tools used: {', '.join(stats1['tools_used'])}")
        for tool, tool_time in stats1["tool_times"].items():
            if isinstance(tool_time, float) and tool_time > 0:
                print(f"   - {tool}: {tool_time:.2f}s")
    results.append(("Turn 1: Generate Image", time1))
    
    # Extract image filename from response, or get latest from outputs
    image_filename = extract_image_filename(response1)
    
    # If we couldn't extract from response, try to get the latest image from outputs
    if not image_filename:
        print("⚠️ Could not extract image filename from response, trying latest from outputs...")
        image_filename = get_latest_image_from_outputs()
        if image_filename:
            print(f"📸 Using latest image from outputs: {image_filename}")
    
    image_base64 = None
    if image_filename:
        image_path = os.path.join("outputs", image_filename)
        if os.path.exists(image_path):
            print(f"📸 Found image: {image_filename}")
            image_base64 = read_image_as_base64(image_path)
            if image_base64:
                size_kb = len(image_base64) * 3 / 4 / 1024  # Approximate size
                print(f"   Image size: ~{size_kb:.1f} KB (base64)")
            else:
                print(f"⚠️ Could not read image from {image_path}")
        else:
            print(f"⚠️ Image file not found: {image_path}")
    else:
        print("❌ Could not find any image to use for Turn 2")
        print(f"Response preview: {response1[:300]}...")
    
    # TURN 2: Convert image to code
    print("\n" + "=" * 70)
    print("TURN 2: Convert Image to Code")
    print("=" * 70)
    
    if image_base64:
        turn2_message = "Wandle dieses Bild in React + Tailwind Code um"
    else:
        turn2_message = "Wandle das generierte Login-Formular Bild in React + Tailwind Code um"
    
    response2, time2, stats2 = send_message_and_get_response(client, thread_id, assistant_id, turn2_message, image_base64)
    
    print(f"✅ Turn 2 completed in {time2:.2f} seconds")
    if stats2["tools_used"]:
        print(f"   Tools used: {', '.join(stats2['tools_used'])}")
        for tool, tool_time in stats2["tool_times"].items():
            if isinstance(tool_time, float) and tool_time > 0:
                print(f"   - {tool}: {tool_time:.2f}s")
    # Check if code was generated
    if "code" in response2.lower() or "react" in response2.lower():
        print(f"   📝 Code generation detected in response")
    results.append(("Turn 2: Convert to Code", time2))
    
    # TURN 3: Modify button color
    print("\n" + "=" * 70)
    print("TURN 3: Modify Button Color (Should be FAST - 1 line change)")
    print("=" * 70)
    
    # Extract code from Turn 2 - check tool outputs first (where code actually is)
    code_from_turn2 = None
    
    # First, try to get code from tool outputs
    if stats2.get("tool_outputs"):
        for tool_name, tool_output in stats2["tool_outputs"].items():
            if isinstance(tool_output, dict) and tool_output.get("code"):
                code_from_turn2 = tool_output["code"]
                print(f"📝 Found code from {tool_name} tool output ({len(code_from_turn2)} chars)")
                break
    
    # Fallback: Look for code blocks in response text
    if not code_from_turn2:
        code_match = re.search(r'```(?:tsx|ts|jsx|js)?\n(.*?)```', response2, re.DOTALL)
        if code_match:
            code_from_turn2 = code_match.group(1).strip()
            print(f"📝 Found code from Turn 2 response text ({len(code_from_turn2)} chars)")
    
    if not code_from_turn2:
        print("⚠️ Could not extract code from Turn 2")
        print("   Agent will need to retrieve code from state or regenerate")
        print("   This will make Turn 3 slower!")
    
    # Build message with code context (like frontend does)
    if code_from_turn2:
        turn3_message = f"""Current code:
```tsx
{code_from_turn2}
```

Mache den Login-Button rot"""
    else:
        turn3_message = "Mache den Login-Button rot"
    
    response3, time3, stats3 = send_message_and_get_response(client, thread_id, assistant_id, turn3_message)
    
    print(f"✅ Turn 3 completed in {time3:.2f} seconds")
    if stats3["tools_used"]:
        print(f"   Tools used: {', '.join(stats3['tools_used'])}")
        for tool, tool_time in stats3["tool_times"].items():
            if isinstance(tool_time, float) and tool_time > 0:
                print(f"   - {tool}: {tool_time:.2f}s")
    # Check if modification was done
    if "rot" in response3.lower() or "red" in response3.lower() or "bg-red" in response3.lower():
        print(f"   ✅ Color modification detected")
    results.append(("Turn 3: Modify Button Color", time3))
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 PERFORMANCE SUMMARY")
    print("=" * 70)
    
    total_time = sum(t for _, t in results)
    
    for turn_name, turn_time in results:
        percentage = (turn_time / total_time) * 100 if total_time > 0 else 0
        print(f"{turn_name:35} {turn_time:6.2f}s ({percentage:5.1f}%)")
    
    print("-" * 70)
    print(f"{'TOTAL':35} {total_time:6.2f}s")
    print("=" * 70)
    
    # Analysis
    print("\n📈 ANALYSIS:")
    if time3 < time1 * 0.3:  # If turn 3 is less than 30% of turn 1
        print("✅ Turn 3 is FAST (as expected - simple code modification)")
    else:
        print("⚠️ Turn 3 is slower than expected for a simple 1-line change")
    
    if time2 > time1:
        print("ℹ️ Turn 2 (code generation) took longer than Turn 1 (image generation)")
    else:
        print("ℹ️ Turn 1 (image generation) took longer than Turn 2 (code generation)")
    
    print("\n✅ Performance test completed!")


if __name__ == "__main__":
    try:
        test_performance()
    except KeyboardInterrupt:
        print("\n\n⚠️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

