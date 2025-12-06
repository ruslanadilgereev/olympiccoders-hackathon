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
  Code2,
  MousePointer2,
  Undo2,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDesignStore, Message, GeneratedDesign, ToolActivity, SelectedElement } from '@/lib/store';
import { createThread, streamMessage } from '@/lib/langgraph-client';
import { CodePreview } from '@/components/code-preview';
import { saveAndPreview, shouldAutoOpen } from '@/lib/auto-open';

const QUICK_PROMPTS = [
  {
    icon: Code2,
    label: 'Convert to Code',
    prompt: 'Convert this UI screenshot to React + Tailwind code',
  },
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
];

// Tool display config with descriptions
const TOOL_CONFIG: Record<string, { icon: string; name: string; description: string; color: string }> = {
  generate_design_image: {
    icon: '🎨',
    name: 'Generating Design',
    description: 'Creating a new design image based on your requirements...',
    color: 'text-purple-400',
  },
  analyze_design_style: {
    icon: '🔍',
    name: 'Analyzing Style',
    description: 'Extracting colors, typography, and layout patterns...',
    color: 'text-blue-400',
  },
  extract_brand_identity: {
    icon: '🌐',
    name: 'Extracting Brand',
    description: 'Scraping website to extract brand colors and styles...',
    color: 'text-cyan-400',
  },
  get_style_context: {
    icon: '📋',
    name: 'Loading Style',
    description: 'Retrieving previously analyzed style guide...',
    color: 'text-yellow-400',
  },
  compare_styles: {
    icon: '⚖️',
    name: 'Comparing Styles',
    description: 'Analyzing differences between design styles...',
    color: 'text-orange-400',
  },
  knowledge_store: {
    icon: '📚',
    name: 'Accessing Knowledge',
    description: 'Retrieving stored brand guidelines...',
    color: 'text-green-400',
  },
  image_to_code: {
    icon: '💻',
    name: 'Converting to Code',
    description: 'Analyzing UI screenshot and generating React + Tailwind code...',
    color: 'text-indigo-400',
  },
  modify_code: {
    icon: '✏️',
    name: 'Modifying Code',
    description: 'Applying your changes to the component code...',
    color: 'text-pink-400',
  },
};

