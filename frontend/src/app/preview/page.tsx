'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ComponentEntry {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
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
        <span className="text-zinc-400 text-sm">Loading...</span>
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
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate Component
        </Link>
      </motion.div>
    </div>
  );
}

function PreviewContent() {
  const searchParams = useSearchParams();
  const urlComponentId = searchParams.get('id');

  const [components, setComponents] = useState<ComponentEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(urlComponentId);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch components
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const res = await fetch('/api/generate');
        if (res.ok) {
          const data = await res.json();
          const sorted = [...(data.components || [])].sort(
            (a: ComponentEntry, b: ComponentEntry) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setComponents(sorted);
          
          // Auto-select first component if none selected
          if (!selectedId && sorted.length > 0) {
            setSelectedId(sorted[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch components:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComponents();
    const interval = setInterval(fetchComponents, 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // Fetch code when selection changes
  useEffect(() => {
    if (!selectedId) return;

    fetch(`/api/generate?id=${selectedId}&withCode=true`)
      .then(res => res.json())
      .then(data => {
        if (data.code) {
          setSelectedCode(data.code);
          window.history.pushState({}, '', `/preview?id=${selectedId}`);
        }
      })
      .catch(e => console.error('Failed to fetch code:', e));
  }, [selectedId]);

  // Sync URL to state
  useEffect(() => {
    if (urlComponentId && urlComponentId !== selectedId) {
      setSelectedId(urlComponentId);
    }
  }, [urlComponentId, selectedId]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (components.length === 0) {
    return <EmptyState />;
  }

  const selectedComponent = components.find(c => c.id === selectedId);
  const selectedIndex = components.findIndex(c => c.id === selectedId);

  const goToPrev = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : components.length - 1;
    setSelectedId(components[newIndex].id);
  };

  const goToNext = () => {
    const newIndex = selectedIndex < components.length - 1 ? selectedIndex + 1 : 0;
    setSelectedId(components[newIndex].id);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        {/* Logo & Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm">Preview</span>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {components.length > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={goToPrev} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-zinc-400">{selectedIndex + 1} / {components.length}</span>
              <button onClick={goToNext} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
          <span className="text-sm text-white font-medium">{selectedComponent?.name || 'Select'}</span>
        </div>

        {/* Actions */}
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
          
          {viewMode === 'preview' && (
            <button
              onClick={() => setRefreshKey(Date.now())}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900/95 border-r border-zinc-800 overflow-y-auto"
            >
              <div className="p-4">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Components
                </h2>
                <div className="space-y-1">
                  {components.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedId(comp.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        comp.id === selectedId
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'hover:bg-zinc-800 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm truncate">{comp.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {new Date(comp.createdAt).toLocaleString()}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedId && viewMode === 'preview' ? (
            <iframe
              key={`${selectedId}-${refreshKey}`}
              src={`/api/preview/${selectedId}?t=${refreshKey}`}
              className="w-full h-full border-0"
              style={{ background: 'hsl(240 10% 3.9%)' }}
              title={`Preview: ${selectedComponent?.name}`}
            />
          ) : selectedCode ? (
            <div className="h-full overflow-auto bg-[#1e1e1e]">
              <SyntaxHighlighter
                language="tsx"
                style={vscDarkPlus}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: '#1e1e1e',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  minHeight: '100%',
                }}
              >
                {selectedCode}
              </SyntaxHighlighter>
            </div>
          ) : (
            <LoadingState />
          )}
        </div>
      </div>
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
