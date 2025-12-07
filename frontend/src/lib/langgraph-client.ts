import { Client } from '@langchain/langgraph-sdk';

const LANGGRAPH_API_URL =
  process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || 'http://127.0.0.1:2024';
const LANGSMITH_API_KEY = process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || '';
const PRESET_ASSISTANT_ID = process.env.NEXT_PUBLIC_ASSISTANT_ID || '';

// Initialize LangGraph client
export const client = new Client({
  apiUrl: LANGGRAPH_API_URL,
  apiKey: LANGSMITH_API_KEY,
});

let cachedAssistantId: string | null = PRESET_ASSISTANT_ID || null;

async function ensureAssistantId(): Promise<string> {
  if (cachedAssistantId) return cachedAssistantId;

  const assistant = await client.assistants.create({
    graphId: 'agent',
    name: 'Mimicry Assistant',
  });

  cachedAssistantId = assistant.assistant_id;
  return cachedAssistantId;
}

export interface StreamChunk {
  type: 'text' | 'tool_start' | 'tool_end' | 'tool_progress' | 'image' | 'code' | 'thinking' | 'thought' | 'done' | 'error' | 'run_id' | 'cancelled';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  imageUrl?: string;
  code?: string;
  step?: number;
  totalSteps?: number;
  runId?: string;
}

/**
 * Cancel a running agent execution.
 * The agent's state is preserved via checkpointing, so follow-up messages
 * will have full context of what was done before cancellation.
 */
export async function cancelRun(threadId: string, runId: string): Promise<void> {
  try {
    await client.runs.cancel(threadId, runId);
  } catch (error) {
    console.warn('Error cancelling run:', error);
    // Don't throw - the run might have already completed
  }
}

export async function createThread(): Promise<string> {
  const thread = await client.threads.create();
  return thread.thread_id;
}

// Helper to extract text content from various formats
function extractTextContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part?.text) return part.text;
        if (part?.content) return extractTextContent(part.content);
        return '';
      })
      .join('');
  }
  if (content && typeof content === 'object') {
    const obj = content as Record<string, unknown>;
    if (obj.text) return String(obj.text);
    if (obj.content) return extractTextContent(obj.content);
  }
  return '';
}

// Deduplication tracker for streaming
// NOTE: Tools can be called MULTIPLE TIMES with same name (e.g., generate_screen x4)
// We use unique call IDs (incrementing counter) to track each invocation separately
class StreamState {
  private lastYieldedText = '';
  private lastYieldedCodeHash = ''; // Track last code content to avoid duplicates
  private yieldedImages = new Set<string>();
  private hasYieldedThinking = false;
  
  // Track active tool calls by unique ID (tool_name + counter)
  private toolCallCounter = 0;
  private activeToolCalls = new Map<string, number>(); // toolName -> callId

  shouldYieldText(text: string): boolean {
    const trimmed = text.trim();
    if (!trimmed || trimmed === this.lastYieldedText.trim()) {
      return false;
    }
    this.lastYieldedText = text;
    return true;
  }

  // Tool start: always yield, track with unique call ID
  shouldYieldToolStart(toolName: string): boolean {
    // If this tool is already active, still allow it (nested/parallel calls)
    // Generate unique call ID for this invocation
    this.toolCallCounter++;
    this.activeToolCalls.set(toolName, this.toolCallCounter);
    return true; // Always yield tool starts
  }

  // Tool end: always yield, clean up tracking
  shouldYieldToolEnd(toolName: string): boolean {
    // Clean up the active call tracking
    this.activeToolCalls.delete(toolName);
    return true; // Always yield tool ends
  }

  shouldYieldCode(toolName: string, code: string): boolean {
    // Generate a more robust hash that samples from different parts of the code
    // This catches changes in the middle of files (like color changes)
    const len = code.length;
    const mid = Math.floor(len / 2);
    const codeHash = code.slice(0, 50) + code.slice(mid, mid + 50) + code.slice(-50) + len;
    
    // Don't yield if exact same code was already yielded
    if (this.lastYieldedCodeHash === codeHash) {
      return false;
    }
    
    this.lastYieldedCodeHash = codeHash;
    return true; // Always yield code (after hash dedup)
  }

  shouldYieldImage(imageKey: string): boolean {
    if (this.yieldedImages.has(imageKey)) return false;
    this.yieldedImages.add(imageKey);
    return true;
  }

  shouldYieldThinking(): boolean {
    if (this.hasYieldedThinking) return false;
    this.hasYieldedThinking = true;
    return true;
  }

  getLastText(): string {
    return this.lastYieldedText;
  }
}

