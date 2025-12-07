'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  Bot,
  User,
  Copy,
  Check,
  Maximize2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Code2,
  MousePointer2,
  Undo2,
  PanelLeftClose,
  PanelLeft,
  ImageIcon,
  AlertCircle,
  Square,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useDesignStore, GeneratedDesign, ToolActivity, SelectedElement } from '@/lib/store';
import { createThread, streamMessage, cancelRun } from '@/lib/langgraph-client';
import { CodePreview } from '@/components/code-preview';

// Simple markdown renderer for chat messages
// Handles: **bold**, *italic*, `code`, and newlines
function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  
  // Split by code blocks first (to avoid parsing markdown inside code)
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let partKey = 0;
  
  // Process inline formatting
  const processInline = (str: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    let remaining = str;
    let key = 0;
    
    while (remaining.length > 0) {
      // Check for **bold**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Check for *italic* (but not **)
      const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
      // Check for `code`
      const codeMatch = remaining.match(/`([^`]+?)`/);
      
      // Find the earliest match
      const matches = [
        boldMatch ? { type: 'bold', match: boldMatch, index: boldMatch.index! } : null,
        italicMatch ? { type: 'italic', match: italicMatch, index: italicMatch.index! } : null,
        codeMatch ? { type: 'code', match: codeMatch, index: codeMatch.index! } : null,
      ].filter(Boolean).sort((a, b) => a!.index - b!.index);
      
      if (matches.length === 0) {
        // No more matches, add remaining text
        result.push(remaining);
        break;
      }
      
      const earliest = matches[0]!;
      
      // Add text before match
      if (earliest.index > 0) {
        result.push(remaining.slice(0, earliest.index));
      }
      
      // Add formatted element
      const content = earliest.match[1];
      switch (earliest.type) {
        case 'bold':
          result.push(<strong key={`b-${key++}`} className="font-semibold">{content}</strong>);
          break;
        case 'italic':
          result.push(<em key={`i-${key++}`} className="italic">{content}</em>);
          break;
        case 'code':
          result.push(
            <code key={`c-${key++}`} className="px-1 py-0.5 rounded bg-muted font-mono text-xs">
              {content}
            </code>
          );
          break;
      }
      
      // Continue with rest of string
      remaining = remaining.slice(earliest.index + earliest.match[0].length);
    }
    
    return result;
  };
  
  // Split by lines and process each
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => (
    <React.Fragment key={lineIdx}>
      {processInline(line)}
      {lineIdx < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}

// Tool display config with detailed steps
const TOOL_CONFIG: Record<string, { icon: string; name: string; color: string; steps?: string[] }> = {
  generate_design_image: { 
    icon: '🎨', 
    name: 'Generating Design', 
    color: 'text-purple-400',
    steps: ['Analyzing prompt', 'Creating design', 'Rendering image']
  },
  analyze_design_style: { 
    icon: '🔍', 
    name: 'Analyzing Style', 
    color: 'text-blue-400',
    steps: ['Extracting colors', 'Analyzing typography', 'Detecting patterns']
  },
  extract_brand_identity: { icon: '🌐', name: 'Extracting Brand', color: 'text-cyan-400' },
  get_style_context: { icon: '📋', name: 'Loading Style', color: 'text-yellow-400' },
  compare_styles: { icon: '⚖️', name: 'Comparing Styles', color: 'text-orange-400' },
  knowledge_store: { icon: '📚', name: 'Accessing Knowledge', color: 'text-green-400' },
  image_to_code: { 
    icon: '💻', 
    name: 'Converting to Code', 
    color: 'text-indigo-400',
    steps: ['Loading image', 'Analyzing UI structure', 'Extracting components', 'Generating React code']
  },
  modify_code: { 
    icon: '✏️', 
    name: 'Modifying Code', 
    color: 'text-pink-400',
    steps: ['Loading current code', 'Analyzing changes', 'Applying modifications']
  },
  // Screen management tools
  list_screens: { icon: '📋', name: 'Listing Screens', color: 'text-blue-400' },
  load_screen: { icon: '📂', name: 'Loading Screen', color: 'text-cyan-400' },
  update_screen: { icon: '💾', name: 'Saving Screen', color: 'text-green-400' },
  create_screen: { icon: '➕', name: 'Creating Screen', color: 'text-emerald-400' },
  delete_screen: { icon: '🗑️', name: 'Deleting Screen', color: 'text-red-400' },
  // Screen generation tool
  generate_screen: { 
    icon: '📄', 
    name: 'Generating Screen', 
    color: 'text-violet-400',
    steps: ['Planning layout', 'Generating code', 'Saving to sandbox']
  },
  generate_multiple_design_images: { icon: '🎨', name: 'Generating Images', color: 'text-purple-400' },
  // Flow tools
  generate_flow_spec: { icon: '🔀', name: 'Creating Flow', color: 'text-amber-400' },
};

// Format JSON with syntax highlighting for display - show more content
function formatJsonValue(value: unknown, depth = 0, maxStringLen = 500): React.ReactNode {
  const indent = '  '.repeat(depth);
  
  if (value === null) return <span className="text-orange-400">null</span>;
  if (value === undefined) return <span className="text-gray-500">undefined</span>;
  if (typeof value === 'boolean') return <span className="text-purple-400">{value.toString()}</span>;
  if (typeof value === 'number') return <span className="text-cyan-400">{value}</span>;
  if (typeof value === 'string') {
    // Show more of the string content
    const displayValue = value.length > maxStringLen ? value.slice(0, maxStringLen) + `... (+${value.length - maxStringLen} chars)` : value;
    return <span className="text-green-400 whitespace-pre-wrap break-all">"{displayValue}"</span>;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400">[]</span>;
    return (
      <span className="block">
        <span className="text-gray-400">[</span>
        {value.slice(0, 10).map((item, i) => (
          <span key={i} className="block ml-2">
            {formatJsonValue(item, depth + 1, maxStringLen)}
            {i < Math.min(value.length, 10) - 1 && ','}
          </span>
        ))}
        {value.length > 10 && <span className="block text-gray-500 ml-2">...+{value.length - 10} more items</span>}
        <span className="text-gray-400">]</span>
      </span>
    );
  }
  
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return <span className="text-gray-400">{'{}'}</span>;
    return (
      <span className="block">
        <span className="text-gray-400">{'{'}</span>
        {entries.slice(0, 10).map(([k, v], i) => (
          <span key={k} className="block ml-2">
            <span className="text-blue-400">"{k}"</span>: {formatJsonValue(v, depth + 1, maxStringLen)}
            {i < Math.min(entries.length, 10) - 1 && ','}
          </span>
        ))}
        {entries.length > 10 && <span className="block text-gray-500 ml-2">...+{entries.length - 10} more keys</span>}
        <span className="text-gray-400">{'}'}</span>
      </span>
    );
  }
  
  return <span>{String(value)}</span>;
}

// Extract a short summary from tool result for compact display
function getResultSummary(result: string, maxLen = 60): string {
  try {
    const parsed = JSON.parse(result);
    // Use message, summary first line, or success status
    if (parsed.message) return parsed.message.slice(0, maxLen);
    if (parsed.summary) return parsed.summary.split('\n')[0].slice(0, maxLen);
    if (parsed.success === true) return `Success (${Object.keys(parsed).length} fields)`;
    if (parsed.success === false && parsed.error) return `Error: ${parsed.error.slice(0, maxLen - 7)}`;
    return result.slice(0, maxLen);
  } catch {
    return result.slice(0, maxLen);
  }
}

// Parse and format tool result - handles JSON strings
function formatToolResult(result: string): React.ReactNode {
  // Try to parse as JSON for pretty display
  try {
    const parsed = JSON.parse(result);
    
    // Special handling for business_dna results - show summary prominently
    if (parsed.business_dna && parsed.summary) {
      return (
        <div className="space-y-2">
          <div className="text-green-400 font-medium">✅ {parsed.message || 'Analysis complete'}</div>
          <div className="whitespace-pre-wrap text-muted-foreground">{parsed.summary}</div>
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-blue-400 hover:text-blue-300">
              View full DNA data ({parsed.image_count} images analyzed)
            </summary>
            <div className="mt-2 pl-2 border-l border-border">
              {formatJsonValue(parsed.business_dna, 0, 200)}
            </div>
          </details>
        </div>
      );
    }
    
    // For other JSON results, show formatted
    return formatJsonValue(parsed, 0, 300);
  } catch {
    // Not JSON, return as-is
    return <span className="whitespace-pre-wrap break-all">{result}</span>;
  }
}

// Tool call details component for hover display
function ToolCallDetails({ tool }: { tool: ToolActivity }) {
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const config = TOOL_CONFIG[tool.name] || { icon: '🔧', name: tool.name, color: 'text-gray-400' };
  
  const elapsedTime = tool.startTime 
    ? Math.floor((Date.now() - tool.startTime) / 1000) 
    : 0;
  
  const copyToClipboard = async (text: string, type: 'input' | 'output') => {
    await navigator.clipboard.writeText(text);
    if (type === 'input') {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };
  
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className={`font-medium ${config.color}`}>{config.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {tool.status === 'running' && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Running {elapsedTime > 0 && `${elapsedTime}s`}
            </Badge>
          )}
          {tool.status === 'completed' && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
          {tool.status === 'error' && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
              <XCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>
      </div>
      
      {/* Input Args */}
      {tool.args && Object.keys(tool.args).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-blue-400">Input Arguments</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => copyToClipboard(JSON.stringify(tool.args, null, 2), 'input')}
            >
              {copiedInput ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-md p-2 text-xs font-mono overflow-auto max-h-48">
            {formatJsonValue(tool.args)}
          </div>
        </div>
      )}
      
      {/* Output Result */}
      {tool.result && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${tool.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              Output Result
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => copyToClipboard(tool.result || '', 'output')}
            >
              {copiedOutput ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className={`${tool.status === 'error' ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'} border rounded-md p-2 text-xs font-mono overflow-auto max-h-64`}>
            <div className="text-muted-foreground">
              {formatToolResult(tool.result)}
            </div>
          </div>
        </div>
      )}
      
      {/* No data message */}
      {!tool.args && !tool.result && tool.status === 'running' && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Processing...
        </p>
      )}
    </div>
  );
}

