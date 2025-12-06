import { Client } from '@langchain/langgraph-sdk';

const LANGGRAPH_API_URL = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || 
  'http://127.0.0.1:2024';

const LANGSMITH_API_KEY = process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || '';

// Initialize LangGraph client
export const client = new Client({
  apiUrl: LANGGRAPH_API_URL,
  apiKey: LANGSMITH_API_KEY,
});

export interface StreamChunk {
  type: 'text' | 'tool_start' | 'tool_end' | 'image' | 'code' | 'thinking' | 'done' | 'error';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  imageUrl?: string; // URL to load image from (instead of base64)
  code?: string; // Generated code from image_to_code or modify_code
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
          image_url: { url: `data:image/jpeg;base64,${img}` },
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
    // Use messages-tuple mode for better compatibility with different models
    const stream = client.runs.stream(threadId, 'agent', {
      input,
      streamMode: ['messages-tuple', 'values'],
    });

    let currentText = '';
    let lastYieldedText = '';
    const detectedImages: string[] = [];
    const activeTools: Set<string> = new Set();
    let hasYieldedThinking = false;

    for await (const event of stream) {
      try {
        const eventType = event.event;
        const data = event.data as Record<string, unknown>;

        // Debug log for development
        // console.log('Event:', eventType, data);

        // Handle different event types
        switch (eventType) {
          case 'on_chat_model_start':
            if (!hasYieldedThinking) {
              hasYieldedThinking = true;
              yield { type: 'thinking', content: 'Thinking...' };
            }
            break;

          case 'on_chat_model_stream':
            // Streaming text chunks - handle various formats
            if (data?.chunk) {
              const chunk = data.chunk as Record<string, unknown>;
              let newContent = extractTextContent(chunk.content);
              
              // Also check for Gemini's format with kwargs
              if (!newContent && chunk.kwargs) {
                const kwargs = chunk.kwargs as Record<string, unknown>;
                newContent = extractTextContent(kwargs.content);
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
              const output = data.output as Record<string, unknown>;
              const outputContent = extractTextContent(output.content);
              
              if (outputContent && outputContent !== lastYieldedText) {
                currentText = outputContent;
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
            let extractedCode: string | undefined;
            
            if (typeof toolOutput === 'string') {
              // Try to parse if it's a JSON string
              try {
                const parsed = JSON.parse(toolOutput);
                if (parsed.code && typeof parsed.code === 'string') {
                  extractedCode = parsed.code;
                }
                toolResult = parsed.success ? 'Completed successfully' : (parsed.error || toolOutput);
              } catch {
                toolResult = toolOutput;
              }
            } else if (toolOutput && typeof toolOutput === 'object') {
              const outputObj = toolOutput as Record<string, unknown>;
              
              // Check for image generation results
              if (outputObj.filename) {
                const filename = outputObj.filename as string;
                const imageUrl = `/api/outputs/${filename}`;
                detectedImages.push(imageUrl);
                yield { type: 'image', content: filename, imageUrl };
              }
              else if (outputObj.image_base64) {
                const imageData = outputObj.image_base64 as string;
                detectedImages.push(imageData);
                yield { type: 'image', content: imageData };
              }
              
              // Check for code generation results
              if (outputObj.code && typeof outputObj.code === 'string') {
                extractedCode = outputObj.code;
                console.log(`[LANGGRAPH] Code extracted from ${endToolName}: ${extractedCode.length} chars`);
              }
              
              if (outputObj.success) {
                toolResult = outputObj.ai_notes as string || 
                  (outputObj.code ? 'Code generated successfully' : 'Completed successfully');
              } else if (outputObj.error) {
                toolResult = `Error: ${outputObj.error}`;
              } else {
                toolResult = JSON.stringify(toolOutput).slice(0, 200);
              }
            }
            
            // Yield code chunk FIRST if we have code (so frontend updates immediately)
            if (extractedCode) {
              yield { 
                type: 'code', 
                content: extractedCode,
                code: extractedCode,
                toolName: endToolName,
              };
            }
            
            // Then yield the tool_end event
            yield { 
              type: 'tool_end', 
              content: toolResult,
              toolName: endToolName,
            };
            break;

          case 'on_chain_end':
            // Chain finished - extract final messages
            if (data?.output) {
              const output = data.output as Record<string, unknown>;
              if (output.messages && Array.isArray(output.messages)) {
                const messages = output.messages;
                const lastMsg = messages[messages.length - 1] as Record<string, unknown>;
                if (lastMsg) {
                  const msgContent = extractTextContent(lastMsg.content);
                  if (msgContent && msgContent !== lastYieldedText) {
                    currentText = msgContent;
                    lastYieldedText = currentText;
                    yield { type: 'text', content: currentText };
                  }
                }
              }
            }
            break;

          case 'messages':
            // Direct messages event (from messages-tuple mode)
            if (Array.isArray(data)) {
              for (const item of data) {
                if (Array.isArray(item) && item.length >= 2) {
                  const [msgType, msgData] = item;
                  if (msgType === 'ai' || msgType === 'AIMessageChunk') {
                    const content = extractTextContent((msgData as Record<string, unknown>)?.content);
                    if (content && content !== lastYieldedText) {
                      currentText = content;
                      lastYieldedText = currentText;
                      yield { type: 'text', content: currentText };
                    }
                  }
                }
              }
            }
            break;

          case 'values':
            // Values mode - contains full state
            if (data?.messages && Array.isArray(data.messages)) {
              const messages = data.messages;
              const lastMsg = messages[messages.length - 1] as Record<string, unknown>;
              if (lastMsg?.type === 'ai' || lastMsg?.role === 'assistant') {
                const msgContent = extractTextContent(lastMsg.content);
                if (msgContent && msgContent !== lastYieldedText) {
                  currentText = msgContent;
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
            // Try to extract content from any event with messages
            if (data?.messages && Array.isArray(data.messages)) {
              const lastMsg = data.messages[data.messages.length - 1] as Record<string, unknown>;
              if (lastMsg) {
                const msgContent = extractTextContent(lastMsg.content);
                const isAssistant = lastMsg.role === 'assistant' || lastMsg.type === 'ai';
                if (isAssistant && msgContent && msgContent !== lastYieldedText) {
                  currentText = msgContent;
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

    // Final check for filenames in the response text
    const filenamePattern = /["']?filename["']?\s*:\s*["']([^"']+\.(?:png|jpg|jpeg|webp))["']/gi;
    let filenameMatch;
    while ((filenameMatch = filenamePattern.exec(currentText)) !== null) {
      const imageUrl = `/api/outputs/${filenameMatch[1]}`;
      if (!detectedImages.includes(imageUrl)) {
        detectedImages.push(imageUrl);
        yield { type: 'image', content: filenameMatch[1], imageUrl };
      }
    }
    
    // Fallback: check for base64 images
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
    
    // Parse error message for better user feedback
    let errorMessage = 'Failed to connect to AI';
    const errorStr = error instanceof Error ? error.message : String(error);
    
    if (errorStr.includes('529') || errorStr.includes('overloaded')) {
      errorMessage = '⏳ Die API ist gerade überlastet. Bitte warte kurz und versuche es erneut.';
    } else if (errorStr.includes('400') || errorStr.includes('BadRequest')) {
      errorMessage = '❌ Fehler bei der Anfrage. Bitte versuche es mit einem anderen Bild oder einer kürzeren Nachricht.';
    } else if (errorStr.includes('401') || errorStr.includes('Unauthorized')) {
      errorMessage = '🔑 API-Schlüssel ungültig. Bitte überprüfe die Konfiguration.';
    } else if (errorStr.includes('500') || errorStr.includes('Internal')) {
      errorMessage = '💥 Server-Fehler. Bitte versuche es gleich nochmal.';
    } else if (errorStr.includes('timeout') || errorStr.includes('TIMEOUT')) {
      errorMessage = '⏱️ Zeitüberschreitung. Die Anfrage hat zu lange gedauert.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    yield { 
      type: 'error', 
      content: errorMessage
    };
    yield { type: 'done', content: '' };
  }
}

export async function getThreadHistory(threadId: string) {
  return client.threads.getState(threadId);
}
