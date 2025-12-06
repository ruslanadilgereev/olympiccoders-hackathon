'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

interface ComponentEntry {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
  prompt?: string;
}

interface Registry {
  components: ComponentEntry[];
  lastUpdated: string | null;
  activeComponent: string | null;
}

// Dynamic import cache
const componentCache: Record<string, React.ComponentType> = {};

function loadComponent(filename: string): React.ComponentType {
  if (!componentCache[filename]) {
    componentCache[filename] = dynamic(
      () => import(`./components/${filename.replace('.tsx', '')}`),
      {
        loading: () => (
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="animate-pulse text-zinc-400">Loading component...</div>
          </div>
        ),
        ssr: false,
      }
    );
  }
  return componentCache[filename];
}

export function GeneratedComponentRenderer() {
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch registry
  useEffect(() => {
    async function fetchRegistry() {
      try {
        const res = await fetch('/api/generate');
        if (res.ok) {
          const data = await res.json();
          setRegistry(data);
          // Auto-select active or latest component
          if (data.activeComponent) {
            setSelectedId(data.activeComponent);
          } else if (data.components.length > 0) {
            setSelectedId(data.components[data.components.length - 1].id);
          }
        }
      } catch (e) {
        setError('Failed to load component registry');
      }
    }
    fetchRegistry();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchRegistry, 2000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!registry || registry.components.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Components Yet</h2>
          <p className="text-zinc-400 max-w-md">
            Upload a UI screenshot and use the generate command to create your first component.
          </p>
        </div>
      </div>
    );
  }

  const selectedComponent = registry.components.find(c => c.id === selectedId);
  const Component = selectedComponent ? loadComponent(selectedComponent.filename) : null;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Component Selector Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="font-semibold text-white">Generated Preview</span>
          </div>

          <select
            value={selectedId || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {registry.components.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name} - {new Date(comp.createdAt).toLocaleTimeString()}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Preview
          </div>
        </div>
      </div>

      {/* Component Content */}
      <div className="pt-14">
        {Component ? <Component /> : null}
      </div>
    </div>
  );
}

export default GeneratedComponentRenderer;

