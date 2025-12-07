'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Code2,
  Eye,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Default placeholder when no component is selected
const DefaultPlaceholder = () => (
  <div className="min-h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/20 flex items-center justify-center">
        <Eye className="w-10 h-10 text-indigo-400/70" />
      </div>
      <h2 className="text-2xl font-bold text-white/90 mb-2">Preview Area</h2>
      <p className="text-gray-400 max-w-md">
        Your generated component will appear here. Upload a screenshot and describe what you want to build.
      </p>
    </div>
  </div>
);

interface RegistryComponent {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
}

interface CodePreviewProps {
  code?: string;
  isLoading?: boolean;
  // Legacy props - kept for compatibility, not used
  onElementSelect?: unknown;
  selectedElement?: unknown;
  threadId?: string | null;
  generatedDesigns?: unknown[];
  onComponentError?: unknown;
  onFixWithAI?: unknown;
}

// Convert React code to Angular (mocked conversion)
function convertReactToAngular(reactCode: string, componentName: string): string {
  if (!reactCode) return '// No React code to convert';
  
  // Extract the component body (simplified conversion)
  let templateContent = reactCode;
  
  // Remove imports
  templateContent = templateContent.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '');
  
  // Extract JSX from the return statement
  const returnMatch = templateContent.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/);
  let jsxContent = returnMatch ? returnMatch[1] : templateContent;
  
  // Convert React JSX to Angular template syntax
  jsxContent = jsxContent
    // className -> class
    .replace(/className=/g, 'class=')
    // onClick -> (click)
    .replace(/onClick=\{([^}]+)\}/g, '(click)="$1"')
    // onChange -> (change)
    .replace(/onChange=\{([^}]+)\}/g, '(change)="$1"')
    // onSubmit -> (ngSubmit)
    .replace(/onSubmit=\{([^}]+)\}/g, '(ngSubmit)="$1"')
    // {variable} -> {{ variable }} (but not event handlers)
    .replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, '{{ $1 }}')
    // {variable.property} -> {{ variable.property }}
    .replace(/\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g, '{{ $1 }}')
    // style={{ ... }} -> [ngStyle]="..."
    .replace(/style=\{\{([^}]+)\}\}/g, '[ngStyle]="{$1}"')
    // Remove React fragments
    .replace(/<>/g, '<ng-container>')
    .replace(/<\/>/g, '</ng-container>')
    // htmlFor -> for
    .replace(/htmlFor=/g, 'for=');

  const angularCode = `// Angular Component (Mocked Conversion)
// Note: This is a simplified conversion and may require manual adjustments

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-${componentName.toLowerCase().replace(/([A-Z])/g, '-$1').replace(/^-/, '')}',
  standalone: true,
  imports: [CommonModule],
  template: \`
${jsxContent.split('\n').map(line => '    ' + line).join('\n')}
  \`,
  styles: [\`
    /* Add Tailwind CSS or convert styles here */
    :host {
      display: block;
    }
  \`]
})
export class ${componentName}Component {
  // Add component logic here
  // Convert React useState to class properties
  // Convert React useEffect to ngOnInit/ngOnChanges
}
`;

  return angularCode;
}

