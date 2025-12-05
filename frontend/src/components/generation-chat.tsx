'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Image,
  Palette,
  Layout,
  PanelTop,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  Maximize2,
  Wrench,
  CheckCircle2,
  XCircle,
  Brain,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDesignStore, Message, GeneratedDesign, ToolActivity } from '@/lib/store';
import { createThread, streamMessage } from '@/lib/langgraph-client';

const QUICK_PROMPTS = [
  {
    icon: PanelTop,
    label: 'UI Mockup',
    prompt: 'Create a modern mobile app screen for',
  },
  {
    icon: Layout,
    label: 'Dashboard',
    prompt: 'Design a data dashboard showing',
  },
  {
    icon: Palette,
    label: 'Marketing Banner',
    prompt: 'Create a marketing banner for',
  },
  {
    icon: Image,
    label: 'Landing Page',
    prompt: 'Design a hero section for',
  },
];

// Tool display names
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  generate_design_image: '🎨 Generating Design',
  analyze_design_style: '🔍 Analyzing Style',
  extract_brand_identity: '🌐 Extracting Brand',
  get_style_context: '📋 Loading Style',
  compare_styles: '⚖️ Comparing Styles',
  knowledge_store: '📚 Accessing Knowledge',
};

function ToolActivityDisplay({ tool }: { tool: ToolActivity }) {
  const displayName = TOOL_DISPLAY_NAMES[tool.name] || tool.name;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/50 text-sm"
    >
      {tool.status === 'running' ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : tool.status === 'completed' ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className="font-medium">{displayName}</span>
      {tool.status === 'running' && (
        <motion.span
          className="text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          processing...
        </motion.span>
      )}
      {tool.status === 'completed' && tool.result && (
        <span className="text-muted-foreground truncate max-w-[200px]">
          {tool.result.slice(0, 50)}...
        </span>
      )}
    </motion.div>
  );
}

