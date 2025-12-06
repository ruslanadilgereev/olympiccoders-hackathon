'use client';

import { useEffect, useRef, useState } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Eye,
  MousePointer2,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Element selection injection script
const ELEMENT_SELECTOR_SCRIPT = `
(function() {
  let hoveredElement = null;
  let selectedElement = null;
  let overlay = null;
  let selectionMode = true;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = 'element-selector-overlay';
    overlay.style.cssText = \`
      position: fixed;
      pointer-events: none;
      border: 2px solid #6366f1;
      background: rgba(99, 102, 241, 0.1);
      z-index: 99999;
      transition: all 0.1s ease;
      display: none;
    \`;
    document.body.appendChild(overlay);
  }

  function getElementDescription(el) {
    let desc = el.tagName.toLowerCase();
    if (el.id) desc += '#' + el.id;
    if (el.className && typeof el.className === 'string') {
      desc += '.' + el.className.split(' ').slice(0, 2).join('.');
    }
    const text = el.textContent?.trim().slice(0, 50);
    if (text) desc += ' "' + text + '"';
    return desc;
  }

  function getElementPath(el) {
    const path = [];
    while (el && el !== document.body) {
      let selector = el.tagName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
      } else if (el.className && typeof el.className === 'string') {
        selector += '.' + el.className.split(' ')[0];
      }
      path.unshift(selector);
      el = el.parentElement;
    }
    return path.join(' > ');
  }

  function updateOverlay(el, isSelected = false) {
    if (!overlay || !el) {
      if (overlay) overlay.style.display = 'none';
      return;
    }
    const rect = el.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.left = rect.left + 'px';
    overlay.style.top = rect.top + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.style.borderColor = isSelected ? '#22c55e' : '#6366f1';
    overlay.style.background = isSelected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)';
  }

  function handleMouseMove(e) {
    if (!selectionMode) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el !== overlay && el !== document.body && el !== document.documentElement) {
      hoveredElement = el;
      if (!selectedElement) {
        updateOverlay(el);
      }
      window.parent.postMessage({
        type: 'element-hover',
        description: getElementDescription(el),
        path: getElementPath(el),
        tagName: el.tagName.toLowerCase(),
      }, '*');
    }
  }

  function handleClick(e) {
    if (!selectionMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el !== overlay && el !== document.body && el !== document.documentElement) {
      selectedElement = el;
      updateOverlay(el, true);
      window.parent.postMessage({
        type: 'element-select',
        description: getElementDescription(el),
        path: getElementPath(el),
        tagName: el.tagName.toLowerCase(),
        textContent: el.textContent?.trim().slice(0, 100) || '',
        outerHTML: el.outerHTML.slice(0, 500),
      }, '*');
    }
    return false;
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape' && selectedElement) {
      selectedElement = null;
      updateOverlay(hoveredElement);
      window.parent.postMessage({ type: 'element-deselect' }, '*');
    }
  }

  // Listen for messages from parent
  window.addEventListener('message', (e) => {
    if (e.data.type === 'toggle-selection-mode') {
      selectionMode = e.data.enabled;
      if (!selectionMode) {
        overlay.style.display = 'none';
        selectedElement = null;
        hoveredElement = null;
      }
    } else if (e.data.type === 'clear-selection') {
      selectedElement = null;
      hoveredElement = null;
      overlay.style.display = 'none';
    }
  });

  // Initialize
  createOverlay();
  document.addEventListener('mousemove', handleMouseMove, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown, true);

  // Signal ready
  window.parent.postMessage({ type: 'selector-ready' }, '*');
})();
`;

// Default code when nothing is generated
const DEFAULT_CODE = `export default function GeneratedUI() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Upload a Screenshot</h2>
        <p className="text-gray-400 max-w-md">
          Upload a UI screenshot and I'll convert it to React + Tailwind code.
          You can then select elements and modify them with prompts.
        </p>
      </div>
    </div>
  );
}`;

interface SelectedElement {
  description: string;
  path: string;
  tagName: string;
  textContent?: string;
  outerHTML?: string;
}

interface CodePreviewProps {
  code: string;
  onElementSelect?: (element: SelectedElement | null) => void;
  onElementHover?: (element: { description: string; path: string; tagName: string } | null) => void;
  selectedElement?: SelectedElement | null;
  isLoading?: boolean;
  onCodeUpdate?: (code: string) => void;
}

function PreviewContent({ 
  onElementSelect, 
  onElementHover,
  selectionMode,
}: { 
  onElementSelect?: (element: SelectedElement | null) => void;
  onElementHover?: (element: { description: string; path: string; tagName: string } | null) => void;
  selectionMode: boolean;
}) {
  const { sandpack } = useSandpack();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'element-select') {
        onElementSelect?.({
          description: event.data.description,
          path: event.data.path,
          tagName: event.data.tagName,
          textContent: event.data.textContent,
          outerHTML: event.data.outerHTML,
        });
      } else if (event.data.type === 'element-hover') {
        onElementHover?.({
          description: event.data.description,
          path: event.data.path,
          tagName: event.data.tagName,
        });
      } else if (event.data.type === 'element-deselect') {
        onElementSelect?.(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onElementSelect, onElementHover]);

  // Inject selection script when iframe loads
  useEffect(() => {
    const iframe = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframeRef.current = iframe;
      
      const injectScript = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Check if already injected
            if (iframeDoc.getElementById('element-selector-script')) return;
            
            const script = iframeDoc.createElement('script');
            script.id = 'element-selector-script';
            script.textContent = ELEMENT_SELECTOR_SCRIPT;
            iframeDoc.body.appendChild(script);
          }
        } catch (e) {
          // Cross-origin issues, expected
        }
      };

      // Try to inject on load
      iframe.addEventListener('load', injectScript);
      // Also try immediately in case already loaded
      setTimeout(injectScript, 500);
      
      return () => iframe.removeEventListener('load', injectScript);
    }
  }, [sandpack.status]);

  // Toggle selection mode in iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ 
        type: 'toggle-selection-mode', 
        enabled: selectionMode 
      }, '*');
    }
  }, [selectionMode]);

  return (
    <SandpackPreview 
      showNavigator={false}
      showRefreshButton={false}
      style={{ height: '100%' }}
    />
  );
}