export function CodePreview({ code, isLoading = false }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'angular'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Component state
  const [components, setComponents] = useState<RegistryComponent[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Fetch components list
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const res = await fetch('/api/generate');
        if (res.ok) {
          const data = await res.json();
          const sorted = [...(data.components || [])].sort(
            (a: RegistryComponent, b: RegistryComponent) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setComponents(sorted.slice(0, 10));
        }
      } catch (e) {
        console.error('Failed to fetch components:', e);
      }
    };

    fetchComponents();
    // Poll every 3 seconds for updates
    const interval = setInterval(fetchComponents, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch code when selection changes
  useEffect(() => {
    if (components.length === 0 || selectedIndex >= components.length) return;
    
    const component = components[selectedIndex];
    fetch(`/api/generate?id=${component.id}&withCode=true`)
      .then(res => res.json())
      .then(data => {
        if (data.code) setSelectedCode(data.code);
      })
      .catch(e => console.error('Failed to fetch code:', e));
  }, [selectedIndex, components]);

  // Use incoming code prop if provided
  useEffect(() => {
    if (code) {
      setSelectedCode(code);
      setSelectedIndex(0);
      setRefreshKey(Date.now());
    }
  }, [code]);

  const selectedComponent = components[selectedIndex];
  const displayCode = selectedCode || code || '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([displayCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedComponent?.name || 'component'}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setRefreshKey(Date.now());
  };

  const goToPrev = () => {
    setSelectedIndex(prev => prev > 0 ? prev - 1 : components.length - 1);
  };

  const goToNext = () => {
    setSelectedIndex(prev => prev < components.length - 1 ? prev + 1 : 0);
  };

  return (
    <motion.div 
      className={`flex flex-col h-full bg-background rounded-lg border border-border overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
      layout
    >
      {/* Component Selector */}
      {components.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
          <div className="flex bg-background rounded-md p-0.5 border border-border">
            <button className="px-2 py-1 text-xs rounded bg-primary text-primary-foreground flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              <span>{components.length}</span>
            </button>
          </div>

          {/* Navigation */}
          {components.length > 1 && (
            <>
              <button onClick={goToPrev} className="p-1 rounded hover:bg-muted">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[40px] text-center">
                {selectedIndex + 1} / {components.length}
              </span>
              <button onClick={goToNext} className="p-1 rounded hover:bg-muted">
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dropdown */}
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="flex-1 bg-background border border-border rounded px-2 py-1 text-xs truncate max-w-[180px]"
          >
            {components.map((comp, idx) => (
              <option key={comp.id} value={idx}>{comp.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code' | 'angular')}>
          <TabsList className="h-8">
            <TabsTrigger value="preview" className="text-xs gap-1.5 h-7 px-2.5">
              <Eye className="w-3.5 h-3.5" /> Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="text-xs gap-1.5 h-7 px-2.5">
              <Code2 className="w-3.5 h-3.5" /> React
            </TabsTrigger>
            <TabsTrigger value="angular" className="text-xs gap-1.5 h-7 px-2.5">
              <Code2 className="w-3.5 h-3.5" /> Angular
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          {activeTab === 'preview' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Preview</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Code</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDownload}>
                <Download className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download Code</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-sm z-10 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Code2 className="w-8 h-8 text-white" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Generating code...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'preview' && (
          <div className="h-full bg-zinc-950">
            {selectedComponent ? (
              <iframe
                key={`${selectedComponent.id}-${refreshKey}`}
                src={`/api/preview/${selectedComponent.id}?t=${refreshKey}`}
                className="w-full h-full border-0"
                style={{ minHeight: '100%', background: 'hsl(240 10% 3.9%)' }}
                title={`Preview: ${selectedComponent.name}`}
              />
            ) : (
              <DefaultPlaceholder />
            )}
          </div>
        )}
        {activeTab === 'code' && (
          <div className="h-full overflow-auto bg-[#1e1e1e]">
            {displayCode ? (
              <SyntaxHighlighter
                language="tsx"
                style={vscDarkPlus}
                showLineNumbers
                wrapLines
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: '#1e1e1e',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  height: '100%',
                }}
                lineNumberStyle={{
                  minWidth: '3em',
                  paddingRight: '1em',
                  color: '#6e7681',
                  userSelect: 'none',
                }}
              >
                {displayCode}
              </SyntaxHighlighter>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                No code to display
              </div>
            )}
          </div>
        )}
        {activeTab === 'angular' && (
          <div className="h-full overflow-auto bg-[#1e1e1e]">
            {displayCode ? (
              <SyntaxHighlighter
                language="typescript"
                style={vscDarkPlus}
                showLineNumbers
                wrapLines
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: '#1e1e1e',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  height: '100%',
                }}
                lineNumberStyle={{
                  minWidth: '3em',
                  paddingRight: '1em',
                  color: '#6e7681',
                  userSelect: 'none',
                }}
              >
                {convertReactToAngular(displayCode, selectedComponent?.name || 'Component')}
              </SyntaxHighlighter>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                No code to convert
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