export function GenerationChat() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    addMessage,
    updateMessage,
    updateMessageState,
    addToolToMessage,
    updateToolInMessage,
    addImageToMessage,
    clearMessages,
    isGenerating,
    setIsGenerating,
    threadId,
    setThreadId,
    uploadedAssets,
    addDesign,
  } = useDesignStore();

  // Clear chat and start new thread
  const handleClearChat = useCallback(async () => {
    clearMessages();
    const newThread = await createThread();
    setThreadId(newThread);
  }, [clearMessages, setThreadId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize thread on mount
  useEffect(() => {
    if (!threadId) {
      createThread().then(setThreadId).catch(console.error);
    }
  }, [threadId, setThreadId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setIsGenerating(true);

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    addMessage({
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Add placeholder for assistant message
    const assistantMsgId = `assistant-${Date.now()}`;
    addMessage({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isThinking: true,
      activeTools: [],
    });

    try {
      // Get image base64 from uploaded assets for context
      // Limit to 1 image and max 500KB to avoid token limits
      const MAX_IMAGE_SIZE = 500 * 1024; // 500KB in base64 chars
      const imageContexts = uploadedAssets
        .filter((a) => a.type === 'image' && a.base64.length < MAX_IMAGE_SIZE)
        .slice(0, 1) // Only 1 image to stay under token limit
        .map((a) => a.base64);
      
      if (imageContexts.length > 0) {
        console.log(`Sending ${imageContexts.length} image(s), size: ~${Math.round(imageContexts[0].length / 1024)}KB`);
      }

      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread();
        setThreadId(currentThreadId);
      }

      for await (const chunk of streamMessage(
        currentThreadId,
        userMessage,
        imageContexts.length > 0 ? imageContexts : undefined
      )) {
        switch (chunk.type) {
          case 'thinking':
            updateMessageState(assistantMsgId, { isThinking: true, content: '' });
            break;

          case 'text':
            updateMessageState(assistantMsgId, { 
              isThinking: false, 
              content: chunk.content,
              isStreaming: true,
            });
            break;

          case 'tool_start':
            addToolToMessage(assistantMsgId, {
              name: chunk.toolName || 'unknown',
              status: 'running',
              args: chunk.toolArgs,
            });
            break;

          case 'tool_end':
            updateToolInMessage(assistantMsgId, chunk.toolName || 'unknown', {
              status: 'completed',
              result: chunk.content,
            });
            break;

          case 'image':
            // Add image to message - now supports both URL and base64
            // If imageUrl is present, use it (new efficient format)
            // Otherwise fall back to base64 (legacy)
            const imageValue = chunk.imageUrl || chunk.content;
            addImageToMessage(assistantMsgId, imageValue);
            
            // Also add to gallery
            const design: GeneratedDesign = {
              id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              imageBase64: imageValue, // Can be URL or base64
              prompt: userMessage,
              designType: 'generated',
              createdAt: new Date().toISOString(),
            };
            addDesign(design);
            break;

          case 'error':
            updateMessageState(assistantMsgId, {
              error: chunk.content,
              isStreaming: false,
              isThinking: false,
            });
            break;

          case 'done':
            updateMessageState(assistantMsgId, {
              isStreaming: false,
              isThinking: false,
            });
            break;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      // Check for token limit error
      const isTokenLimit = errorMsg.includes('too long') || errorMsg.includes('token');
      
      updateMessageState(assistantMsgId, {
        content: isTokenLimit 
          ? '⚠️ Chat history too long. Starting fresh conversation...'
          : 'Sorry, there was an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
        isStreaming: false,
        isThinking: false,
      });
      
      // Auto-clear on token limit to start fresh
      if (isTokenLimit) {
        setTimeout(async () => {
          clearMessages();
          const newThread = await createThread();
          setThreadId(newThread);
        }, 2000);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [
    input,
    isGenerating,
    threadId,
    uploadedAssets,
    addMessage,
    updateMessage,
    updateMessageState,
    addToolToMessage,
    updateToolInMessage,
    addImageToMessage,
    clearMessages,
    setIsGenerating,
    setThreadId,
    addDesign,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt + ' ');
    textareaRef.current?.focus();
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Clear Button */}
      {messages.length > 0 && (
        <div className="border-b border-border px-4 py-2 flex justify-between items-center bg-background/50 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">
            {messages.length} messages
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Ready to Create</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Describe the design you want to create. I&apos;ll generate
                professional mockups matching your brand style.
              </p>

              {/* Quick Prompts */}
              <div className="flex flex-wrap justify-center gap-3">
                {QUICK_PROMPTS.map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    className="glass glass-hover"
                    onClick={() => handleQuickPrompt(item.prompt)}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                    ${
                      message.role === 'user'
                        ? 'bg-primary'
                        : 'bg-gradient-to-br from-primary to-accent'
                    }
                  `}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <Card
                  className={`
                    flex-1 p-4 max-w-[80%]
                    ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Thinking State */}
                      {message.isThinking && !message.content && (
                        <motion.div 
                          className="flex items-center gap-2"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Brain className="w-4 h-4 text-primary" />
                          <span className="text-sm">Thinking...</span>
                        </motion.div>
                      )}

                      {/* Tool Activities */}
                      {message.activeTools && message.activeTools.length > 0 && (
                        <div className="space-y-2 mb-3">
                          <AnimatePresence>
                            {message.activeTools.map((tool) => (
                              <ToolActivityDisplay key={tool.name} tool={tool} />
                            ))}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Message Text */}
                      {message.content && (
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}

                      {/* Error Display */}
                      {message.error && (
                        <div className="mt-2 p-2 rounded-lg bg-red-500/10 text-red-500 text-sm">
                          {message.error}
                        </div>
                      )}

                      {/* Streaming indicator */}
                      {message.isStreaming && message.content && (
                        <motion.span
                          className="inline-block w-2 h-4 ml-1 bg-current"
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Actions */}
                    {message.role === 'assistant' && message.content && !message.isStreaming && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() =>
                              copyToClipboard(message.content, message.id)
                            }
                          >
                            {copied === message.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy</TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Images */}
                  {message.images && message.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {message.images.map((img, i) => {
                        // Support both URL (starts with /) and base64 formats
                        const isUrl = img.startsWith('/') || img.startsWith('http');
                        const imgSrc = isUrl ? img : `data:image/png;base64,${img}`;
                        
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group rounded-lg overflow-hidden"
                          >
                            <img
                              src={imgSrc}
                              alt={`Generated design ${i + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button variant="secondary" size="icon">
                                <Maximize2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto">
          {/* Context Pills */}
          {uploadedAssets.length > 0 && (
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-muted-foreground">Using style from:</span>
              {uploadedAssets.slice(0, 3).map((asset) => (
                <Badge key={asset.id} variant="secondary" className="text-xs">
                  {asset.name}
                </Badge>
              ))}
              {uploadedAssets.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{uploadedAssets.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Input Box */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the design you want to create..."
              className="min-h-[80px] pr-24 resize-none glass"
              disabled={isGenerating}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {input.length}/2000
              </span>
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Tips */}
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
