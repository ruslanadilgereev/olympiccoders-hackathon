import { create } from 'zustand';

export interface UploadedAsset {
  id: string;
  name: string;
  type: 'image' | 'document';
  base64: string;
  preview?: string;
  analyzedStyle?: StyleAnalysis;
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

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  images?: string[];
  isStreaming?: boolean;
}

interface DesignStore {
  // Assets
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
  clearMessages: () => void;

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
}

export const useDesignStore = create<DesignStore>((set) => ({
  // Assets
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
        m.id === id ? { ...m, content, isStreaming: false } : m
      ),
    })),
  clearMessages: () => set({ messages: [] }),

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
}));

