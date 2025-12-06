import { create } from 'zustand';

export interface UploadedAsset {
  id: string;
  name: string;
  type: 'image' | 'document';
  base64: string;
  preview?: string;
  analyzedStyle?: StyleAnalysis;
}

// Workspace Session - each uploaded image gets its own session
export interface WorkspaceSession {
  id: string;
  imageAsset: UploadedAsset;
  threadId: string | null;
  messages: Message[];
  generatedCode: string;
  codeHistory: string[];
  isGenerating: boolean;
  isCodeGenerating: boolean;
  agentStatus: AgentStatus;
  selectedElement: SelectedElement | null;
}

export interface StyleAnalysis {
  styleId: string;
  colors: ColorPalette;
  typography: TypographyInfo;
  layout: LayoutInfo;
  summary: string;
}

export interface ColorPalette {
  primary?: string;
  secondary?: string[];
  accent?: string[];
  background?: string;
  text?: string;
}

export interface TypographyInfo {
  headingStyle?: string;
  bodyStyle?: string;
  fontFamily?: string;
}

export interface LayoutInfo {
  gridSystem?: string;
  spacing?: string;
  alignment?: string;
}

export interface GeneratedDesign {
  id: string;
  imageBase64: string;
  prompt: string;
  designType: string;
  createdAt: string;
  aiNotes?: string;
}

export interface SelectedElement {
  description: string;
  path: string;
  tagName: string;
  textContent?: string;
  outerHTML?: string;
}

export interface ToolActivity {
  name: string;
  status: 'running' | 'completed' | 'error';
  args?: Record<string, unknown>;
  result?: string;
  startTime?: number;
}

// Agent processing phases for detailed UI feedback
export type AgentPhase = 
  | 'idle'           // No activity
  | 'thinking'       // Agent is analyzing the request
  | 'tool_running'   // A tool is currently executing
  | 'generating_code'// Specifically generating code
  | 'saving'         // Saving to sandbox
  | 'complete';      // Operation finished

export interface AgentStatus {
  phase: AgentPhase;
  currentTool?: string;
  message?: string;
  startTime?: number;
  progress?: number; // 0-100
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[];
  isStreaming?: boolean;
  isThinking?: boolean;
  activeTools?: ToolActivity[];
  error?: string;
  codeGenerated?: boolean;
}

interface DesignStore {
  // Multi-Workspace Sessions
  sessions: WorkspaceSession[];
  activeSessionIndex: number;
  addSession: (imageAsset: UploadedAsset) => void;
  removeSession: (id: string) => void;
  setActiveSession: (index: number) => void;
  nextSession: () => void;
  prevSession: () => void;
  updateSession: (id: string, updates: Partial<WorkspaceSession>) => void;
  addMessageToSession: (sessionId: string, message: Message) => void;
  updateMessageInSession: (sessionId: string, messageId: string, updates: Partial<Message>) => void;
  setSessionCode: (sessionId: string, code: string) => void;
  setSessionGenerating: (sessionId: string, value: boolean) => void;
  setSessionAgentPhase: (sessionId: string, phase: AgentPhase, message?: string, currentTool?: string) => void;
  clearSessionMessages: (sessionId: string) => void;
  getActiveSession: () => WorkspaceSession | null;

  // Assets (legacy - still used for upload zone)
  uploadedAssets: UploadedAsset[];
  addAsset: (asset: UploadedAsset) => void;
  removeAsset: (id: string) => void;
  updateAssetStyle: (id: string, style: StyleAnalysis) => void;
  clearAssets: () => void;

  // Generated Designs
  generatedDesigns: GeneratedDesign[];
  addDesign: (design: GeneratedDesign) => void;
  removeDesign: (id: string) => void;
  clearDesigns: () => void;

  // Chat
  messages: Message[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  updateMessageState: (id: string, updates: Partial<Message>) => void;
  addToolToMessage: (id: string, tool: ToolActivity) => void;
  updateToolInMessage: (id: string, toolName: string, updates: Partial<ToolActivity>) => void;
  addImageToMessage: (id: string, imageBase64: string) => void;
  clearMessages: () => void;

  // Code Builder State
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  codeHistory: string[];
  pushCodeHistory: (code: string) => void;
  undoCode: () => void;
  selectedElement: SelectedElement | null;
  setSelectedElement: (element: SelectedElement | null) => void;
  isCodeGenerating: boolean;
  setIsCodeGenerating: (value: boolean) => void;

  // Agent Status - Detailed tracking of agent phases
  agentStatus: AgentStatus;
  setAgentPhase: (phase: AgentPhase, message?: string, currentTool?: string) => void;
  resetAgentStatus: () => void;

  // UI State
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  activeTab: 'upload' | 'studio' | 'gallery';
  setActiveTab: (tab: 'upload' | 'studio' | 'gallery') => void;
  selectedDesign: GeneratedDesign | null;
  setSelectedDesign: (design: GeneratedDesign | null) => void;

  // Thread
  threadId: string | null;
  setThreadId: (id: string | null) => void;
  
  // Session management - flag to indicate new session needed
  needsNewSession: boolean;
  setNeedsNewSession: (value: boolean) => void;
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  // Multi-Workspace Sessions
  sessions: [],
  activeSessionIndex: 0,
  
  addSession: (imageAsset) =>
    set((state) => {
      const newSession: WorkspaceSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageAsset,
        threadId: null,
        messages: [],
        generatedCode: '',
        codeHistory: [],
        isGenerating: false,
        isCodeGenerating: false,
        agentStatus: { phase: 'idle' },
        selectedElement: null,
      };
      return {
        sessions: [...state.sessions, newSession],
        activeSessionIndex: state.sessions.length, // Switch to new session
      };
    }),
    