function ToolActivityDisplay({ tool }: { tool: ToolActivity }) {
  const config = TOOL_CONFIG[tool.name] || {
    icon: '🔧',
    name: tool.name,
    description: 'Processing...',
    color: 'text-gray-400',
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-lg border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className={`flex items-center gap-3 py-2.5 px-3 ${
        tool.status === 'running' ? 'bg-primary/10' : 
        tool.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'
      }`}>
        <span className="text-lg">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${config.color}`}>{config.name}</span>
            {tool.status === 'running' && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            )}
            {tool.status === 'completed' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            )}
            {tool.status === 'error' && (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            )}
          </div>
          {tool.status === 'running' && (
            <motion.p 
              className="text-xs text-muted-foreground mt-0.5"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {config.description}
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Progress bar for running */}
      {tool.status === 'running' && (
        <div className="h-1 bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '50%' }}
          />
        </div>
      )}
      
      {/* Result summary */}
      {tool.status === 'completed' && tool.result && (
        <div className="px-3 py-2 bg-muted/30 text-xs text-muted-foreground border-t border-border/30">
          {tool.name === 'image_to_code' || tool.name === 'modify_code' ? (
            <span className="text-green-400">✓ Code generated successfully</span>
          ) : (
            <span className="truncate block">{tool.result.slice(0, 80)}...</span>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function GenerationChat() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
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
    // Code Builder State
    generatedCode,
    setGeneratedCode,
    codeHistory,
    pushCodeHistory,
    undoCode,
    selectedElement,
    setSelectedElement,
    isCodeGenerating,
    setIsCodeGenerating,
  } = useDesignStore();

  // Clear chat and start new thread
  const handleClearChat = useCallback(async () => {
    clearMessages();
    setGeneratedCode('');
    setSelectedElement(null);
    const newThread = await createThread();
    setThreadId(newThread);
  }, [clearMessages, setThreadId, setGeneratedCode, setSelectedElement]);

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

    let userMessage = input.trim();
    setInput('');
    setIsGenerating(true);

    // If there's a selected element, add context to the message
    if (selectedElement) {
      userMessage = `[Selected element: ${selectedElement.description}]\n\n${userMessage}`;
    }

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    addMessage({
      id: userMsgId,
      role: 'user',
      content: input.trim(), // Show original message without context
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

      // Add current code context if we have code and the message might be about modification
      let fullMessage = userMessage;
      if (generatedCode && (userMessage.toLowerCase().includes('change') || 
          userMessage.toLowerCase().includes('modify') || 
          userMessage.toLowerCase().includes('update') ||
          userMessage.toLowerCase().includes('make') ||
          userMessage.toLowerCase().includes('add') ||
          selectedElement)) {
        fullMessage = `Current code:\n\`\`\`tsx\n${generatedCode}\n\`\`\`\n\n${userMessage}`;
      }

      for await (const chunk of streamMessage(
        currentThreadId,
        fullMessage,
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
            // Set code generating state for code tools
            if (chunk.toolName === 'image_to_code' || chunk.toolName === 'modify_code') {
              setIsCodeGenerating(true);
            }
            break;

          case 'tool_end':
            updateToolInMessage(assistantMsgId, chunk.toolName || 'unknown', {
              status: 'completed',
              result: chunk.content,
            });
            
            // Just mark code generation as complete - actual code is handled by 'code' chunk
            if (chunk.toolName === 'image_to_code' || chunk.toolName === 'modify_code') {
              setIsCodeGenerating(false);
            }
            break;

          case 'code':
            // Direct code chunk from langgraph client
            if (chunk.code) {
              setIsCodeGenerating(false);
              if (generatedCode) {
                pushCodeHistory(generatedCode);
              }
              setGeneratedCode(chunk.code);
              if (chunk.toolName === 'modify_code') {
                setSelectedElement(null);
              }
              // Add success indicator to the message
              updateMessageState(assistantMsgId, {
                codeGenerated: true,
              });
              // Auto-save to file system for preview page
              const componentName = `Generated_${Date.now()}`;
              saveAndPreview(chunk.code, componentName, input.trim()).then((saveResult) => {
                if (saveResult.success) {
                  console.log('✅ Component auto-saved:', saveResult.previewUrl);
                }
              });
            }
            break;

          case 'image':
            // Add image to message - now supports both URL and base64
            const imageValue = chunk.imageUrl || chunk.content;
            addImageToMessage(assistantMsgId, imageValue);
            
            // Also add to gallery
            const design: GeneratedDesign = {
              id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              imageBase64: imageValue,
              prompt: input.trim(),
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
            setIsCodeGenerating(false);
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
      
      const isTokenLimit = errorMsg.includes('too long') || errorMsg.includes('token');
      
      updateMessageState(assistantMsgId, {
        content: isTokenLimit 
          ? '⚠️ Chat history too long. Starting fresh conversation...'
          : 'Sorry, there was an error processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error',
        isStreaming: false,
        isThinking: false,
      });
      
      setIsCodeGenerating(false);
      
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
    generatedCode,
    selectedElement,
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
    setGeneratedCode,
    pushCodeHistory,
    setSelectedElement,
    setIsCodeGenerating,
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

  const handleElementSelect = (element: SelectedElement | null) => {
    setSelectedElement(element);
    if (element) {
      // Focus the input when an element is selected
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat Panel (left, sticky ~20%) */}
      <motion.div 
        className="flex flex-col h-screen border-r border-border basis-[20%] min-w-[300px] max-w-[360px] sticky top-0 bg-background"
        layout
      >
        {/* Header with Clear Button */}
        <div className="border-b border-border px-4 py-2 flex justify-between items-center bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {messages.length} messages
            </span>
            {selectedElement && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                <MousePointer2 className="w-3 h-3 mr-1" />
                Element selected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {codeHistory.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={undoCode}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo Code Change</TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(!showPreview)}
                  className="h-8 w-8"
                >
                  {showPreview ? (
                    <PanelLeftClose className="w-4 h-4" />
                  ) : (
                    <PanelLeft className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showPreview ? 'Hide Preview' : 'Show Preview'}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Code2 className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Image to Code Builder</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Upload a UI screenshot and I&apos;ll convert it to React + Tailwind code.
                </p>

                {/* How it works */}
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8 text-left">
                  <div className="glass rounded-lg p-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-2">
                      <span className="text-indigo-400 font-bold">1</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload a screenshot in the Assets tab</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mb-2">
                      <span className="text-purple-400 font-bold">2</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Ask me to convert it to code</p>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center mb-2">
                      <span className="text-pink-400 font-bold">3</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Select elements and modify with prompts</p>
                  </div>
                </div>

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

                        {/* Code Generated Success */}
                        {message.codeGenerated && !message.isStreaming && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Code2 className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-400">Code Generated Successfully</p>
                                <p className="text-xs text-muted-foreground">Check the preview panel on the right →</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Error Display */}
                        {message.error && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-4 h-4 text-red-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-red-400 mb-1">Fehler aufgetreten</p>
                                <p className="text-sm text-red-300/80">{message.error}</p>
                                {message.error.includes('überlastet') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="mt-3 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                    onClick={() => {
                                      // Retry by setting input to last message and sending
                                      const lastUserMsg = messages.findLast(m => m.role === 'user');
                                      if (lastUserMsg) {
                                        setInput(lastUserMsg.content);
                                        // Trigger send on next tick after input is set
                                        setTimeout(() => handleSend(), 0);
                                      }
                                    }}
                                  >
                                    🔄 Nochmal versuchen
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
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
            {/* Selected Element Context */}
            {selectedElement && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20"
              >
                <MousePointer2 className="w-4 h-4 text-green-400" />
                <span className="text-sm text-muted-foreground flex-1 truncate">
                  Editing: {selectedElement.description}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setSelectedElement(null)}
                >
                  Clear
                </Button>
              </motion.div>
            )}

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
                placeholder={
                  selectedElement
                    ? `Describe how to modify ${selectedElement.tagName}...`
                    : 'Describe the design you want to create or convert...'
                }
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
              {selectedElement 
                ? 'Describe your changes for the selected element'
                : 'Upload a screenshot to convert to code, or select elements in preview to modify'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Preview Panel */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '80%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-screen flex-1 p-4"
          >
            <CodePreview
              code={generatedCode}
              onElementSelect={handleElementSelect}
              selectedElement={selectedElement}
              isLoading={isCodeGenerating}
              onCodeUpdate={(newCode) => {
                // Only update if we don't already have this code
                if (newCode && newCode !== generatedCode) {
                  console.log('[PREVIEW] Live code update received:', newCode.length, 'chars');
                  if (generatedCode) {
                    pushCodeHistory(generatedCode);
                  }
                  setGeneratedCode(newCode);
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