// Enhanced tool display with progress steps
function ToolBadge({ tool, expanded = false }: { tool: ToolActivity; expanded?: boolean }) {
  const config = TOOL_CONFIG[tool.name] || { icon: '🔧', name: tool.name, color: 'text-gray-400' };
  const [currentStep, setCurrentStep] = useState(0);
  
  // Animate through steps while running
  useEffect(() => {
    if (tool.status === 'running' && config.steps) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % config.steps!.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [tool.status, config.steps]);
  
  const elapsedTime = tool.startTime ? Math.floor((Date.now() - tool.startTime) / 1000) : 0;
  
  const badgeContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-md text-xs overflow-hidden cursor-help ${
        tool.status === 'running' 
          ? 'bg-primary/10 border border-primary/20' 
          : tool.status === 'completed'
          ? 'bg-green-500/10 border border-green-500/20'
          : 'bg-red-500/10 border border-red-500/20'
      }`}
    >
      <div className="flex items-center gap-1.5 px-2 py-1">
        <span>{config.icon}</span>
        <span className={config.color}>{config.name}</span>
        {tool.status === 'running' && (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            {elapsedTime > 0 && (
              <span className="text-muted-foreground ml-1">{elapsedTime}s</span>
            )}
          </>
        )}
        {tool.status === 'completed' && (
          <CheckCircle2 className="w-3 h-3 text-green-500" />
        )}
        {tool.status === 'error' && (
          <XCircle className="w-3 h-3 text-red-500" />
        )}
      </div>
      
      {/* Progress steps animation */}
      {tool.status === 'running' && config.steps && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-2 pb-1.5 border-t border-primary/10"
        >
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
            <span className="text-primary">→</span>
            <motion.span
              key={currentStep}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
            >
              {config.steps[currentStep]}...
            </motion.span>
          </div>
        </motion.div>
      )}
      
      {/* Show result summary when completed */}
      {tool.status === 'completed' && tool.result && expanded && (
        <div className="px-2 pb-1.5 border-t border-green-500/10">
          <p className="text-[10px] text-muted-foreground mt-1 truncate">
            ✓ {getResultSummary(tool.result, 80)}
          </p>
        </div>
      )}
    </motion.div>
  );
  
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {badgeContent}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-[500px] max-h-[500px] overflow-auto p-3" 
        side="right" 
        align="start"
        sideOffset={8}
      >
        <ToolCallDetails tool={tool} />
      </HoverCardContent>
    </HoverCard>
  );
}

// Thinking indicator with contextual messages
function ThinkingIndicator({ hasTools }: { hasTools: boolean }) {
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const phases = [
    { icon: '🔍', text: 'Analyzing your request...' },
    { icon: '📋', text: 'Planning approach...' },
    { icon: '🧠', text: 'Thinking...' },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setThinkingPhase((prev) => (prev + 1) % phases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  if (hasTools) return null;
  
  const phase = phases[thinkingPhase];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-sm text-muted-foreground"
    >
      <motion.span
        key={thinkingPhase}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-base"
      >
        {phase.icon}
      </motion.span>
      <motion.span
        key={`text-${thinkingPhase}`}
        initial={{ opacity: 0, x: -5 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {phase.text}
      </motion.span>
      <motion.div
        className="flex gap-0.5"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="w-1 h-1 rounded-full bg-primary" />
        <span className="w-1 h-1 rounded-full bg-primary" />
        <span className="w-1 h-1 rounded-full bg-primary" />
      </motion.div>
    </motion.div>
  );
}

// Quick prompts - simplified
const QUICK_PROMPTS = [
  { label: 'Convert to code', prompt: 'Convert this UI screenshot to React + Tailwind code' },
  { label: 'Make a dashboard', prompt: 'Design a data dashboard showing' },
];

// Collapsible user message component
const USER_MESSAGE_COLLAPSE_THRESHOLD = 150; // characters
const USER_MESSAGE_COLLAPSED_HEIGHT = 72; // pixels (~3 lines)

function CollapsibleUserMessage({ content, messageId }: { content: string; messageId: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = content.length > USER_MESSAGE_COLLAPSE_THRESHOLD;
  
  if (!shouldCollapse) {
    return (
      <p className="text-sm whitespace-pre-wrap break-words">
        {renderMarkdown(content)}
      </p>
    );
  }
  
  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <motion.div
          initial={false}
          animate={{ 
            maxHeight: isExpanded ? 2000 : USER_MESSAGE_COLLAPSED_HEIGHT,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {renderMarkdown(content)}
          </p>
        </motion.div>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-primary to-transparent pointer-events-none" />
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-6 px-2 py-0 text-xs text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 self-start"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3 mr-1" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 mr-1" />
            Show more
          </>
        )}
      </Button>
    </div>
  );
}

// Panel resize constants
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 600;
const DEFAULT_PANEL_WIDTH = 400;

export function GenerationChat() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    addMessage,
    updateMessageState,
    addToolToMessage,
    updateToolInMessage,
    addImageToMessage,
    addSegmentToMessage,
    clearMessages,
    isGenerating,
    setIsGenerating,
    threadId,
    setThreadId,
    uploadedAssets,
    addDesign,
    generatedCode,
    setGeneratedCode,
    codeHistory,
    pushCodeHistory,
    undoCode,
    selectedElement,
    setSelectedElement,
    setIsCodeGenerating,
    generatedDesigns,
    currentRunId,
    setCurrentRunId,
  } = useDesignStore();

  // Clear chat and start new thread
  const handleClearChat = useCallback(async () => {
    clearMessages();
    setGeneratedCode('');
    setSelectedElement(null);
    const newThread = await createThread();
    setThreadId(newThread);
  }, [clearMessages, setThreadId, setGeneratedCode, setSelectedElement]);

  // Stop current generation - preserves context for follow-up
  const handleStop = useCallback(async () => {
    if (!isGenerating || !threadId || !currentRunId) return;
    
    try {
      await cancelRun(threadId, currentRunId);
      // Update the last assistant message to show it was stopped
      const lastAssistantMsg = messages.findLast(m => m.role === 'assistant' && m.isStreaming);
      if (lastAssistantMsg) {
        updateMessageState(lastAssistantMsg.id, {
          isStreaming: false,
          isThinking: false,
          content: lastAssistantMsg.content + '\n\n*[Generation stopped by user]*',
        });
      }
    } catch (error) {
      console.warn('Error stopping generation:', error);
    } finally {
      setIsGenerating(false);
      setIsCodeGenerating(false);
      setCurrentRunId(null);
    }
  }, [isGenerating, threadId, currentRunId, messages, updateMessageState, setIsGenerating, setIsCodeGenerating, setCurrentRunId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea when input changes (e.g., from quick prompts)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [input]);

  // Handle panel resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, e.clientX));
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Initialize thread on mount
  useEffect(() => {
    if (!threadId) {
      createThread().then(setThreadId).catch(console.error);
    }
  }, [threadId, setThreadId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    let userMessage = input.trim();
    const originalInput = input.trim();
    setInput('');
    setIsGenerating(true);

    // Add element context if selected
    if (selectedElement) {
      userMessage = `[Selected element: ${selectedElement.description}]\n\n${userMessage}`;
    }

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    addMessage({
      id: userMsgId,
      role: 'user',
      content: originalInput,
      timestamp: new Date(),
    });

    // Add placeholder for assistant
    const assistantMsgId = `assistant-${Date.now()}`;
    addMessage({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isThinking: true,
      activeTools: [],
      segments: [], // Initialize for chronological display
    });

    try {
      // Prepare images
      const MAX_TOTAL_SIZE = 5 * 1024 * 1024;
      const MAX_IMAGE_SIZE = 1 * 1024 * 1024;
      
      const validImages = uploadedAssets
        .filter((a) => a.type === 'image' && a.base64.length < MAX_IMAGE_SIZE)
        .sort((a, b) => a.base64.length - b.base64.length);
      
      const imageContexts: string[] = [];
      let totalSize = 0;
      for (const asset of validImages) {
        if (totalSize + asset.base64.length <= MAX_TOTAL_SIZE) {
          imageContexts.push(asset.base64);
          totalSize += asset.base64.length;
        } else break;
      }

      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread();
        setThreadId(currentThreadId);
      }

      // Add code context for modifications
      let fullMessage = userMessage;
      if (generatedCode && (
        userMessage.toLowerCase().includes('change') ||
        userMessage.toLowerCase().includes('modify') ||
        userMessage.toLowerCase().includes('update') ||
        userMessage.toLowerCase().includes('make') ||
        userMessage.toLowerCase().includes('add') ||
        selectedElement
      )) {
        fullMessage = `Current code:\n\`\`\`tsx\n${generatedCode}\n\`\`\`\n\n${userMessage}`;
      }

      // Track position in content that has been segmented (fixes trim mismatch bug)
      let lastSegmentedPosition = 0;
      // Track current tool ID for proper updates when same tool runs multiple times
      let currentToolId = '';
      
      for await (const chunk of streamMessage(
        currentThreadId,
        fullMessage,
        imageContexts.length > 0 ? imageContexts : undefined
      )) {
        switch (chunk.type) {
          case 'run_id':
            // Store the run ID so we can cancel if needed
            if (chunk.runId) {
              setCurrentRunId(chunk.runId);
            }
            break;

          case 'cancelled':
            // Handle graceful cancellation
            updateMessageState(assistantMsgId, {
              isStreaming: false,
              isThinking: false,
              content: (useDesignStore.getState().messages.find(m => m.id === assistantMsgId)?.content || '') + 
                '\n\n*[Generation stopped. You can continue with a follow-up message.]*',
            });
            break;

          case 'thinking':
            updateMessageState(assistantMsgId, { isThinking: true });
            break;

          case 'thought':
            // Agent's reasoning - show in italics style
            updateMessageState(assistantMsgId, {
              isThinking: false,
              content: chunk.content,
              isStreaming: true,
            });
            break;

          case 'tool_progress':
            // Update tool with progress info (use current tool ID)
            if (currentToolId) {
              updateToolInMessage(assistantMsgId, currentToolId, {
                result: chunk.content, // Progress message
              });
            }
            break;

          case 'text':
            // Track text for segmentation - update content
            updateMessageState(assistantMsgId, {
              isThinking: false,
              content: chunk.content,
              isStreaming: true,
            });
            break;

          case 'tool_start':
            // Before starting a tool, save any new text as a segment for chronological display
            {
              // Use getState() to get current messages (avoid stale closure)
              const currentMsg = useDesignStore.getState().messages.find(m => m.id === assistantMsgId);
              const currentText = currentMsg?.content || '';
              if (currentText && currentText.length > lastSegmentedPosition) {
                // Only segment the NEW text since last segment (use position, not string comparison)
                const newText = currentText.slice(lastSegmentedPosition).trim();
                if (newText) {
                  addSegmentToMessage(assistantMsgId, { type: 'text', content: newText }, currentText.length);
                }
                lastSegmentedPosition = currentText.length;
              }
            }
            // Generate unique tool ID for proper tracking when same tool runs multiple times
            currentToolId = `${chunk.toolName}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            addToolToMessage(assistantMsgId, {
              id: currentToolId,
              name: chunk.toolName || 'unknown',
              status: 'running',
              args: chunk.toolArgs,
              startTime: Date.now(),
            });
            // Track code-generating tools
            if (chunk.toolName === 'image_to_code' || chunk.toolName === 'modify_code' || chunk.toolName === 'update_screen') {
              setIsCodeGenerating(true);
            }
            break;

          case 'tool_end':
            // Use the tracked tool ID for proper updates
            if (currentToolId) {
              updateToolInMessage(assistantMsgId, currentToolId, {
                status: 'completed',
                result: chunk.content,
              });
            }
            // Track code-generating tools
            if (chunk.toolName === 'image_to_code' || chunk.toolName === 'modify_code' || chunk.toolName === 'update_screen') {
              setIsCodeGenerating(false);
            }
            break;

          case 'code':
            if (chunk.code) {
              setIsCodeGenerating(false);
              if (generatedCode) {
                pushCodeHistory(generatedCode);
              }
              setGeneratedCode(chunk.code);
              if (chunk.toolName === 'modify_code' || chunk.toolName === 'update_screen') {
                setSelectedElement(null);
              }
              updateMessageState(assistantMsgId, { codeGenerated: true });
              // Refresh registry to pick up updates
              fetch('/api/generate').catch(() => {});
            }
            break;

          case 'image':
            const imageValue = chunk.imageUrl || chunk.content;
            addImageToMessage(assistantMsgId, imageValue);
            const design: GeneratedDesign = {
              id: `design-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'image',
              imageBase64: imageValue,
              imageUrl: chunk.imageUrl,
              prompt: originalInput,
              designType: 'image',
              createdAt: new Date().toISOString(),
              threadId: currentThreadId,
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
            // Add any remaining text as a final segment
            {
              // Use getState() to get current messages (avoid stale closure)
              const currentMsg = useDesignStore.getState().messages.find(m => m.id === assistantMsgId);
              const currentText = currentMsg?.content || '';
              if (currentText && currentText.length > lastSegmentedPosition) {
                const newText = currentText.slice(lastSegmentedPosition).trim();
                if (newText) {
                  addSegmentToMessage(assistantMsgId, { type: 'text', content: newText }, currentText.length);
                }
              }
            }
            updateMessageState(assistantMsgId, {
              isStreaming: false,
              isThinking: false,
            });
            // Clear run ID when done
            setCurrentRunId(null);
            break;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const isTokenLimit = errorMsg.includes('too long') || errorMsg.includes('token');

      updateMessageState(assistantMsgId, {
        content: isTokenLimit
          ? 'Chat history too long. Starting fresh conversation...'
          : 'Sorry, there was an error. Please try again.',
        error: errorMsg,
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
      setIsCodeGenerating(false);
      setCurrentRunId(null);
    }
  }, [
    input, isGenerating, threadId, uploadedAssets, generatedCode, selectedElement,
    addMessage, updateMessageState, addToolToMessage, updateToolInMessage,
    addImageToMessage, clearMessages, setIsGenerating, setThreadId, addDesign,
    setGeneratedCode, pushCodeHistory, setSelectedElement, setIsCodeGenerating, setCurrentRunId,
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
    if (element) textareaRef.current?.focus();
  };

  // Handler for component errors - sends error to agent for auto-fix
  const handleComponentError = useCallback((componentName: string, error: string) => {
    console.error(`Component error in ${componentName}:`, error);
    // Could show a toast or notification here
  }, []);

  // Handler to fix errors with AI - sends a message to the agent
  const handleFixWithAI = useCallback(async (errorMessage: string) => {
    if (isGenerating) return;

    // Build a fix request message
    const fixRequest = `🔧 **Component Error Detected**\n\nThe following error occurred:\n\`\`\`\n${errorMessage}\n\`\`\`\n\nPlease fix this error in the component code.`;
    
    // Set input and trigger send
    setInput(fixRequest);
    
    // Small delay to ensure input is set before we check it
    setTimeout(() => {
      // We need to trigger the send manually since setInput is async
      const sendButton = document.querySelector('[data-send-button]') as HTMLButtonElement;
      if (sendButton) {
        sendButton.click();
      }
    }, 100);
  }, [isGenerating, setInput]);

  return (
    <div className="flex h-[calc(100vh-96px)] max-h-[calc(100vh-96px)] overflow-hidden min-h-0">
      {/* Chat Panel - Resizable */}
      <motion.div
        className="flex flex-col h-full min-h-0 max-h-full bg-background overflow-hidden relative"
        style={{ width: panelWidth }}
        layout
      >
        {/* Header */}
        <div className="border-b border-border px-4 py-2 flex justify-between items-center bg-muted/30">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Chat</span>
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
                  <Button variant="ghost" size="sm" onClick={undoCode}>
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo</TooltipContent>
              </Tooltip>
            )}
            <Button variant="ghost" size="sm" onClick={handleClearChat}>
              <RotateCcw className="w-4 h-4 mr-1" />
              New
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(!showPreview)}
                  className="h-8 w-8"
                >
                  {showPreview ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showPreview ? 'Hide Preview' : 'Show Preview'}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 min-h-0">
          <div className="space-y-4">
            {/* Welcome - simplified */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Code2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-lg font-semibold mb-1">Image to Code</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a screenshot and convert it to React + Tailwind
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((item) => (
                    <Button
                      key={item.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPrompt(item.prompt)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message list */}
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary'
                        : 'bg-gradient-to-br from-primary to-accent'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Content */}
                  <Card
                    className={`flex-1 p-3 max-w-[85%] ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                    }`}
                  >
                    {/* Enhanced thinking indicator */}
                    {message.isThinking && !message.content && (
                      <ThinkingIndicator hasTools={Boolean(message.activeTools?.length)} />
                    )}

                    {/* Chronological segments display (for assistant) - only when we have segments */}
                    {message.role === 'assistant' && message.segments && message.segments.length > 0 ? (
                      <div className="space-y-2">
                        {message.segments.map((segment, idx) => (
                          <div key={idx}>
                            {segment.type === 'text' && segment.content && (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {renderMarkdown(segment.content)}
                              </p>
                            )}
                            {segment.type === 'tool' && segment.tool && (
                              <ToolBadge 
                                tool={segment.tool} 
                                expanded={segment.tool.status === 'completed'} 
                              />
                            )}
                            {segment.type === 'image' && segment.imageUrl && (
                              <div className="mt-2">
                                <img 
                                  src={segment.imageUrl.startsWith('data:') ? segment.imageUrl : `data:image/png;base64,${segment.imageUrl}`}
                                  alt="Generated" 
                                  className="max-w-full rounded-lg" 
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        {/* Show unsegmented streaming text (text typed after last segment) */}
                        {message.isStreaming && message.content && (() => {
                          // Use segmentedUpTo position instead of calculating from trimmed segment lengths
                          const segmentedUpTo = message.segmentedUpTo || 0;
                          const unsegmentedText = message.content.slice(segmentedUpTo).trim();
                          return unsegmentedText ? (
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {renderMarkdown(unsegmentedText)}
                              <motion.span
                                className="inline-block w-1.5 h-4 ml-0.5 bg-current"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                              />
                            </p>
                          ) : (
                            <motion.span
                              className="inline-block w-1.5 h-4 ml-0.5 bg-current"
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            />
                          );
                        })()}
                        {/* Copy button for assistant */}
                        {!message.isStreaming && message.content && (
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => copyToClipboard(message.content, message.id)}
                            >
                              {copied === message.id ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Fallback: Text content (for user messages or messages without segments) */}
                        {message.content && (
                          <div className={message.role === 'user' ? '' : 'flex items-start justify-between gap-2'}>
                            {message.role === 'user' ? (
                              <CollapsibleUserMessage content={message.content} messageId={message.id} />
                            ) : (
                              <>
                                <p className="text-sm whitespace-pre-wrap break-words flex-1">
                                  {renderMarkdown(message.content)}
                                  {message.isStreaming && (
                                    <motion.span
                                      className="inline-block w-1.5 h-4 ml-0.5 bg-current"
                                      animate={{ opacity: [1, 0] }}
                                      transition={{ duration: 0.5, repeat: Infinity }}
                                    />
                                  )}
                                </p>
                                {!message.isStreaming && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 shrink-0"
                                    onClick={() => copyToClipboard(message.content, message.id)}
                                  >
                                    {copied === message.id ? (
                                      <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {/* Fallback: Tools at bottom (for messages without segments) */}
                        {message.activeTools && message.activeTools.length > 0 && (
                          <div className="flex flex-col gap-1.5 mt-2">
                            {message.activeTools.map((tool, idx) => (
                              <ToolBadge 
                                key={`${tool.name}-${idx}`} 
                                tool={tool} 
                                expanded={tool.status === 'completed'} 
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* Code success */}
                    {message.codeGenerated && !message.isStreaming && (
                      <div className="flex items-center gap-2 mt-2 p-2 rounded bg-green-500/10 border border-green-500/20">
                        <Code2 className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-green-400">Code generated - see preview →</span>
                      </div>
                    )}

                    {/* Error */}
                    {message.error && (
                      <div className="flex items-start gap-2 mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-red-400">{message.error}</p>
                          {message.error.includes('overloaded') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 h-6 text-xs text-red-400"
                              onClick={() => {
                                const lastUserMsg = messages.findLast(m => m.role === 'user');
                                if (lastUserMsg) {
                                  setInput(lastUserMsg.content);
                                  setTimeout(() => handleSend(), 0);
                                }
                              }}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {message.images.map((img, i) => {
                          const isUrl = img.startsWith('/') || img.startsWith('http');
                          const imgSrc = isUrl ? img : `data:image/png;base64,${img}`;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group rounded overflow-hidden"
                            >
                              <img src={imgSrc} alt={`Generated ${i + 1}`} className="w-full h-auto" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="secondary" size="icon" className="h-7 w-7">
                                  <Maximize2 className="w-3 h-3" />
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

        {/* Input */}
        <div className="border-t border-border p-3 bg-background">
          {/* Selected element indicator */}
          {selectedElement && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded bg-green-500/10 border border-green-500/20 text-xs">
              <MousePointer2 className="w-3 h-3 text-green-400" />
              <span className="text-muted-foreground flex-1 truncate">
                {selectedElement.description}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-xs"
                onClick={() => setSelectedElement(null)}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Asset pills */}
          {uploadedAssets.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              <ImageIcon className="w-3 h-3 text-muted-foreground" />
              {uploadedAssets.slice(0, 2).map((asset) => (
                <Badge key={asset.id} variant="secondary" className="text-xs py-0">
                  {asset.name.slice(0, 15)}{asset.name.length > 15 ? '...' : ''}
                </Badge>
              ))}
              {uploadedAssets.length > 2 && (
                <Badge variant="outline" className="text-xs py-0">
                  +{uploadedAssets.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Input box */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={selectedElement ? `How to modify ${selectedElement.tagName}...` : 'Describe what you want...'}
              className="min-h-[60px] max-h-[300px] pr-12 resize-none text-sm overflow-y-auto"
              disabled={isGenerating}
            />
            {isGenerating ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={handleStop}
                    className="absolute bottom-2 right-2 h-8 w-8"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop generation (context is preserved)</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute bottom-2 right-2 h-8 w-8 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                data-send-button
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Resize Handle */}
      <div
        ref={resizeRef}
        onMouseDown={() => setIsResizing(true)}
        className={`w-1 hover:w-1.5 bg-border hover:bg-primary/50 cursor-col-resize transition-all flex items-center justify-center group ${
          isResizing ? 'bg-primary/50 w-1.5' : ''
        }`}
      >
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>
      </div>

      {/* Preview Panel - Takes remaining space */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full min-h-0 flex-1 p-4 relative overflow-auto"
          >
            <CodePreview
              code={generatedCode}
              onElementSelect={handleElementSelect}
              selectedElement={selectedElement}
              isLoading={false}
              threadId={threadId}
              generatedDesigns={generatedDesigns}
              onComponentError={handleComponentError}
              onFixWithAI={handleFixWithAI}
              key={`preview-${generatedCode.length}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
