#!/usr/bin/env python3
"""Simple test script to test the LangGraph backend with a 'hi' message."""

import requests
import json
import sys
from typing import Optional

# Default LangGraph dev server URL
DEFAULT_URL = "http://127.0.0.1:2024"
GRAPH_ID = "agent"


def test_langgraph_backend(message: str = "hi", api_url: Optional[str] = None) -> None:
    """
    Test the LangGraph backend by sending a message.
    
    Args:
        message: The message to send (default: "hi")
        api_url: The LangGraph API URL (default: http://127.0.0.1:2024)
    """
    if api_url is None:
        api_url = DEFAULT_URL
    
    print(f"🧪 Testing LangGraph backend at {api_url}")
    print(f"📤 Sending message: '{message}'")
    print("-" * 50)
    
    # Create a thread
    try:
        print("1️⃣ Creating thread...")
        thread_response = requests.post(
            f"{api_url}/threads",
            headers={"Content-Type": "application/json"},
            json={},  # Empty JSON body
            timeout=10
        )
        thread_response.raise_for_status()
        thread_data = thread_response.json()
        thread_id = thread_data.get("thread_id")
        
        if not thread_id:
            print("❌ Failed to create thread: No thread_id in response")
            print(f"Response: {thread_data}")
            return
        
        print(f"✅ Thread created: {thread_id}")
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error: Could not connect to {api_url}")
        print("💡 Make sure the LangGraph server is running:")
        print("   langgraph dev")
        sys.exit(1)
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating thread: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        sys.exit(1)
    
    # Create an assistant (or use existing)
    try:
        print("\n2️⃣ Creating/getting assistant...")
        assistant_response = requests.post(
            f"{api_url}/assistants",
            headers={"Content-Type": "application/json"},
            json={
                "graph_id": GRAPH_ID,
                "name": "Test Assistant"
            },
            timeout=10
        )
        assistant_response.raise_for_status()
        assistant_data = assistant_response.json()
        assistant_id = assistant_data.get("assistant_id")
        
        if not assistant_id:
            print("❌ Failed to create assistant: No assistant_id in response")
            print(f"Response: {assistant_data}")
            return
        
        print(f"✅ Assistant created: {assistant_id}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating assistant: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        sys.exit(1)
    
    # Send a message
    try:
        print(f"\n3️⃣ Sending message '{message}'...")
        run_response = requests.post(
            f"{api_url}/threads/{thread_id}/runs",
            headers={"Content-Type": "application/json"},
            json={
                "assistant_id": assistant_id,
                "input": {
                    "messages": [
                        {
                            "role": "user",
                            "content": message
                        }
                    ]
                }
            },
            timeout=60  # Longer timeout for AI response
        )
        run_response.raise_for_status()
        run_data = run_response.json()
        run_id = run_data.get("run_id")
        
        if not run_id:
            print("❌ Failed to create run: No run_id in response")
            print(f"Response: {run_data}")
            return
        
        print(f"✅ Run created: {run_id}")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating run: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        sys.exit(1)
    
    # Wait for the run to complete and get the result
    try:
        print("\n4️⃣ Waiting for response...")
        import time
        
        max_wait = 60  # Maximum wait time in seconds
        start_time = time.time()
        check_interval = 1  # Check every second
        
        while time.time() - start_time < max_wait:
            status_response = requests.get(
                f"{api_url}/threads/{thread_id}/runs/{run_id}",
                timeout=10
            )
            status_response.raise_for_status()
            status_data = status_response.json()
            
            status = status_data.get("status")
            print(f"   Status: {status}")
            
            if status in ["success", "error", "cancelled"]:
                break
            
            time.sleep(check_interval)
        
        # Get the final state
        print("\n5️⃣ Getting final response...")
        state_response = requests.get(
            f"{api_url}/threads/{thread_id}/state",
            timeout=10
        )
        state_response.raise_for_status()
        state_data = state_response.json()
        
        # Extract messages from state
        values = state_data.get("values", {})
        messages = values.get("messages", [])
        
        print("\n" + "=" * 50)
        print("📥 RESPONSE:")
        print("=" * 50)
        
        if messages:
            # Print all messages for debugging
            print(f"\nFound {len(messages)} message(s):")
            for i, msg in enumerate(messages):
                msg_type = msg.get("type", msg.get("role", "unknown"))
                print(f"\n  Message {i+1} ({msg_type}):")
                
                content = msg.get("content", "")
                if isinstance(content, str):
                    if content:
                        print(f"    {content}")
                    else:
                        print("    [Empty content]")
                elif isinstance(content, list):
                    # Handle multi-part content
                    for j, part in enumerate(content):
                        if isinstance(part, dict):
                            if part.get("type") == "text":
                                text = part.get("text", "")
                                if text:
                                    print(f"    Part {j+1} (text): {text}")
                            elif part.get("type") == "image_url":
                                print(f"    Part {j+1}: [Image included]")
                            else:
                                print(f"    Part {j+1}: {json.dumps(part, indent=4)}")
                        else:
                            print(f"    Part {j+1}: {part}")
                elif content:
                    print(f"    {json.dumps(content, indent=4)}")
                else:
                    print("    [No content]")
            
            # Get the last AI message specifically
            print("\n" + "-" * 50)
            print("🤖 AI Response:")
            print("-" * 50)
            ai_response_found = False
            for msg in reversed(messages):
                if msg.get("type") == "ai" or msg.get("role") == "assistant":
                    ai_response_found = True
                    content = msg.get("content", "")
                    if isinstance(content, str) and content:
                        print(content)
                    elif isinstance(content, list):
                        # Handle multi-part content
                        for part in content:
                            if isinstance(part, dict):
                                if part.get("type") == "text":
                                    text = part.get("text", "")
                                    if text:
                                        print(text)
                                elif part.get("type") == "image_url":
                                    print("[Image included in response]")
                    break
            
            if not ai_response_found:
                print("⚠️ No AI response found in messages")
        else:
            print("⚠️ No messages in state")
            print(f"\nFull state (first 1000 chars):")
            state_str = json.dumps(state_data, indent=2)
            print(state_str[:1000])
            if len(state_str) > 1000:
                print("... (truncated)")
        
        print("=" * 50)
        print("✅ Test completed!")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error getting response: {e}")
        if hasattr(e.response, 'text'):
            print(f"Response: {e.response.text}")
        sys.exit(1)


if __name__ == "__main__":
    # Get message from command line or use default
    message = sys.argv[1] if len(sys.argv) > 1 else "hi"
    
    # Get API URL from environment or use default
    import os
    api_url = os.getenv("LANGGRAPH_API_URL", DEFAULT_URL)
    
    test_langgraph_backend(message, api_url)

