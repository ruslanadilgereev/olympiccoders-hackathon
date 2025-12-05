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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDesignStore, Message, GeneratedDesign } from '@/lib/store';
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

export function GenerationChat() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    addMessage,
    updateMessage,
    isGenerating,
    setIsGenerating,
    threadId,
    setThreadId,
    uploadedAssets,
    addDesign,
  } = useDesignStore();

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
    });

    try {
      // Get image base64 from uploaded assets for context
      const imageContexts = uploadedAssets
        .filter((a) => a.type === 'image')
        .slice(0, 3) // Limit to 3 images
        .map((a) => a.base64);

      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread();
        setThreadId(currentThreadId);
      }

      let fullResponse = '';
      const detectedImages: string[] = [];

      for await (const event of streamMessage(
        currentThreadId,
        userMessage,
        imageContexts.length > 0 ? imageContexts : undefined
      )) {
        if (event.type === 'text') {
          fullResponse = event.content;
          updateMessage(assistantMsgId, fullResponse);
        } else if (event.type === 'image') {
          detectedImages.push(event.content);
        }
      }

      // Check for generated images in the response
      // Parse any base64 images from tool results
      const imageMatches = fullResponse.match(
        /["']?image_base64["']?\s*:\s*["']([A-Za-z0-9+/=]+)["']/g
      );
      
      if (imageMatches) {
        for (const match of imageMatches) {
          const base64Match = match.match(/["']([A-Za-z0-9+/=]{100,})["']/);
          if (base64Match) {
            const design: GeneratedDesign = {
              id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              imageBase64: base64Match[1],
              prompt: userMessage,
              designType: 'generated',
              createdAt: new Date().toISOString(),
            };
            addDesign(design);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      updateMessage(
        assistantMsgId,
        'Sorry, there was an error processing your request. Please try again.'
      );
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
                      {message.isStreaming && !message.content ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
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
                    {message.role === 'assistant' && message.content && (
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
                      {message.images.map((img, i) => (
                        <div
                          key={i}
                          className="relative group rounded-lg overflow-hidden"
                        >
                          <img
                            src={`data:image/png;base64,${img}`}
                            alt={`Generated design ${i + 1}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="secondary" size="icon">
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
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

