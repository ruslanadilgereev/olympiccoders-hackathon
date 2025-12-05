import { Client } from '@langchain/langgraph-sdk';

const LANGGRAPH_API_URL = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || 
  'https://olympiccoders-hackathon-4cbc14aed8d35bde940eb9ca1d8d82ab.eu.langgraph.app';

// Initialize LangGraph client
export const client = new Client({
  apiUrl: LANGGRAPH_API_URL,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  images?: Array<{
    type: 'base64';
    media_type: string;
    data: string;
  }>;
}

export interface StreamEvent {
  event: string;
  data: unknown;
}

export async function createThread(): Promise<string> {
  const thread = await client.threads.create();
  return thread.thread_id;
}

export async function sendMessage(
  threadId: string,
  message: string,
  images?: string[]
): Promise<AsyncGenerator<StreamEvent>> {
  const messageContent: ChatMessage['content'] | Array<unknown> = images?.length
    ? [
        { type: 'text', text: message },
        ...images.map((img) => ({
          type: 'image_url',
          image_url: { url: `data:image/png;base64,${img}` },
        })),
      ]
    : message;

  const input = {
    messages: [
      {
        role: 'user',
        content: messageContent,
      },
    ],
  };

  return client.runs.stream(threadId, 'agent', {
    input,
    streamMode: 'messages',
  });
}

export async function* streamMessage(
  threadId: string,
  message: string,
  images?: string[]
): AsyncGenerator<{ type: 'text' | 'image' | 'done'; content: string }> {
  const messageContent = images?.length
    ? [
        { type: 'text', text: message },
        ...images.map((img) => ({
          type: 'image_url',
          image_url: { url: `data:image/png;base64,${img}` },
        })),
      ]
    : message;

  const input = {
    messages: [
      {
        role: 'user',
        content: messageContent,
      },
    ],
  };

  const stream = client.runs.stream(threadId, 'agent', {
    input,
    streamMode: 'messages',
  });

  let fullResponse = '';
  const detectedImages: string[] = [];

  for await (const event of stream) {
    if (event.event === 'messages/partial') {
      const data = event.data as Array<{ content?: string; type?: string }>;
      for (const msg of data) {
        if (msg.content && typeof msg.content === 'string') {
          fullResponse = msg.content;
          yield { type: 'text', content: fullResponse };
        }
      }
    } else if (event.event === 'messages/complete') {
      const data = event.data as Array<{ content?: string; tool_calls?: Array<{ name: string; args: Record<string, unknown> }> }>;
      for (const msg of data) {
        // Check for tool results with images
        if (msg.tool_calls) {
          for (const call of msg.tool_calls) {
            if (call.name === 'generate_design_image' && call.args) {
              // Image was generated, will be in the response
            }
          }
        }
      }
    }
  }

  // Extract any base64 images from the response
  const base64Pattern = /image_base64['":\s]+['"]([A-Za-z0-9+/=]+)['"]/g;
  let match;
  while ((match = base64Pattern.exec(fullResponse)) !== null) {
    detectedImages.push(match[1]);
    yield { type: 'image', content: match[1] };
  }

  yield { type: 'done', content: fullResponse };
}

export async function getThreadHistory(threadId: string) {
  return client.threads.getState(threadId);
}