export function CodePreview({
  code,
  onElementSelect,
  onElementHover,
  selectedElement,
  isLoading = false,
  onCodeUpdate,
}: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [selectionMode, setSelectionMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<{ description: string } | null>(null);
  const [lastFetchedId, setLastFetchedId] = useState<string | null>(null);

  // Poll for live code updates from the API
  useEffect(() => {
    let isMounted = true;
    
    const fetchLatestCode = async () => {
      try {
        const res = await fetch('/api/generate');
        if (!res.ok || !isMounted) return;
        
        const data = await res.json();
        const activeId = data.activeComponent;
        
        // Only fetch if there's an active component we haven't fetched yet
        if (activeId && activeId !== lastFetchedId) {
          const codeRes = await fetch(`/api/generate?id=${activeId}&withCode=true`);
          if (!codeRes.ok || !isMounted) return;
          
          const compData = await codeRes.json();
          if (compData.code && isMounted) {
            setLastFetchedId(activeId);
            onCodeUpdate?.(compData.code);
          }
        }
      } catch (e) {
        // Silently fail on network errors
      }
    };

    // Poll every 1.5 seconds
    const interval = setInterval(fetchLatestCode, 1500);
    // Also fetch immediately
    fetchLatestCode();
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lastFetchedId, onCodeUpdate]);

  const displayCode = code || DEFAULT_CODE;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearSelection = () => {
    onElementSelect?.(null);
    // Also tell iframe to clear
    const iframe = document.querySelector('.sp-preview-iframe') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'clear-selection' }, '*');
    }
  };

  // Sandpack files configuration
  const files = {
    '/App.tsx': displayCode,
    '/index.tsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);`,
    '/styles.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}`,
  };

  return (
    <motion.div 
      className={`flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
      layout
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')}>
          <TabsList className="h-8">
            <TabsTrigger value="preview" className="text-xs gap-1.5 h-7 px-2.5">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs gap-1.5 h-7 px-2.5">
              <Code2 className="w-3.5 h-3.5" />
              Code
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          {/* Selection Mode Toggle */}
          {activeTab === 'preview' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectionMode ? 'default' : 'ghost'}
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSelectionMode(!selectionMode)}
                >
                  <MousePointer2 className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectionMode ? 'Selection Mode On' : 'Selection Mode Off'}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Copy Code */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Code</TooltipContent>
          </Tooltip>

          {/* Fullscreen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Selected Element Info */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3 py-2 bg-green-500/10 border-b border-green-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Selected
                </Badge>
                <span className="text-sm text-muted-foreground truncate max-w-[300px]">
                  {selectedElement.description}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={handleClearSelection}
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover Info */}
      <AnimatePresence>
        {hoveredElement && !selectedElement && selectionMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 py-1.5 bg-indigo-500/10 border-b border-indigo-500/20"
          >
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-muted-foreground truncate">
                {hoveredElement.description}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
              {/* Animated Icon */}
              <motion.div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Code2 className="w-8 h-8 text-white" />
              </motion.div>
              
              {/* Status Text */}
              <div>
                <motion.h3 
                  className="text-lg font-semibold text-foreground mb-1"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Converting to Code
                </motion.h3>
                <p className="text-sm text-muted-foreground">
                  Analyzing UI screenshot and generating React + Tailwind code...
                </p>
              </div>
              
              {/* Progress Steps */}
              <div className="flex flex-col gap-2 w-full mt-2">
                <motion.div 
                  className="flex items-center gap-2 text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-muted-foreground">Image uploaded</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  </div>
                  <span className="text-foreground">Analyzing layout & components</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.5, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">Generating React code</span>
                </motion.div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <SandpackProvider
          template="react-ts"
          files={files}
          theme="dark"
          options={{
            initMode: 'immediate',
            autorun: true,
            recompileMode: 'immediate',
            externalResources: [
              'https://cdn.tailwindcss.com',
            ],
            classes: {
              'sp-wrapper': 'h-full',
              'sp-layout': 'h-full',
              'sp-preview': 'h-full',
              'sp-preview-container': 'h-full',
            },
          }}
          customSetup={{
            dependencies: {
              'react': '19.2.0',
              'react-dom': '19.2.0',
              'lucide-react': '^0.556.0',
            },
          }}
        >
          {activeTab === 'preview' ? (
            <PreviewContent 
              onElementSelect={onElementSelect}
              onElementHover={setHoveredElement}
              selectionMode={selectionMode}
            />
          ) : (
            <SandpackCodeEditor 
              showLineNumbers
              showTabs={false}
              style={{ height: '100%' }}
            />
          )}
        </SandpackProvider>
      </div>
    </motion.div>
  );
}