  removeSession: (id) =>
    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== id);
      const newIndex = Math.min(state.activeSessionIndex, Math.max(0, newSessions.length - 1));
      return {
        sessions: newSessions,
        activeSessionIndex: newIndex,
      };
    }),
    
  setActiveSession: (index) =>
    set((state) => ({
      activeSessionIndex: Math.max(0, Math.min(index, state.sessions.length - 1)),
    })),
    
  nextSession: () =>
    set((state) => ({
      activeSessionIndex: Math.min(state.activeSessionIndex + 1, state.sessions.length - 1),
    })),
    
  prevSession: () =>
    set((state) => ({
      activeSessionIndex: Math.max(state.activeSessionIndex - 1, 0),
    })),
    
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
    
  addMessageToSession: (sessionId, message) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, message] }
          : s
      ),
    })),
    
  updateMessageInSession: (sessionId, messageId, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId ? { ...m, ...updates } : m
              ),
            }
          : s
      ),
    })),
    
  setSessionCode: (sessionId, code) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              codeHistory: s.generatedCode ? [...s.codeHistory.slice(-19), s.generatedCode] : s.codeHistory,
              generatedCode: code,
            }
          : s
      ),
    })),
    
  setSessionGenerating: (sessionId, value) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, isGenerating: value } : s
      ),
    })),
    
  setSessionAgentPhase: (sessionId, phase, message, currentTool) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              agentStatus: {
                phase,
                message,
                currentTool,
                startTime: phase !== 'idle' && phase !== 'complete'
                  ? (s.agentStatus.startTime || Date.now())
                  : undefined,
              },
            }
          : s
      ),
    })),
    
  clearSessionMessages: (sessionId) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId ? { ...s, messages: [] } : s
      ),
    })),
    
  getActiveSession: () => {
    const state = get();
    return state.sessions[state.activeSessionIndex] || null;
  },

  // Assets (legacy)
  uploadedAssets: [],
  addAsset: (asset) =>
    set((state) => ({ uploadedAssets: [...state.uploadedAssets, asset] })),
  removeAsset: (id) =>
    set((state) => ({
      uploadedAssets: state.uploadedAssets.filter((a) => a.id !== id),
    })),
  updateAssetStyle: (id, style) =>
    set((state) => ({
      uploadedAssets: state.uploadedAssets.map((a) =>
        a.id === id ? { ...a, analyzedStyle: style } : a
      ),
    })),
  clearAssets: () => set({ uploadedAssets: [] }),

  // Generated Designs
  generatedDesigns: [],
  addDesign: (design) =>
    set((state) => ({ generatedDesigns: [design, ...state.generatedDesigns] })),
  removeDesign: (id) =>
    set((state) => ({
      generatedDesigns: state.generatedDesigns.filter((d) => d.id !== id),
    })),
  clearDesigns: () => set({ generatedDesigns: [] }),

  // Chat
  messages: [],
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content, isStreaming: content.length > 0 ? m.isStreaming : false } : m
      ),
    })),
  updateMessageState: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  addToolToMessage: (id, tool) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id 
          ? { ...m, activeTools: [...(m.activeTools || []), tool], isThinking: false }
          : m
      ),
    })),
  updateToolInMessage: (id, toolName, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id
          ? {
              ...m,
              activeTools: (m.activeTools || []).map((t) =>
                t.name === toolName ? { ...t, ...updates } : t
              ),
            }
          : m
      ),
    })),
  addImageToMessage: (id, imageBase64) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id
          ? { ...m, images: [...(m.images || []), imageBase64] }
          : m
      ),
    })),
  clearMessages: () => set({ messages: [] }),

  // Code Builder State
  generatedCode: '',
  setGeneratedCode: (code) => set({ generatedCode: code }),
  codeHistory: [],
  pushCodeHistory: (code) =>
    set((state) => ({
      codeHistory: [...state.codeHistory.slice(-19), code], // Keep last 20
    })),
  undoCode: () =>
    set((state) => {
      if (state.codeHistory.length === 0) return state;
      const newHistory = [...state.codeHistory];
      const previousCode = newHistory.pop() || '';
      return {
        codeHistory: newHistory,
        generatedCode: previousCode,
      };
    }),
  selectedElement: null,
  setSelectedElement: (element) => set({ selectedElement: element }),
  isCodeGenerating: false,
  setIsCodeGenerating: (value) => set({ isCodeGenerating: value }),

  // Agent Status - Detailed tracking
  agentStatus: { phase: 'idle' },
  setAgentPhase: (phase, message, currentTool) =>
    set((state) => ({
      agentStatus: {
        phase,
        message,
        currentTool,
        startTime: phase !== 'idle' && phase !== 'complete' 
          ? (state.agentStatus.startTime || Date.now()) 
          : undefined,
        progress: phase === 'complete' ? 100 : state.agentStatus.progress,
      },
    })),
  resetAgentStatus: () =>
    set({ agentStatus: { phase: 'idle' } }),

  // UI State
  isGenerating: false,
  setIsGenerating: (value) => set({ isGenerating: value }),
  activeTab: 'upload',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedDesign: null,
  setSelectedDesign: (design) => set({ selectedDesign: design }),

  // Thread
  threadId: null,
  setThreadId: (id) => set({ threadId: id }),
  
  // Session management
  needsNewSession: true, // Start with true so first visit creates new session
  setNeedsNewSession: (value) => set({ needsNewSession: value }),
}));

