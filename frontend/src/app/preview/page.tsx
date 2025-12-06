'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react';

interface ComponentEntry {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
  prompt?: string;
  code?: string;
}

interface Registry {
  components: ComponentEntry[];
  lastUpdated: string | null;
  activeComponent: string | null;
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
          <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <span className="text-zinc-400 text-sm">Loading component...</span>
      </motion.div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <motion.div
        className="text-center max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center">
          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No Components Generated</h2>
        <p className="text-zinc-400 mb-6">
          Use the sandbox to upload a screenshot and generate your first React component.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate Component
        </a>
      </motion.div>
    </div>
  );
}

function SandpackPreviewComponent({ code }: { code: string }) {
  const files = {
    '/App.tsx': code,
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
    <SandpackProvider
      template="react-ts"
      files={files}
      theme="dark"
      options={{
        initMode: 'immediate',
        autorun: true,
        recompileMode: 'immediate',
        externalResources: ['https://cdn.tailwindcss.com'],
        classes: {
          'sp-wrapper': 'h-full',
          'sp-layout': 'h-full',
          'sp-preview': 'h-full',
          'sp-preview-container': 'h-full',
        },
      }}
      customSetup={{
        dependencies: {
          react: '19.2.0',
          'react-dom': '19.2.0',
          'lucide-react': '^0.556.0',
        },
      }}
    >
      <div className="h-full">
        <SandpackPreview
          showNavigator={false}
          showRefreshButton={false}
          style={{ height: '100%', minHeight: 'calc(100vh - 80px)' }}
        />
      </div>
    </SandpackProvider>
  );
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const urlComponentId = searchParams.get('id');

  const [registry, setRegistry] = useState<Registry | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(urlComponentId);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  // Fetch registry and selected component code
  useEffect(() => {
    let hasFixedInvalidId = false;
    
    async function fetchData() {
      try {
        // Fetch registry
        const res = await fetch('/api/generate');
        if (res.ok) {
          const data: Registry = await res.json();
          setRegistry(data);

          // Auto-select component - prefer activeComponent, then latest
          let currentId = selectedId;
          
          // If current selection is invalid format, reset it (only log once)
          if (currentId && !currentId.startsWith('comp_')) {
            if (!hasFixedInvalidId) {
              hasFixedInvalidId = true;
            }
            currentId = null;
          }
          
          // Fall back to activeComponent or latest
          if (!currentId) {
            currentId = data.activeComponent ||
              (data.components.length > 0 ? data.components[data.components.length - 1].id : null);
          }
          
          // Update state if we found a valid ID different from current
          if (currentId && currentId !== selectedId) {
            setSelectedId(currentId);
          }

          // Fetch code for selected component (only if valid format)
          if (currentId && currentId.startsWith('comp_')) {
            const codeRes = await fetch(`/api/generate?id=${currentId}&withCode=true`);
            if (codeRes.ok) {
              const compData = await codeRes.json();
              if (compData.code) {
                setSelectedCode(compData.code);
              }
            }
          }
        }
      } catch {
        // Silently fail on network errors
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // Fetch code when selection changes
  useEffect(() => {
    if (!selectedId) return;
    // Only fetch if it's a valid component ID format
    if (!selectedId.startsWith('comp_')) {
      // Invalid ID - will be auto-corrected by the registry fetch
      return;
    }

    async function fetchCode() {
      try {
        const codeRes = await fetch(`/api/generate?id=${selectedId}&withCode=true`);
        if (codeRes.ok) {
          const compData = await codeRes.json();
          if (compData.code) {
            setSelectedCode(compData.code);
          }
        }
      } catch {
        // Silently fail
      }
    }
    fetchCode();
  }, [selectedId]);

  // Update from URL - but only if URL has a valid component ID
  useEffect(() => {
    if (urlComponentId && urlComponentId !== selectedId && urlComponentId.startsWith('comp_')) {
      setSelectedId(urlComponentId);
    }
  }, [urlComponentId, selectedId]);

  if (!registry) {
    return <LoadingState />;
  }

  if (registry.components.length === 0) {
    return <EmptyState />;
  }

  const selectedComponent = registry.components.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <motion.header
        className="bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <span className="font-semibold text-white text-sm">Live Preview</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-500">Hot Reload</span>
            </div>
          </div>
        </div>

        {/* Component Selector */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white transition-colors"
          >
            <span className="truncate max-w-[200px]">
              {selectedComponent?.name || 'Select Component'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 w-72 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-2 border-b border-zinc-800">
                  <span className="text-xs text-zinc-500 px-2">Generated Components</span>
                </div>
                <div className="max-h-64 overflow-y-auto p-1">
                  {registry.components.slice().reverse().map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedId(comp.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        comp.id === selectedId
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="font-medium text-sm truncate">{comp.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {new Date(comp.createdAt).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Toggle & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Code
            </button>
          </div>
          
          <a
            href="/"
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Back to Studio"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </a>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {selectedCode ? (
          viewMode === 'preview' ? (
            <SandpackPreviewComponent code={selectedCode} />
          ) : (
            <SandpackProvider
              template="react-ts"
              files={{ '/App.tsx': selectedCode }}
              theme="dark"
            >
              <SandpackCodeEditor
                showLineNumbers
                showTabs={false}
                style={{ height: 'calc(100vh - 60px)' }}
              />
            </SandpackProvider>
          )
        ) : (
          <LoadingState />
        )}
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PreviewContent />
    </Suspense>
  );
}
