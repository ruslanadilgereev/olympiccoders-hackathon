'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Loader2,
  Sparkles,
  Code2,
  Undo2,
  RotateCcw,
  Upload,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDesignStore, WorkspaceSession, Message, UploadedAsset } from '@/lib/store';
import { CodePreview } from '@/components/code-preview';
import { AIGenerationExperience } from '@/components/ai-generation-experience';
import { createThread, streamMessage } from '@/lib/langgraph-client';
import { saveAndPreview } from '@/lib/auto-open';
import { compressImage } from '@/lib/image-utils';

// Session Navigator - dots and arrows
function SessionNavigator({
  sessions,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: {
  sessions: WorkspaceSession[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (sessions.length === 0) return null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-background/80 backdrop-blur-sm border-b border-border">
      {/* Prev Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={activeIndex === 0}
        className="h-8 w-8"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Session Info */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="text-sm font-medium">
          Session {activeIndex + 1} / {sessions.length}
        </span>
        
        {/* Dots */}
        <div className="flex gap-1.5">
          {sessions.map((session, i) => (
            <button
              key={session.id}
              onClick={() => onSelect(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === activeIndex
                  ? 'bg-primary scale-125'
                  : session.isGenerating
                  ? 'bg-yellow-500 animate-pulse'
                  : session.generatedCode
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              title={session.imageAsset.name}
            />
          ))}
        </div>
      </div>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={activeIndex === sessions.length - 1}
        className="h-8 w-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Single Workspace View - Sandbox + Chat
function WorkspaceView({
  session,
  onClose,
}: {
  session: WorkspaceSession;
  onClose: () => void;
}) {
  const [input, setInput] = useState('');
  const [chatExpanded, setChatExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    updateSession,
    addMessageToSession,
    updateMessageInSession,
    setSessionCode,
    setSessionGenerating,
    setSessionAgentPhase,
  } = useDesignStore();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys handled by parent
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track thread ID in ref to avoid stale closure issues
  const threadIdRef = useRef<string | null>(session.threadId);
  
  // Keep ref in sync with session
  useEffect(() => {
    threadIdRef.current = session.threadId;
  }, [session.threadId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || session.isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setSessionGenerating(session.id, true);

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    addMessageToSession(session.id, {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Add placeholder for assistant
    const assistantMsgId = `assistant-${Date.now()}`;
    addMessageToSession(session.id, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isThinking: true,
    });

    try {
      // ALWAYS create a fresh thread for this session if we don't have one
      let threadId = threadIdRef.current;
      if (!threadId) {
        console.log(`[SESSION ${session.id}] Creating new thread...`);
        threadId = await createThread();
        threadIdRef.current = threadId;
        updateSession(session.id, { threadId });
        console.log(`[SESSION ${session.id}] Thread created: ${threadId}`);
      }

      // Send image only if no code generated yet
      let imageContexts: string[] = [];
      if (!session.generatedCode) {
        imageContexts = [session.imageAsset.base64];
        console.log(`[SESSION ${session.id}] Sending image for first request`);
      }

      for await (const chunk of streamMessage(
        threadId,
        userMessage,
        imageContexts.length > 0 ? imageContexts : undefined
      )) {
        switch (chunk.type) {
          case 'thinking':
            updateMessageInSession(session.id, assistantMsgId, {
              isThinking: true,
              content: '',
            });
            setSessionAgentPhase(session.id, 'thinking', 'Analyzing...');
            break;

          case 'text':
            updateMessageInSession(session.id, assistantMsgId, {
              isThinking: false,
              content: chunk.content,
              isStreaming: true,
            });
            break;

          case 'tool_start':
            if (chunk.toolName === 'image_to_code' || chunk.toolName === 'modify_code') {
              setSessionAgentPhase(session.id, 'generating_code', 'Generating code...', chunk.toolName);
              updateSession(session.id, { isCodeGenerating: true });
            }
            break;

          case 'tool_end':
            if (chunk.toolName === 'image_to_code' || chunk.toolName === 'modify_code') {
              updateSession(session.id, { isCodeGenerating: false });
              setSessionAgentPhase(session.id, 'saving', 'Saving...');
            }
            break;

          case 'code':
            if (chunk.code) {
              setSessionCode(session.id, chunk.code);
              updateSession(session.id, { isCodeGenerating: false });
              updateMessageInSession(session.id, assistantMsgId, {
                codeGenerated: true,
              });
              // Auto-save
              const componentName = `Generated_${Date.now()}`;
              saveAndPreview(chunk.code, componentName, userMessage);
            }
            break;

          case 'done':
            updateMessageInSession(session.id, assistantMsgId, {
              isStreaming: false,
              isThinking: false,
            });
            setSessionAgentPhase(session.id, 'complete', 'Done!');
            setTimeout(() => setSessionAgentPhase(session.id, 'idle'), 1500);
            break;

          case 'error':
            updateMessageInSession(session.id, assistantMsgId, {
              error: chunk.content,
              isStreaming: false,
              isThinking: false,
            });
            // If session expired (404), reset thread so next request creates new one
            if (chunk.content?.includes('Session abgelaufen') || chunk.content?.includes('404')) {
              threadIdRef.current = null;
              updateSession(session.id, { threadId: null });
            }
            break;
        }
      }
    } catch (error) {
      console.error('Error:', error);
      updateMessageInSession(session.id, assistantMsgId, {
        content: 'Error processing request.',
        error: error instanceof Error ? error.message : 'Unknown error',
        isStreaming: false,
        isThinking: false,
      });
    } finally {
      setSessionGenerating(session.id, false);
    }
  }, [
    input,
    session,
    addMessageToSession,
    updateMessageInSession,
    updateSession,
    setSessionCode,
    setSessionGenerating,
    setSessionAgentPhase,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isShowingGenerationExperience = 
    session.isGenerating && 
    !session.generatedCode && 
    session.agentStatus.phase !== 'idle';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sandbox Area - Takes remaining space */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 z-20 h-8 w-8 bg-background/80 backdrop-blur-sm"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Source Image Thumbnail */}
        <div className="absolute top-2 left-2 z-20">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-background/80 backdrop-blur-sm">
            <img
              src={session.imageAsset.preview || `data:image/jpeg;base64,${session.imageAsset.base64}`}
              alt={session.imageAsset.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Generation Experience Overlay */}
        <AnimatePresence>
          {isShowingGenerationExperience && (
            <AIGenerationExperience
              imageUrl={session.imageAsset.preview || `data:image/jpeg;base64,${session.imageAsset.base64}`}
              imageName={session.imageAsset.name}
              isGenerating={session.isGenerating}
            />
          )}
        </AnimatePresence>

        {/* Code Preview */}
        {session.generatedCode ? (
          <CodePreview
            code={session.generatedCode}
            onElementSelect={() => {}}
          />
        ) : !isShowingGenerationExperience ? (
          <div className="h-full flex items-center justify-center bg-slate-950">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
                <Code2 className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Convert</h3>
              <p className="text-sm text-white/60 max-w-xs">
                Type a message below to convert this image to React code
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Chat Panel - Collapsible, fixed height when expanded */}
      <div
        className={`border-t border-border bg-background flex-shrink-0 transition-all duration-200 ${
          chatExpanded ? 'h-56' : 'h-12'
        }`}
      >
        {/* Chat Header */}
        <button
          onClick={() => setChatExpanded(!chatExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Chat</span>
            <Badge variant="secondary" className="text-xs">
              {session.messages.length}
            </Badge>
          </div>
          <ChevronRight
            className={`w-4 h-4 transition-transform ${chatExpanded ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Chat Content */}
        {chatExpanded && (
          <div className="flex flex-col h-[calc(100%-48px)] overflow-hidden">
            {/* Messages - scrollable */}
            <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-2">
                  {session.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Start by asking to convert the image to code
                    </p>
                  ) : (
                    session.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.isThinking ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Thinking...
                            </span>
                          ) : (
                            msg.content || (msg.codeGenerated && '✅ Code generated!')
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            {/* Input - fixed at bottom */}
            <div className="p-3 border-t border-border flex-shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      session.generatedCode
                        ? "Describe changes... (e.g., 'make borders red')"
                        : "Convert to code..."
                    }
                    className="min-h-[40px] max-h-[80px] resize-none"
                    disabled={session.isGenerating}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || session.isGenerating}
                    size="icon"
                    className="h-10 w-10 shrink-0"
                  >
                    {session.isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Empty State - Upload prompt
function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="h-full flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center">
          <Upload className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Upload Images</h2>
        <p className="text-white/60 max-w-md mx-auto mb-6">
          Upload UI screenshots to convert them to React code.
          Each image gets its own workspace.
        </p>
        <Button onClick={onUpload} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Upload Images
        </Button>
      </div>
    </div>
  );
}

// Main Multi-Workspace Component
export function MultiWorkspace() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    sessions,
    activeSessionIndex,
    addSession,
    removeSession,
    setActiveSession,
    nextSession,
    prevSession,
  } = useDesignStore();

  const activeSession = sessions[activeSessionIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSession();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSession, nextSession]);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        // Compress image
        const base64 = await compressImage(file);
        const preview = `data:image/jpeg;base64,${base64}`;

        const asset: UploadedAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: 'image',
          base64,
          preview,
        };

        // Create session for this image
        addSession(asset);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  }, [addSession]);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      className="h-screen flex flex-col bg-background"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Navigator */}
      {sessions.length > 0 && (
        <SessionNavigator
          sessions={sessions}
          activeIndex={activeSessionIndex}
          onSelect={setActiveSession}
          onPrev={prevSession}
          onNext={nextSession}
        />
      )}

      {/* Add Button when sessions exist */}
      {sessions.length > 0 && (
        <div className="absolute top-2 right-16 z-30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 bg-background/80 backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {activeSession ? (
            <motion.div
              key={activeSession.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <WorkspaceView
                session={activeSession}
                onClose={() => removeSession(activeSession.id)}
              />
            </motion.div>
          ) : (
            <EmptyState onUpload={() => fileInputRef.current?.click()} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
