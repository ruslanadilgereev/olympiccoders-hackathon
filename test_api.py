"""Test the deployed hackathon agent."""
import asyncio
import os
from langgraph_sdk import get_client

# Set LANGSMITH_API_KEY in your environment or .env file
# os.environ["LANGSMITH_API_KEY"] = "your-key-here"

async def test():
    client = get_client(url='https://olympiccoders-hackathon-4cbc14aed8d35bde940eb9ca1d8d82ab.eu.langgraph.app')
    
    # Erst Thread erstellen
    thread = await client.threads.create()
    print(f"Thread erstellt: {thread['thread_id']}")
    
    # Dann Run starten und warten
    result = await client.runs.wait(
        thread_id=thread['thread_id'],
        assistant_id='agent',
        input={'messages': [{'role': 'user', 'content': 'Hallo! Wer bist du? Antworte kurz.'}]},
    )
    
    # Letzte Nachricht ausgeben
    messages = result.get('messages', [])
    if messages:
        last_msg = messages[-1]
        content = last_msg.get('content', str(last_msg))
        print(f"\nAntwort vom Agent:\n{content}")

if __name__ == "__main__":
    asyncio.run(test())