export async function* streamMessage(
  threadId: string,
  message: string,
  images?: string[]
): AsyncGenerator<StreamChunk> {
  const assistantId = await ensureAssistantId();

  const messageContent = images?.length
    ? [
        { type: 'text', text: message },
        ...images.map((img) => ({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${img}` },
        })),
      ]
    : message;

  const input = {
    messages: [{ role: 'user', content: messageContent }],
  };

  try {
    const stream = client.runs.stream(threadId, assistantId || 'agent', {
      input,
      streamMode: ['events', 'values'],
      config: {
        recursion_limit: 100,
      },
    });

    const state = new StreamState();
    let streamingText = '';
    let runIdYielded = false;

    for await (const event of stream) {
      // Yield run ID on first event so caller can cancel if needed
      if (!runIdYielded) {
        // The run_id is available from the stream's internal state
        // We extract it from metadata events or use the thread context
        const eventData = event.data as Record<string, unknown>;
        const runId = eventData?.run_id as string | undefined;
        if (runId) {
          yield { type: 'run_id', content: '', runId };
          runIdYielded = true;
        }
      }
      try {
        const eventType = event.event as string;
        const data = event.data as Record<string, unknown>;

        // Handle nested events (from 'events' stream mode)
        if (eventType === 'events' && data?.event) {
          const nestedEvent = data.event as string;
          const nestedData = data.data as Record<string, unknown>;

          if (nestedEvent === 'on_tool_start') {
            const toolName = (data.name as string) || 'unknown_tool';
            if (state.shouldYieldThinking()) {
              yield { type: 'thinking', content: 'Processing...' };
            }
            if (state.shouldYieldToolStart(toolName)) {
              yield {
                type: 'tool_start',
                content: `Running ${toolName}...`,
                toolName,
                toolArgs: nestedData as Record<string, unknown>,
              };
            }
          } else if (nestedEvent === 'on_tool_end') {
            const toolName = (data.name as string) || 'unknown_tool';
            const output = nestedData?.output as Record<string, unknown>;
            
            // Check for code
            if (output?.code && typeof output.code === 'string' && state.shouldYieldCode(toolName, output.code)) {
              yield {
                type: 'code',
                content: 'Code generated',
                code: output.code,
                toolName,
              };
            }
            
            if (state.shouldYieldToolEnd(toolName)) {
              // Show actual result, not just "Completed"
              let toolResult: string;
              if (output?.error) {
                toolResult = output.error as string;
              } else if (output?.ai_notes) {
                toolResult = output.ai_notes as string;
              } else if (output) {
                toolResult = JSON.stringify(output, null, 2);
              } else {
                toolResult = 'Completed';
              }
              yield {
                type: 'tool_end',
                content: toolResult,
                toolName,
              };
            }
          } else if (nestedEvent === 'on_chat_model_stream') {
            const chunk = nestedData?.chunk as Record<string, unknown>;
            if (chunk?.content) {
              const newContent = extractTextContent(chunk.content);
              if (newContent) {
                streamingText += newContent;
                if (state.shouldYieldText(streamingText)) {
                  yield { type: 'text', content: streamingText };
                }
              }
            }
          }
          continue;
        }

        // Handle direct event types
        switch (eventType) {
          case 'metadata': {
            // Metadata event contains run_id
            const runId = data?.run_id as string | undefined;
            if (runId && !runIdYielded) {
              yield { type: 'run_id', content: '', runId };
              runIdYielded = true;
            }
            break;
          }

          case 'on_chat_model_start':
            if (state.shouldYieldThinking()) {
              yield { type: 'thinking', content: 'Processing...' };
            }
            break;

          case 'on_chat_model_stream': {
            const chunk = data?.chunk as Record<string, unknown>;
            let newContent = extractTextContent(chunk?.content);
            if (!newContent && chunk?.kwargs) {
              const kwargs = chunk.kwargs as Record<string, unknown>;
              newContent = extractTextContent(kwargs.content);
            }
            if (newContent) {
              streamingText += newContent;
              if (state.shouldYieldText(streamingText)) {
                yield { type: 'text', content: streamingText };
              }
            }
            break;
          }

          case 'on_tool_start': {
            const toolName = (data?.name as string) || 'unknown_tool';
            if (state.shouldYieldToolStart(toolName)) {
              yield {
                type: 'tool_start',
                content: `Running ${toolName}...`,
                toolName,
                toolArgs: (data?.input as Record<string, unknown>) || {},
              };
            }
            break;
          }

          case 'on_tool_end': {
            const toolName = (data?.name as string) || 'unknown_tool';
            const toolOutput = data?.output;
            let toolResult = 'Completed';
            let extractedCode: string | undefined;

            if (typeof toolOutput === 'string') {
              try {
                const parsed = JSON.parse(toolOutput);
                if (parsed.code && typeof parsed.code === 'string') {
                  extractedCode = parsed.code;
                }
                // Show actual result, not just "Completed"
              if (parsed.error) {
                toolResult = parsed.error;
              } else if (parsed.ai_notes) {
                toolResult = parsed.ai_notes;
              } else {
                toolResult = JSON.stringify(parsed, null, 2);
              }
              } catch {
                toolResult = toolOutput;
              }
            } else if (toolOutput && typeof toolOutput === 'object') {
              const outputObj = toolOutput as Record<string, unknown>;

              // Handle images
              if (outputObj.filename) {
                const filename = outputObj.filename as string;
                const imageUrl = `/api/outputs/${filename}`;
                if (state.shouldYieldImage(imageUrl)) {
                  yield { type: 'image', content: filename, imageUrl };
                }
              } else if (outputObj.image_base64) {
                const imageData = outputObj.image_base64 as string;
                if (state.shouldYieldImage(imageData.slice(0, 50))) {
                  yield { type: 'image', content: imageData };
                }
              }

              // Handle code
              if (outputObj.code && typeof outputObj.code === 'string') {
                extractedCode = outputObj.code;
              }

              // Show the actual result data, not just "Completed"
            if (outputObj.error) {
              toolResult = outputObj.error as string;
            } else if (outputObj.ai_notes) {
              toolResult = outputObj.ai_notes as string;
            } else {
              // Show the full result as formatted JSON
              toolResult = JSON.stringify(outputObj, null, 2);
            }
            }

            // Yield code first
            if (extractedCode && state.shouldYieldCode(toolName, extractedCode)) {
              yield {
                type: 'code',
                content: 'Code generated',
                code: extractedCode,
                toolName,
              };
            }

            if (state.shouldYieldToolEnd(toolName)) {
              yield { type: 'tool_end', content: toolResult, toolName };
            }
            break;
          }

          case 'values': {
            // Final state - only process if we haven't streamed text yet
            // This prevents duplicate text when streaming worked properly
            if (data?.messages && Array.isArray(data.messages)) {
              const messages = data.messages as Record<string, unknown>[];
              
              // Only yield final text if nothing was streamed (fallback)
              // The shouldYieldText check will prevent duplicates
              const lastText = state.getLastText();
              if (!lastText) {
                // Find the last AI message only if we haven't streamed anything
                for (let i = messages.length - 1; i >= 0; i--) {
                  const msg = messages[i];
                  if (msg?.type === 'ai' || msg?.role === 'assistant') {
                    const content = extractTextContent(msg.content);
                    if (content && state.shouldYieldText(content)) {
                      yield { type: 'text', content };
                    }
                    break;
                  }
                }
              }

              // Check for code in tool messages (fallback)
              for (const msg of messages) {
                if (msg.type === 'tool' && msg.content) {
                  try {
                    const content = typeof msg.content === 'string'
                      ? JSON.parse(msg.content)
                      : msg.content;
                    if (content?.code && typeof content.code === 'string') {
                      const msgToolName = (msg.name as string) || 'image_to_code';
                      if (state.shouldYieldCode(msgToolName, content.code)) {
                        yield {
                          type: 'code',
                          content: 'Code generated',
                          code: content.code,
                          toolName: msgToolName,
                        };
                      }
                    }
                  } catch {
                    // Not JSON
                  }
                }
              }
            }
            break;
          }

          case 'error':
            yield { type: 'error', content: String(data?.error || 'Unknown error') };
            break;
        }
      } catch (parseError) {
        console.warn('Error parsing stream event:', parseError);
      }
    }

    yield { type: 'done', content: state.getLastText() };

  } catch (error) {
    console.error('Stream error:', error);
    const errorStr = error instanceof Error ? error.message : String(error);

    // Check if this was a cancellation
    if (errorStr.includes('cancel') || errorStr.includes('abort') || errorStr.includes('interrupted')) {
      yield { type: 'cancelled', content: 'Generation stopped. You can continue with a follow-up message.' };
      yield { type: 'done', content: state.getLastText() };
      return;
    }

    let errorMessage = 'Failed to connect to AI';
    if (errorStr.includes('529') || errorStr.includes('overloaded')) {
      errorMessage = 'The API is currently overloaded. Please wait a moment and try again.';
    } else if (errorStr.includes('400') || errorStr.includes('BadRequest')) {
      errorMessage = 'Request error. Try with a different image or shorter message.';
    } else if (errorStr.includes('401') || errorStr.includes('Unauthorized')) {
      errorMessage = 'Invalid API key. Please check configuration.';
    } else if (errorStr.includes('500') || errorStr.includes('Internal')) {
      errorMessage = 'Server error. Please try again shortly.';
    } else if (errorStr.includes('timeout') || errorStr.includes('TIMEOUT')) {
      errorMessage = 'Request timed out. The operation took too long.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    yield { type: 'error', content: errorMessage };
    yield { type: 'done', content: '' };
  }
}

export async function getThreadHistory(threadId: string) {
  return client.threads.getState(threadId);
}
