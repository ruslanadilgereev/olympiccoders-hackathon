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
  ChevronDown,
  ChevronUp,
  ImageIcon,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDesignStore, Message, GeneratedDesign, ToolActivity, SelectedElement, AgentPhase } from '@/lib/store';
import { createThread, getOrCreateThread, clearStoredThread, streamMessage } from '@/lib/langgraph-client';
import { CodePreview } from '@/components/code-preview';
import { AIGenerationExperience } from '@/components/ai-generation-experience';
import { saveAndPreview, shouldAutoOpen } from '@/lib/auto-open';

// Phase-specific styling and labels
const PHASE_CONFIG: Record<AgentPhase, { color: string; bgColor: string; label: string; icon: string }> = {
  idle: { color: 'text-muted-foreground', bgColor: 'bg-muted/20', label: 'Ready', icon: '⏸️' },
  thinking: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', label: 'Thinking', icon: '🧠' },
  tool_running: { color: 'text-purple-400', bgColor: 'bg-purple-500/10', label: 'Running Tool', icon: '🔧' },
  generating_code: { color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', label: 'Generating Code', icon: '💻' },
  saving: { color: 'text-green-400', bgColor: 'bg-green-500/10', label: 'Saving', icon: '💾' },
  complete: { color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Complete', icon: '✅' },
};

// Agent Status Bar Component - Shows current agent activity prominently
function AgentStatusBar({
  isGenerating,
  isThinking,
  activeTools,
  streamingText,
  agentPhase,
  agentMessage,
  currentTool,
}: {
  isGenerating: boolean;
  isThinking: boolean;
  activeTools: ToolActivity[];
  streamingText: string;
  agentPhase: AgentPhase;
  agentMessage?: string;
  currentTool?: string;
}) {
  if (!isGenerating && agentPhase === 'idle') return null;

  const runningTool = activeTools.find(t => t.status === 'running');
  const toolConfig = runningTool ? TOOL_CONFIG[runningTool.name] :
    currentTool ? TOOL_CONFIG[currentTool] : null;
  const phaseConfig = PHASE_CONFIG[agentPhase] || PHASE_CONFIG.thinking;

  // Calculate elapsed time if we have a running tool with startTime
  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    if (!runningTool?.startTime) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - runningTool.startTime!) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [runningTool?.startTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`mb-3 rounded-xl ${phaseConfig.bgColor} border border-primary/20 overflow-hidden shadow-lg`}
    >
      {/* Main status content */}
      <div className="p-3 flex items-center gap-3">
        {/* Animated icon */}
        <motion.div
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0"
          animate={agentPhase !== 'complete' ? {
            boxShadow: [
              '0 0 0 0 rgba(99, 102, 241, 0.4)',
              '0 0 0 8px rgba(99, 102, 241, 0)',
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {agentPhase === 'complete' ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
              className="text-lg"
            >
              ✅
            </motion.span>
          ) : toolConfig ? (
            <span className="text-lg">{toolConfig.icon}</span>
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </motion.div>

        {/* Status text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-semibold text-sm ${phaseConfig.color}`}>
              {toolConfig?.name || phaseConfig.label}
            </span>
            {agentPhase !== 'complete' && agentPhase !== 'idle' && (
              <motion.div
                className="flex gap-0.5"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </motion.div>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {agentMessage || toolConfig?.description || 'Processing...'}
          </p>
        </div>

        {/* Time indicator */}
        {elapsedTime > 0 && agentPhase !== 'complete' && (
          <div className="text-xs text-muted-foreground font-mono">
            {elapsedTime}s
          </div>
        )}
      </div>

      {/* Progress bar */}
      {agentPhase !== 'complete' && agentPhase !== 'idle' && (
        <div className="h-1.5 bg-muted/30">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-accent to-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ width: '50%' }}
          />
        </div>
      )}

      {/* Complete indicator */}
      {agentPhase === 'complete' && (
        <div className="h-1.5 bg-green-500" />
      )}

      {/* Streaming text preview */}
      {streamingText && streamingText.length > 0 && agentPhase !== 'complete' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-3 py-2 bg-muted/20 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground line-clamp-2">
            <span className="text-primary font-medium">Preview: </span>
            {streamingText.slice(-150)}
            <motion.span
              className="inline-block w-1.5 h-3 ml-0.5 bg-primary"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// Collapsible Uploaded Images Panel
function UploadedImagesPanel({
  images,
  isExpanded,
  onToggle
}: {
  images: { id: string; name: string; preview?: string; base64: string }[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (images.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-2 right-2 z-20"
    >
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={onToggle}
          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted/50 transition-colors"
        >
          <ImageIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">{images.length} Image{images.length > 1 ? 's' : ''}</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              <div className="p-2 grid grid-cols-2 gap-2 max-w-[280px] max-h-[300px] overflow-auto">
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.preview || `data:image/jpeg;base64,${img.base64}`}
                      alt={img.name}
                      className="w-full h-24 object-cover rounded-md border border-border"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                      <p className="text-xs text-white text-center px-1 truncate">{img.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

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

// Tool display config with descriptions and detailed steps
const TOOL_CONFIG: Record<string, { icon: string; name: string; description: string; color: string; steps?: string[] }> = {
  generate_design_image: {
    icon: '🎨',
    name: 'Generating Design',
    description: 'Creating a new design image based on your requirements...',
    color: 'text-purple-400',
    steps: ['Analyzing prompt...', 'Generating image...', 'Optimizing output...'],
  },
  analyze_design_style: {
    icon: '🔍',
    name: 'Analyzing Style',
    description: 'Extracting colors, typography, and layout patterns...',
    color: 'text-blue-400',
    steps: ['Scanning image...', 'Extracting colors...', 'Detecting typography...', 'Analyzing layout...'],
  },
  extract_brand_identity: {
    icon: '🌐',
    name: 'Extracting Brand',
    description: 'Scraping website to extract brand colors and styles...',
    color: 'text-cyan-400',
    steps: ['Fetching website...', 'Parsing content...', 'Extracting brand elements...'],
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
    description: 'Calling Gemini AI to analyze screenshot (this takes 60-90 seconds)...',
    color: 'text-indigo-400',
    steps: ['Uploading image to AI...', 'AI is analyzing the layout...', 'Identifying UI components...', 'Generating React code...', 'Adding Tailwind styles...', 'Almost done...'],
  },
  modify_code: {
    icon: '✏️',
    name: 'Modifying Code',
    description: 'Applying your changes to the component code...',
    color: 'text-pink-400',
    steps: ['Understanding request...', 'Locating element...', 'Applying changes...', 'Validating code...'],
  },
};

function ToolActivityDisplay({ tool }: { tool: ToolActivity }) {
  const config = TOOL_CONFIG[tool.name] || {
    icon: '🔧',
    name: tool.name,
    description: 'Processing...',
    color: 'text-gray-400',
  };

  const [currentStep, setCurrentStep] = useState(0);
  const steps = config.steps || [config.description];

  // Animate through steps when running - slower for long operations
  useEffect(() => {
    if (tool.status !== 'running' || !config.steps) return;

    // Longer interval for code generation tools (15 seconds per step)
    const isLongOperation = tool.name === 'image_to_code' || tool.name === 'modify_code';
    const stepDuration = isLongOperation ? 15000 : 3000;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, stepDuration);

    return () => clearInterval(interval);
  }, [tool.status, config.steps, steps.length, tool.name]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      className="rounded-md border border-border/30 overflow-hidden"
    >
      {/* Compact Header */}
      <div className={`flex items-center gap-2 py-1.5 px-2.5 ${tool.status === 'running' ? 'bg-primary/10' :
          tool.status === 'completed' ? 'bg-green-500/10' : 'bg-red-500/10'
        }`}>
        <span className="text-sm">{config.icon}</span>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className={`text-xs font-medium ${config.color}`}>{config.name}</span>
          {tool.status === 'running' && (
            <motion.div
              className="flex gap-0.5"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-primary" />
              ))}
            </motion.div>
          )}
          {tool.status === 'completed' && (
            <CheckCircle2 className="w-3 h-3 text-green-500" />
          )}
          {tool.status === 'error' && (
            <XCircle className="w-3 h-3 text-red-500" />
          )}
        </div>
        {/* Step counter - compact */}
        {tool.status === 'running' && config.steps && (
          <span className="text-[10px] text-muted-foreground">
            {currentStep + 1}/{steps.length}
          </span>
        )}
      </div>

      {/* Compact progress bar for running */}
      {tool.status === 'running' && (
        <div className="h-0.5 bg-muted/30 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: '50%' }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function GenerationChat() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showUploadedImages, setShowUploadedImages] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
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
    // Agent Status
    agentStatus,
    setAgentPhase,
    resetAgentStatus,
    // Session management
    needsNewSession,
    setNeedsNewSession,
  } = useDesignStore();

  // Clear chat and start new thread
  const handleClearChat = useCallback(async () => {
    clearMessages();
    setGeneratedCode('');
    setSelectedElement(null);
    clearStoredThread(); // Clear localStorage to start fresh
    const newThread = await createThread();
    setThreadId(newThread);
  }, [clearMessages, setThreadId, setGeneratedCode, setSelectedElement]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize thread on mount - create new if needsNewSession, otherwise restore
  useEffect(() => {
    const initThread = async () => {
      if (needsNewSession) {
        // New flow from Assets page - create fresh session
        console.log('[SESSION] New session needed, creating fresh thread...');
        clearMessages();
        setGeneratedCode('');
        clearStoredThread();
        const newThread = await createThread();
        setThreadId(newThread);
        setNeedsNewSession(false);
      } else if (!threadId) {
        // Restore existing session
        getOrCreateThread().then(setThreadId).catch(console.error);
      }
    };
    initThread();
  }, [needsNewSession, threadId, setThreadId, setNeedsNewSession, clearMessages, setGeneratedCode]);

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
      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await getOrCreateThread();
        setThreadId(currentThreadId);
      }

      // Determine if this is a modification request (we have code and user wants to change it)
      const isModificationRequest = generatedCode && (
        userMessage.toLowerCase().includes('change') ||
        userMessage.toLowerCase().includes('modify') ||
        userMessage.toLowerCase().includes('update') ||
        userMessage.toLowerCase().includes('make') ||
        userMessage.toLowerCase().includes('add') ||
        userMessage.toLowerCase().includes('remove') ||
        userMessage.toLowerCase().includes('delete') ||
        userMessage.toLowerCase().includes('swap') ||
        userMessage.toLowerCase().includes('move') ||
        userMessage.toLowerCase().includes('replace') ||
        selectedElement
      );

      // Only send image for FIRST request (no code yet), not for modifications
      let imageContexts: string[] = [];
      if (!generatedCode) {
        // First request - send image for analysis
        const MAX_IMAGE_SIZE = 500 * 1024; // 500KB in base64 chars
        imageContexts = uploadedAssets
          .filter((a) => a.type === 'image' && a.base64.length < MAX_IMAGE_SIZE)
          .slice(0, 1) // Only 1 image to stay under token limit
          .map((a) => a.base64);

        if (imageContexts.length > 0) {
          console.log(`[FIRST REQUEST] Sending image, size: ~${Math.round(imageContexts[0].length / 1024)}KB`);
        }
      } else {
        console.log('[MODIFICATION] Skipping image, using existing code context');
      }

      // Add current code context for modifications
      let fullMessage = userMessage;
      if (isModificationRequest) {
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
            setAgentPhase('thinking', 'Analyzing your request...');
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
              startTime: Date.now(),
            });
            // Set code generating state for code tools
            if (chunk.toolName === 'image_to_code' || chunk.toolName === 'modify_code') {
              setIsCodeGenerating(true);
              setAgentPhase('generating_code', 'Converting to React + Tailwind...', chunk.toolName);
            } else {
              setAgentPhase('tool_running', `Running ${chunk.toolName}...`, chunk.toolName);
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
              setAgentPhase('saving', 'Saving to sandbox...');
            }
            break;

          case 'code':
            // Direct code chunk from langgraph client
            console.log('[CODE CHUNK] Received:', chunk.code?.length, 'chars');
            if (chunk.code) {
              console.log('[CODE CHUNK] Setting generated code...');
              setIsCodeGenerating(false);
              if (generatedCode) {
                pushCodeHistory(generatedCode);
              }
              setGeneratedCode(chunk.code);
              console.log('[CODE CHUNK] Code set successfully!');
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
            resetAgentStatus();
            break;

          case 'done':
            updateMessageState(assistantMsgId, {
              isStreaming: false,
              isThinking: false,
            });
            setAgentPhase('complete', 'Done!');
            // Reset after a short delay so user can see completion
            setTimeout(() => resetAgentStatus(), 1500);
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
          clearStoredThread(); // Clear localStorage on token limit
          const newThread = await createThread();
          setThreadId(newThread);
        }, 2000);
      }
    } finally {
      // Always reset all generation states
      setIsGenerating(false);
      setIsCodeGenerating(false);
      // Note: generatedCode in closure is stale, check store directly
      console.log('[GENERATION] Complete');
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
    setAgentPhase,
    resetAgentStatus,
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
        className="flex flex-col h-screen border-r border-border basis-[20%] min-w-[300px] max-w-[360px] sticky top-0 bg-background overflow-hidden"
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
        <ScrollArea className="flex-1 min-h-0 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
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
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                >
                  {/* Avatar */}
                  <div
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                      ${message.role === 'user'
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
                      ${message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Thinking State - Compact */}
                        {message.isThinking && !message.content && !message.activeTools?.length && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2 py-1"
                          >
                            <Brain className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs text-muted-foreground">Analyzing...</span>
                            <motion.div
                              className="flex gap-0.5"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              {[0, 1, 2].map((i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                              ))}
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Tool Activities - Compact */}
                        {message.activeTools && message.activeTools.length > 0 && (
                          <div className="space-y-1 mb-2">
                            <AnimatePresence>
                              {message.activeTools.map((tool, index) => (
                                <ToolActivityDisplay key={`${tool.name}-${index}-${tool.startTime || index}`} tool={tool} />
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

                        {/* Code Generated Success - Compact */}
                        {message.codeGenerated && !message.isStreaming && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-2 flex items-center gap-2 text-xs text-green-400"
                          >
                            <Code2 className="w-3 h-3" />
                            <span>Code ready → Preview panel</span>
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
            {/* Agent Status Bar */}
            <AnimatePresence>
              {(isGenerating || agentStatus.phase !== 'idle') && (
                <AgentStatusBar
                  isGenerating={isGenerating}
                  isThinking={messages[messages.length - 1]?.isThinking || false}
                  activeTools={messages[messages.length - 1]?.activeTools || []}
                  streamingText={messages[messages.length - 1]?.content || ''}
                  agentPhase={agentStatus.phase}
                  agentMessage={agentStatus.message}
                  currentTool={agentStatus.currentTool}
                />
              )}
            </AnimatePresence>

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
            className="h-screen flex-1 p-4 relative"
          >
            {/* Premium AI Generation Experience - Shows when agent is working OR demo mode */}
            <AnimatePresence>
              {(demoMode || ((isGenerating || isCodeGenerating) && uploadedAssets.length > 0)) && (
                <AIGenerationExperience
                  imageUrl={
                    uploadedAssets.length > 0
                      ? (uploadedAssets[0].preview || `data:image/jpeg;base64,${uploadedAssets[0].base64}`)
                      : 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80'
                  }
                  imageName={uploadedAssets.length > 0 ? uploadedAssets[0].name : 'Demo Dashboard.png'}
                  isGenerating={demoMode || isGenerating || isCodeGenerating}
                  onComplete={() => {
                    console.log('[AI Experience] Generation complete, transitioning to preview');
                    if (demoMode) setDemoMode(false);
                  }}
                />
              )}
            </AnimatePresence>

            {/* Demo Button removed - was cluttering the UI */}

            {/* Uploaded Images Panel removed - was cluttering the UI */}

            {/* Code Preview with entrance animation after generation */}
            <motion.div
              className="h-full"
              initial={false}
              animate={{
                opacity: (isGenerating || isCodeGenerating) ? 0 : 1,
                scale: (isGenerating || isCodeGenerating) ? 0.98 : 1,
                filter: (isGenerating || isCodeGenerating) ? 'blur(4px)' : 'blur(0px)'
              }}
              transition={{ duration: 0.5, delay: (isGenerating || isCodeGenerating) ? 0 : 0.3 }}
            >
              <CodePreview
                code={generatedCode}
                onElementSelect={handleElementSelect}
                selectedElement={selectedElement}
                isLoading={false}
                key={`preview-${generatedCode.length}`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
