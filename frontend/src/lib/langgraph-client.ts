import { Client } from '@langchain/langgraph-sdk';

const LANGGRAPH_API_URL = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || 
  'https://olympiccoders-hackathon-4cbc14aed8d35bde940eb9ca1d8d82ab.eu.langgraph.app';

const LANGSMITH_API_KEY = process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || '';

// Initialize LangGraph client
export const client = new Client({
  apiUrl: LANGGRAPH_API_URL,
  apiKey: LANGSMITH_API_KEY,
});

export interface StreamChunk {
  type: 'text' | 'tool_start' | 'tool_end' | 'image' | 'thinking' | 'done' | 'error';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
}

export async function createThread(): Promise<string> {
  const thread = await client.threads.create();
  return thread.thread_id;
}

export async function* streamMessage(
  threadId: string,
  message: string,
  images?: string[]
): AsyncGenerator<StreamChunk> {
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

  try {
    // Stream with events mode for detailed updates
    const stream = client.runs.stream(threadId, 'agent', {
      input,
      streamMode: 'events',
    });

    let currentText = '';
    let lastYieldedText = '';
    const detectedImages: string[] = [];
    const activeTools: Set<string> = new Set();

    for await (const event of stream) {
      try {
        const eventType = event.event;
        const data = event.data as Record<string, unknown>;

        // Handle different event types
        switch (eventType) {
          case 'on_chat_model_start':
            yield { type: 'thinking', content: 'Thinking...' };
            break;

          case 'on_chat_model_stream':
            // Streaming text chunks
            if (data?.chunk) {
              const chunk = data.chunk as { content?: string | Array<{ text?: string }> };
              let newContent = '';
              
              if (typeof chunk.content === 'string') {
                newContent = chunk.content;
              } else if (Array.isArray(chunk.content)) {
                for (const part of chunk.content) {
                  if (part.text) {
                    newContent += part.text;
                  }
                }
              }
              
              if (newContent) {
                currentText += newContent;
                if (currentText !== lastYieldedText) {
                  lastYieldedText = currentText;
                  yield { type: 'text', content: currentText };
                }
              }
            }
            break;

          case 'on_chat_model_end':
            // Model finished generating
            if (data?.output) {
              const output = data.output as { content?: string | Array<{ text?: string }> };
              if (typeof output.content === 'string') {
                currentText = output.content;
              } else if (Array.isArray(output.content)) {
                currentText = output.content.map(p => p.text || '').join('');
              }
              if (currentText !== lastYieldedText) {
                lastYieldedText = currentText;
                yield { type: 'text', content: currentText };
              }
            }
            break;

          case 'on_tool_start':
            // Tool execution starting
            const toolName = (data?.name as string) || 'unknown_tool';
            const toolArgs = data?.input as Record<string, unknown> || {};
            activeTools.add(toolName);
            
            yield { 
              type: 'tool_start', 
              content: `Using ${toolName}...`,
              toolName,
              toolArgs,
            };
            break;

          case 'on_tool_end':
            // Tool execution finished
            const endToolName = (data?.name as string) || 'unknown_tool';
            activeTools.delete(endToolName);
            
            const toolOutput = data?.output;
            let toolResult = '';
            
            if (typeof toolOutput === 'string') {
              toolResult = toolOutput;
            } else if (toolOutput && typeof toolOutput === 'object') {
              // Check for image generation results
              const outputObj = toolOutput as Record<string, unknown>;
              if (outputObj.image_base64) {
                const imageData = outputObj.image_base64 as string;
                detectedImages.push(imageData);
                yield { type: 'image', content: imageData };
              }
              if (outputObj.success) {
                toolResult = outputObj.ai_notes as string || 'Completed successfully';
              } else if (outputObj.error) {
                toolResult = `Error: ${outputObj.error}`;
              } else {
                toolResult = JSON.stringify(toolOutput).slice(0, 200);
              }
            }
            
            yield { 
              type: 'tool_end', 
              content: toolResult,
              toolName: endToolName,
            };
            break;

          case 'on_chain_end':
            // Chain finished - might have final output
            if (data?.output?.messages) {
              const messages = data.output.messages as Array<{ content?: string }>;
              const lastMsg = messages[messages.length - 1];
              if (lastMsg?.content && typeof lastMsg.content === 'string') {
                if (lastMsg.content !== lastYieldedText) {
                  currentText = lastMsg.content;
                  lastYieldedText = currentText;
                  yield { type: 'text', content: currentText };
                }
              }
            }
            break;

          case 'error':
            yield { type: 'error', content: String(data?.error || 'Unknown error') };
            break;

          default:
            // Handle other events - try to extract useful content
            if (data?.messages && Array.isArray(data.messages)) {
              const lastMsg = data.messages[data.messages.length - 1] as { content?: string; role?: string };
              if (lastMsg?.role === 'assistant' && lastMsg?.content) {
                if (typeof lastMsg.content === 'string' && lastMsg.content !== lastYieldedText) {
                  currentText = lastMsg.content;
                  lastYieldedText = currentText;
                  yield { type: 'text', content: currentText };
                }
              }
            }
            break;
        }
      } catch (parseError) {
        console.warn('Error parsing stream event:', parseError, event);
      }
    }

    // Final check for images in the response text
    const base64Pattern = /["']?image_base64["']?\s*:\s*["']([A-Za-z0-9+/=]{100,})["']/g;
    let match;
    while ((match = base64Pattern.exec(currentText)) !== null) {
      if (!detectedImages.includes(match[1])) {
        detectedImages.push(match[1]);
        yield { type: 'image', content: match[1] };
      }
    }

    yield { type: 'done', content: currentText };

  } catch (error) {
    console.error('Stream error:', error);
    yield { 
      type: 'error', 
      content: error instanceof Error ? error.message : 'Failed to connect to AI' 
    };
    yield { type: 'done', content: '' };
  }
}

export async function getThreadHistory(threadId: string) {
  return client.threads.getState(threadId);
}
