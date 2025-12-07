import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const GENERATED_DIR = path.join(process.cwd(), 'src', 'generated', 'components');
const REGISTRY_PATH = path.join(process.cwd(), 'src', 'generated', 'registry.json');

interface ComponentEntry {
  id: string;
  name: string;
  filename: string;
}

interface Registry {
  components: ComponentEntry[];
}

// Helper to sleep for a given number of milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to find component with retry logic for race condition handling
async function findComponentWithRetry(
  componentId: string,
  maxRetries: number = 3,
  delayMs: number = 200
): Promise<{ component: ComponentEntry | null; code: string | null; error: string | null }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Read registry
      const registryContent = await fs.readFile(REGISTRY_PATH, 'utf-8');
      const registry: Registry = JSON.parse(registryContent);
      
      // Try to find by ID first
      let component = registry.components.find(c => c.id === componentId);
      
      // Fallback: try to find by partial ID match (handles ID generation timing issues)
      if (!component) {
        component = registry.components.find(c => 
          componentId.includes(c.id) || c.id.includes(componentId)
        );
      }
      
      // Fallback: try to find by name if ID looks like a name
      if (!component && !componentId.startsWith('comp_')) {
        component = registry.components.find(c => 
          c.name === componentId || c.filename === `${componentId}.tsx`
        );
      }
      
      if (!component) {
        if (attempt < maxRetries - 1) {
          // Wait and retry - the registry might still be updating
          await sleep(delayMs);
          continue;
        }
        return { component: null, code: null, error: `Component '${componentId}' not found in registry after ${maxRetries} attempts` };
      }
      
      // Try to read the file with retry
      const filePath = path.join(GENERATED_DIR, component.filename);
      try {
        const code = await fs.readFile(filePath, 'utf-8');
        return { component, code, error: null };
      } catch (fileError) {
        if (attempt < maxRetries - 1) {
          // File might still be writing, wait and retry
          await sleep(delayMs);
          continue;
        }
        return { component, code: null, error: `Component file '${component.filename}' not readable` };
      }
    } catch (err) {
      if (attempt < maxRetries - 1) {
        await sleep(delayMs);
        continue;
      }
      return { component: null, code: null, error: `Registry error: ${err}` };
    }
  }
  
  return { component: null, code: null, error: 'Max retries exceeded' };
}

// Live preview - renders the component using Babel standalone
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const componentId = params.id;

    // Find component with retry logic to handle race conditions
    const { component, code, error } = await findComponentWithRetry(componentId);
    
    if (error || !component || !code) {
      console.error(`Preview error for ${componentId}:`, error);
      return new NextResponse(error || 'Component not found', { status: 404 });
    }

    // Clean the code for embedding
    // Remove TypeScript types, imports, and 'use client' directive
    let cleanCode = code
      .replace(/^['"]use client['"];?\s*/m, '')
      // Remove all import statements (React is loaded globally via CDN)
      .replace(/^import\s+(?:(?:\*\s+as\s+\w+|\{[^}]*\}|\w+|\w+\s*,\s*\{[^}]*\})\s+from\s+)?['"][^'"]*['"];?\s*$/gm, '')
      // Remove interface declarations (multi-line safe, handles Windows \r\n)
      .replace(/^interface\s+\w+\s*\{[\s\S]*?\r?\n\}/gm, '')
      // Remove type declarations
      .replace(/^type\s+\w+\s*=\s*[\s\S]*?;/gm, '')
      // FIRST: Remove inline object type annotations BEFORE stripping primitives
      // This handles: ({ props }: { id: string; name: string }) => 
      .replace(/:\s*\{[^{}]*\}(?=\s*\))/g, '')
      // Remove React type annotations
      .replace(/: React\.FC(<[^>]*>)?/g, '')
      .replace(/: React\.ReactNode/g, '')
      .replace(/: React\.ReactElement/g, '')
      // Remove function parameter type annotations like (props: SomeType)
      .replace(/:\s*[A-Z][A-Za-z0-9]*(?:\[\])?(?:\s*\|\s*[A-Za-z0-9]+)*(?=\s*[,)])/g, '')
      // Remove primitive type annotations
      .replace(/: string(?=\s*[,;)\]}])/g, '')
      .replace(/: number(?=\s*[,;)\]}])/g, '')
      .replace(/: boolean(?=\s*[,;)\]}])/g, '')
      .replace(/: any(?=\s*[,;)\]}])/g, '')
      .replace(/: void(?=\s*[,;)\]}])/g, '')
      // Remove tuple type annotations
      .replace(/: \[[^\]]*\]/g, '')
      // Remove generic type parameters (only after identifiers, not JSX tags)
      .replace(/(\w)<[A-Z][A-Za-z]*(\s*,\s*[A-Z][A-Za-z]*)*>/g, '$1')
      // Remove type assertions
      .replace(/as\s+\w+(\[\])?/g, '')
      // Remove union with undefined/null
      .replace(/\|\s*undefined/g, '')
      .replace(/\|\s*null/g, '')
      // Clean up any extra blank lines left by removed code
      .replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Extract export default component name
    const exportMatch = cleanCode.match(/export\s+default\s+(?:function\s+)?(\w+)/);
    const componentName = exportMatch ? exportMatch[1] : 'Component';
    
    // Remove export default - convert to regular function declaration
    // Handle: export default function Name() → function Name()
    // Handle: export default Name → (remove the line entirely)
    cleanCode = cleanCode
      .replace(/export\s+default\s+function\s+/g, 'function ')
      .replace(/^export\s+default\s+\w+;?\s*$/gm, '');

    // Return HTML page that renders the component live
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${component.name} - Live Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          },
          colors: {
            // shadcn/ui semantic colors
            border: "hsl(240 3.7% 15.9%)",
            input: "hsl(240 3.7% 15.9%)",
            ring: "hsl(240 4.9% 83.9%)",
            background: "hsl(240 10% 3.9%)",
            foreground: "hsl(0 0% 98%)",
            primary: { DEFAULT: "hsl(0 0% 98%)", foreground: "hsl(240 5.9% 10%)" },
            secondary: { DEFAULT: "hsl(240 3.7% 15.9%)", foreground: "hsl(0 0% 98%)" },
            destructive: { DEFAULT: "hsl(0 62.8% 30.6%)", foreground: "hsl(0 0% 98%)" },
            muted: { DEFAULT: "hsl(240 3.7% 15.9%)", foreground: "hsl(240 5% 64.9%)" },
            accent: { DEFAULT: "hsl(240 3.7% 15.9%)", foreground: "hsl(0 0% 98%)" },
            popover: { DEFAULT: "hsl(240 10% 3.9%)", foreground: "hsl(0 0% 98%)" },
            card: { DEFAULT: "hsl(240 10% 3.9%)", foreground: "hsl(0 0% 98%)" },
          },
          borderRadius: {
            lg: "0.5rem",
            md: "calc(0.5rem - 2px)",
            sm: "calc(0.5rem - 4px)",
          },
          // Support common DNA dimensions as arbitrary values work by default
          // Generated code uses Tailwind arbitrary values like bg-[#111318] directly
        }
      }
    }
  </script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    /* Use transparent background so component's own bg colors show through */
    html { background: transparent; }
    body { 
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: transparent;
      color: hsl(0 0% 98%);
      min-height: 100vh;
    }
    /* Let the component control its own background */
    #root { 
      min-height: 100vh; 
      background: transparent;
    }
    /* Common dark mode defaults that can be overridden by component */
    .dark {
      --background: 240 10% 3.9%;
      --foreground: 0 0% 98%;
    }
    .error-display {
      padding: 20px;
      background: hsl(0 62.8% 20%);
      color: white;
      border-radius: 8px;
      margin: 20px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      color: #a78bfa;
      /* Fallback dark background for loading state */
      background: #0f0f12;
    }
  </style>
</head>
<body class="dark">
  <div id="root"><div class="loading">Loading component...</div></div>
  
  <script type="text/babel" data-presets="react,typescript">
    // Destructure React hooks so they work when imports are stripped
    const { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer, useLayoutEffect, useId } = React;
    
    // Minimal UI component stubs for shadcn/ui compatibility
    const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
      const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
      const variants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      };
      const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      };
      return <button className={\`\${baseStyles} \${variants[variant] || variants.default} \${sizes[size] || sizes.default} \${className}\`} {...props}>{children}</button>;
    };
    
    const Card = ({ children, className = '', ...props }) => (
      <div className={\`rounded-lg border bg-card text-card-foreground shadow-sm \${className}\`} {...props}>{children}</div>
    );
    const CardHeader = ({ children, className = '', ...props }) => (
      <div className={\`flex flex-col space-y-1.5 p-6 \${className}\`} {...props}>{children}</div>
    );
    const CardTitle = ({ children, className = '', ...props }) => (
      <h3 className={\`text-2xl font-semibold leading-none tracking-tight \${className}\`} {...props}>{children}</h3>
    );
    const CardDescription = ({ children, className = '', ...props }) => (
      <p className={\`text-sm text-muted-foreground \${className}\`} {...props}>{children}</p>
    );
    const CardContent = ({ children, className = '', ...props }) => (
      <div className={\`p-6 pt-0 \${className}\`} {...props}>{children}</div>
    );
    const CardFooter = ({ children, className = '', ...props }) => (
      <div className={\`flex items-center p-6 pt-0 \${className}\`} {...props}>{children}</div>
    );
    
    const Badge = ({ children, className = '', variant = 'default', ...props }) => {
      const variants = {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'text-foreground border',
      };
      return <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors \${variants[variant] || variants.default} \${className}\`} {...props}>{children}</span>;
    };
    
    const Progress = ({ value = 0, className = '', ...props }) => (
      <div className={\`relative h-4 w-full overflow-hidden rounded-full bg-secondary \${className}\`} {...props}>
        <div className="h-full bg-primary transition-all" style={{ width: \`\${value}%\` }} />
      </div>
    );
    
    const Separator = ({ className = '', orientation = 'horizontal', ...props }) => (
      <div className={\`shrink-0 bg-border \${orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'} \${className}\`} {...props} />
    );
    
    const ScrollArea = ({ children, className = '', ...props }) => (
      <div className={\`overflow-auto \${className}\`} {...props}>{children}</div>
    );
    
    const Table = ({ children, className = '', ...props }) => (
      <div className="relative w-full overflow-auto">
        <table className={\`w-full caption-bottom text-sm \${className}\`} {...props}>{children}</table>
      </div>
    );
    const TableHeader = ({ children, ...props }) => <thead {...props}>{children}</thead>;
    const TableBody = ({ children, ...props }) => <tbody {...props}>{children}</tbody>;
    const TableRow = ({ children, className = '', ...props }) => (
      <tr className={\`border-b transition-colors hover:bg-muted/50 \${className}\`} {...props}>{children}</tr>
    );
    const TableHead = ({ children, className = '', ...props }) => (
      <th className={\`h-12 px-4 text-left align-middle font-medium text-muted-foreground \${className}\`} {...props}>{children}</th>
    );
    const TableCell = ({ children, className = '', ...props }) => (
      <td className={\`p-4 align-middle \${className}\`} {...props}>{children}</td>
    );
    
    const Input = ({ className = '', ...props }) => (
      <input className={\`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 \${className}\`} {...props} />
    );
    
    const Label = ({ children, className = '', ...props }) => (
      <label className={\`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 \${className}\`} {...props}>{children}</label>
    );
    
    const Checkbox = ({ className = '', checked, onCheckedChange, ...props }) => (
      <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange?.(e.target.checked)} className={\`h-4 w-4 rounded border border-primary \${className}\`} {...props} />
    );
    
    const Switch = ({ className = '', checked, onCheckedChange, ...props }) => (
      <button 
        role="switch" 
        aria-checked={checked}
        onClick={() => onCheckedChange?.(!checked)}
        className={\`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 \${checked ? 'bg-primary' : 'bg-input'} \${className}\`}
        {...props}
      >
        <span className={\`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform \${checked ? 'translate-x-5' : 'translate-x-0'}\`} />
      </button>
    );
    
    const Slider = ({ className = '', value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }) => (
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value[0]} 
        onChange={(e) => onValueChange?.([Number(e.target.value)])}
        className={\`w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer \${className}\`} 
        {...props} 
      />
    );
    
    const Select = ({ children, value, onValueChange, ...props }) => {
      const [open, setOpen] = React.useState(false);
      return <div className="relative" {...props}>{children}</div>;
    };
    const SelectTrigger = ({ children, className = '', ...props }) => (
      <button className={\`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm \${className}\`} {...props}>{children}</button>
    );
    const SelectValue = ({ placeholder, ...props }) => <span {...props}>{placeholder}</span>;
    const SelectContent = ({ children, ...props }) => <div className="absolute z-50 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md" {...props}>{children}</div>;
    const SelectItem = ({ children, value, ...props }) => <div className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm hover:bg-accent" {...props}>{children}</div>;
    
    const Tabs = ({ children, defaultValue, value, onValueChange, className = '', ...props }) => {
      const [activeTab, setActiveTab] = React.useState(value || defaultValue);
      return <div className={className} {...props}>{React.Children.map(children, child => 
        React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab: onValueChange || setActiveTab }) : child
      )}</div>;
    };
    const TabsList = ({ children, className = '', activeTab, setActiveTab, ...props }) => (
      <div className={\`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground \${className}\`} {...props}>
        {React.Children.map(children, child => 
          React.isValidElement(child) ? React.cloneElement(child, { activeTab, setActiveTab }) : child
        )}
      </div>
    );
    const TabsTrigger = ({ children, value, className = '', activeTab, setActiveTab, ...props }) => (
      <button 
        onClick={() => setActiveTab?.(value)}
        className={\`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all \${activeTab === value ? 'bg-background text-foreground shadow-sm' : ''} \${className}\`} 
        {...props}
      >{children}</button>
    );
    const TabsContent = ({ children, value, className = '', activeTab, ...props }) => 
      activeTab === value ? <div className={\`mt-2 \${className}\`} {...props}>{children}</div> : null;
    
    const Avatar = ({ children, className = '', ...props }) => (
      <span className={\`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full \${className}\`} {...props}>{children}</span>
    );
    const AvatarImage = ({ src, alt, className = '', ...props }) => (
      <img src={src} alt={alt} className={\`aspect-square h-full w-full \${className}\`} {...props} />
    );
    const AvatarFallback = ({ children, className = '', ...props }) => (
      <span className={\`flex h-full w-full items-center justify-center rounded-full bg-muted \${className}\`} {...props}>{children}</span>
    );
    
    const Tooltip = ({ children, ...props }) => <>{children}</>;
    const TooltipTrigger = ({ children, asChild, ...props }) => <>{children}</>;
    const TooltipContent = ({ children, ...props }) => null;
    const TooltipProvider = ({ children, ...props }) => <>{children}</>;
    
    const Dialog = ({ children, open, onOpenChange, ...props }) => open ? <>{children}</> : null;
    const DialogTrigger = ({ children, asChild, ...props }) => <>{children}</>;
    const DialogContent = ({ children, className = '', ...props }) => (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/80" />
        <div className={\`relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg \${className}\`} {...props}>{children}</div>
      </div>
    );
    const DialogHeader = ({ children, className = '', ...props }) => <div className={\`flex flex-col space-y-1.5 text-center sm:text-left \${className}\`} {...props}>{children}</div>;
    const DialogTitle = ({ children, className = '', ...props }) => <h2 className={\`text-lg font-semibold leading-none tracking-tight \${className}\`} {...props}>{children}</h2>;
    const DialogDescription = ({ children, className = '', ...props }) => <p className={\`text-sm text-muted-foreground \${className}\`} {...props}>{children}</p>;
    
    const Alert = ({ children, className = '', variant = 'default', ...props }) => (
      <div className={\`relative w-full rounded-lg border p-4 \${variant === 'destructive' ? 'border-destructive/50 text-destructive' : ''} \${className}\`} {...props}>{children}</div>
    );
    const AlertTitle = ({ children, className = '', ...props }) => <h5 className={\`mb-1 font-medium leading-none tracking-tight \${className}\`} {...props}>{children}</h5>;
    const AlertDescription = ({ children, className = '', ...props }) => <div className={\`text-sm \${className}\`} {...props}>{children}</div>;
    
    const Textarea = ({ className = '', ...props }) => (
      <textarea className={\`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 \${className}\`} {...props} />
    );
    
    // DropdownMenu components - fully functional with open/close state
    const DropdownMenu = ({ children, ...props }) => {
      const [open, setOpen] = React.useState(false);
      return (
        <div className="relative inline-block" {...props}>
          {React.Children.map(children, child => 
            React.isValidElement(child) ? React.cloneElement(child, { open, setOpen }) : child
          )}
        </div>
      );
    };
    const DropdownMenuTrigger = ({ children, asChild, open, setOpen, ...props }) => {
      const handleClick = (e) => {
        e.stopPropagation();
        setOpen?.(!open);
      };
      if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { onClick: handleClick });
      }
      return <button onClick={handleClick} {...props}>{children}</button>;
    };
    const DropdownMenuContent = ({ children, className = '', align = 'end', open, setOpen, ...props }) => {
      React.useEffect(() => {
        if (open) {
          const handleClickOutside = () => setOpen?.(false);
          document.addEventListener('click', handleClickOutside);
          return () => document.removeEventListener('click', handleClickOutside);
        }
      }, [open, setOpen]);
      if (!open) return null;
      const alignClass = align === 'end' ? 'right-0' : 'left-0';
      return (
        <div 
          className={\`absolute z-50 min-w-[8rem] rounded-md border border-border bg-popover p-1 shadow-md mt-2 \${alignClass} \${className}\`} 
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {children}
        </div>
      );
    };
    const DropdownMenuItem = ({ children, className = '', ...props }) => (
      <div 
        className={\`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground \${className}\`} 
        {...props}
      >
        {children}
      </div>
    );
    const DropdownMenuSeparator = ({ className = '', ...props }) => (
      <div className={\`-mx-1 my-1 h-px bg-border \${className}\`} {...props} />
    );
    const DropdownMenuLabel = ({ children, className = '', ...props }) => (
      <div className={\`px-2 py-1.5 text-sm font-semibold \${className}\`} {...props}>{children}</div>
    );
    
    // HoverCard components
    const HoverCard = ({ children, ...props }) => <div className="relative inline-block" {...props}>{children}</div>;
    const HoverCardTrigger = ({ children, asChild, ...props }) => <>{children}</>;
    const HoverCardContent = ({ children, className = '', ...props }) => (
      <div className={\`absolute z-50 w-64 rounded-md border bg-popover p-4 shadow-md \${className}\`} {...props}>{children}</div>
    );
    
    // Lucide icon component that renders actual icons using lucide global
    const createLucideIcon = (name) => {
      const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
      return ({ className = '', size, ...props }) => {
        const sizeVal = size || 24;
        const ref = React.useRef(null);
        
        React.useEffect(() => {
          if (ref.current && window.lucide) {
            // Clear previous content
            ref.current.innerHTML = '';
            // Create icon using lucide
            try {
              window.lucide.createIcons({
                icons: { [kebabName]: window.lucide.icons[kebabName] },
                attrs: {
                  width: sizeVal,
                  height: sizeVal,
                  stroke: 'currentColor',
                  'stroke-width': 2,
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                  fill: 'none',
                  class: className,
                }
              });
              // Find and clone the icon
              const iconEl = document.querySelector(\`[data-lucide="\${kebabName}"]\`);
              if (iconEl) {
                ref.current.appendChild(iconEl.cloneNode(true));
              }
            } catch (e) {
              // Fallback - render inline placeholder
              ref.current.innerHTML = \`<svg xmlns="http://www.w3.org/2000/svg" width="\${sizeVal}" height="\${sizeVal}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="\${className}"><circle cx="12" cy="12" r="10"/></svg>\`;
            }
          }
        }, []);
        
        // Render inline with data-lucide attribute for lucide to pick up
        return React.createElement('i', {
          ref,
          'data-lucide': kebabName,
          className: \`lucide-icon \${className}\`,
          style: { display: 'inline-flex', width: sizeVal, height: sizeVal },
          ...props
        });
      };
    };
    
    // Simpler fallback icon that uses inline SVG from a common icon set
    const createIconStub = (name) => {
      const kebabName = name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
      
      // Common icon paths - add more as needed
      const iconPaths = {
        'check': '<polyline points="20 6 9 17 4 12"/>',
        'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
        'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
        'minus': '<line x1="5" y1="12" x2="19" y2="12"/>',
        'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
        'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
        'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
        'chevron-up': '<polyline points="18 15 12 9 6 15"/>',
        'arrow-right': '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
        'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
        'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
        'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
        'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'bell': '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
        'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
        'folder': '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
        'file': '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
        'trash': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
        'edit': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
        'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
        'eye-off': '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
        'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
        'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
        'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        'external-link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
        'mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
        'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
        'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
        'more-horizontal': '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
        'more-vertical': '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
        'refresh-cw': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
        'loader': '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>',
        'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
        'info': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
        'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
        'check-circle-2': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
        'x-circle': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
        'server': '<rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>',
        'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
        'activity': '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
        'bar-chart': '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
        'pie-chart': '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
        'layout': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
        'grid': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
        'list': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
        'menu': '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
        'copy': '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
        'clipboard': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
        'save': '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
        'play': '<polygon points="5 3 19 12 5 21 5 3"/>',
        'pause': '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
        'square': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>',
        'circle': '<circle cx="12" cy="12" r="10"/>',
        'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
        'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
        'award': '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
        'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        'box': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
        'package': '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
        'layers': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
        'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
        'terminal': '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
        'code': '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
        'hash': '<line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>',
        'at-sign': '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>',
        'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
        'map': '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
        'compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
        'navigation': '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
        'move': '<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>',
        'maximize': '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>',
        'minimize': '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>',
        'log-in': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>',
        'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
        'power': '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
        'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
        'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
        'unlock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
        'key': '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
        'image': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
        'camera': '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
        'video': '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
        'mic': '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
        'volume-2': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
        'headphones': '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
        'wifi': '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>',
        'bluetooth': '<polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5"/>',
        'battery': '<rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/>',
        'cpu': '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>',
        'hard-drive': '<line x1="22" y1="12" x2="2" y2="12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" y1="16" x2="6.01" y2="16"/><line x1="10" y1="16" x2="10.01" y2="16"/>',
        'cloud': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
        'sun': '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
        'moon': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
        'thermometer': '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
        'droplet': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
        'wind': '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
        'umbrella': '<path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>',
        'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
        'trending-down': '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
        'dollar-sign': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
        'credit-card': '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
        'shopping-cart': '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
        'shopping-bag': '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
        'gift': '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
        'tag': '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
        'bookmark': '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
        'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
        'thumbs-up': '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
        'thumbs-down': '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>',
        'message-square': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        'message-circle': '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
        'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
        'send': '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
        'share': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
        'share-2': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
        'rss': '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>',
        'printer': '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
        'trash-2': '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
        'archive': '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
        'sliders': '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
        'toggle-left': '<rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="8" cy="12" r="3"/>',
        'toggle-right': '<rect x="1" y="5" width="22" height="14" rx="7" ry="7"/><circle cx="16" cy="12" r="3"/>',
        'rotate-cw': '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
        'rotate-ccw': '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
        'shuffle': '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
        'repeat': '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
        'skip-back': '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>',
        'skip-forward': '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>',
        'rewind': '<polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/>',
        'fast-forward': '<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>',
        'volume-x': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
        'volume-1': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
        'paperclip': '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
        'arrow-left-right': '<polyline points="17 11 21 7 17 3"/><line x1="21" y1="7" x2="9" y2="7"/><polyline points="7 21 3 17 7 13"/><line x1="3" y1="17" x2="15" y2="17"/>',
        'arrow-up-down': '<polyline points="11 17 7 21 3 17"/><line x1="7" y1="21" x2="7" y2="9"/><polyline points="21 7 17 3 13 7"/><line x1="17" y1="3" x2="17" y2="15"/>',
        // Additional icons for generated components
        'castle': '<path d="M22 20v-9H2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><path d="M18 11V4H6v7"/><path d="M15 22v-4a3 3 0 0 0-6 0v4"/><path d="M22 11V9"/><path d="M2 11V9"/><path d="M6 4V2"/><path d="M18 4V2"/><path d="M10 4V2"/><path d="M14 4V2"/>',
        'gauge': '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
        'pause-circle': '<circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/>',
        'play-circle': '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
        'stop-circle': '<circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/>',
        'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
        'circle-x': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
        'circle-alert': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        'circle-help': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
        'circle-plus': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>',
        'circle-minus': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
        'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
        'building': '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
        'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
        'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
        'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
        'wand': '<path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/>',
        'wand-2': '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
        'scan': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>',
        'scan-line': '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>',
        'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
        'workflow': '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
        'git-pull-request': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/>',
        'git-merge': '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
        'git-commit': '<circle cx="12" cy="12" r="3"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/>',
        'file-text': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>',
        'file-check': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>',
        'file-plus': '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
        'folder-open': '<path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>',
        'folder-plus': '<path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
        'settings-2': '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
        'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
        'info-circle': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        'alert-octagon': '<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        'plug': '<path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6V8Z"/>',
        'plug-2': '<path d="M9 2v6"/><path d="M15 2v6"/><path d="M12 17v5"/><path d="M5 8h14"/><path d="M6 11V8h12v3a6 6 0 1 1-12 0v0Z"/>',
        'unplug': '<path d="m19 5 3-3"/><path d="m2 22 3-3"/><path d="M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z"/><path d="M7.5 13.5 10 11"/><path d="M10.5 16.5 13 14"/><path d="m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z"/>',
        'timer': '<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="12" y2="8"/><circle cx="12" cy="14" r="8"/>',
        'timer-off': '<path d="M10 2h4"/><path d="M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7"/><path d="M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2"/><path d="m2 2 20 20"/><path d="M12 12v-2"/>',
        'hourglass': '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
        'alarm-clock': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/>',
        'bell-ring': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="M4 2C2.8 3.7 2 5.7 2 8"/><path d="M22 8c0-2.3-.8-4.3-2-6"/>',
        'bell-off': '<path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5"/><path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/><path d="m2 2 20 20"/>',
        'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
        'user-minus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/>',
        'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
        'user-x': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/>',
        'loader-2': '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
        'refresh-ccw': '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
        'grip-vertical': '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
        'grip-horizontal': '<circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/>',
        'panel-left': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
        'panel-right': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="15" y1="3" x2="15" y2="21"/>',
        'panel-top': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/>',
        'panel-bottom': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="15" x2="21" y2="15"/>',
        'columns': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" y1="3" x2="12" y2="21"/>',
        'rows': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="12" x2="21" y2="12"/>',
        'sidebar': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>',
        'sidebar-close': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
        'sidebar-open': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',
        'list-todo': '<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
        'list-checks': '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
        'clipboard-check': '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
        'clipboard-list': '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
        'clipboard-copy': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M16 4h2a2 2 0 0 1 2 2v4"/><path d="M21 14H11"/><path d="m15 10-4 4 4 4"/>',
      };
      
      return ({ className = '', size, ...props }) => {
        const sizeVal = size || 24;
        const pathData = iconPaths[kebabName] || iconPaths['circle'] || '<circle cx="12" cy="12" r="10"/>';
        
        return React.createElement('svg', {
          className: \`lucide lucide-\${kebabName} \${className}\`,
          xmlns: 'http://www.w3.org/2000/svg',
          width: sizeVal,
          height: sizeVal,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          dangerouslySetInnerHTML: { __html: pathData },
          ...props
        });
      };
    };
    
    // Auto-generate all icons used in the component (parsed from imports)
    ${(() => {
      // Extract icon names from lucide-react imports in the original code
      const lucideImportMatch = code.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/);
      if (!lucideImportMatch) return '// No lucide icons imported';
      
      // Parse icon imports, handling aliases like "Link as LinkIcon"
      const iconImports = lucideImportMatch[1]
        .split(',')
        .map(s => {
          const trimmed = s.trim();
          // Handle "Link as LinkIcon" -> { original: 'Link', alias: 'LinkIcon' }
          const aliasMatch = trimmed.match(/^(\w+)\s+as\s+(\w+)$/);
          if (aliasMatch) {
            return { original: aliasMatch[1], alias: aliasMatch[2] };
          }
          // Regular import "Check" -> { original: 'Check', alias: 'Check' }
          return { original: trimmed, alias: trimmed };
        })
        .filter(s => s.alias && /^[A-Z]/.test(s.alias));  // Only PascalCase names
      
      // Generate stub declarations using the alias name but original icon name for the stub
      return iconImports.map(({original, alias}) => 
        `const ${alias} = createIconStub('${original}');`
      ).join('\n    ');
    })()}
    
    // Fallback for undefined icon variables that may appear in generated code
    const icon = null;
    
    // cn utility
    const cn = (...classes) => classes.filter(Boolean).join(' ');
    
    // Framer motion stubs
    const motion = {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
      h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
      h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
      h3: ({ children, ...props }) => <h3 {...props}>{children}</h3>,
    };
    const AnimatePresence = ({ children }) => <>{children}</>;
    
    try {
      ${cleanCode}
      
      // Small delay to ensure Babel has finished transpiling
      setTimeout(() => {
        try {
          // Check if component exists
          if (typeof ${componentName} === 'undefined') {
            throw new Error('Component "${componentName}" is not defined. Make sure it is exported as default.');
          }
          
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(${componentName}));
        } catch (err) {
          const errorMsg = err.message || String(err);
          const errorStack = err.stack || '';
          document.getElementById('root').innerHTML = '<div class="error-display">Error rendering component:\\n\\n' + errorMsg + (errorStack ? '\\n\\nStack:\\n' + errorStack : '') + '</div>';
          console.error('Component error:', err);
        }
      }, 50);
    } catch (err) {
      const errorMsg = err.message || String(err);
      const errorStack = err.stack || '';
      document.getElementById('root').innerHTML = '<div class="error-display">Error transpiling component:\\n\\n' + errorMsg + (errorStack ? '\\n\\nStack:\\n' + errorStack : '') + '</div>';
      console.error('Transpilation error:', err);
    }
    
    // Timeout fallback - if component doesn't render in 5 seconds, show error
    setTimeout(() => {
      const rootEl = document.getElementById('root');
      if (rootEl) {
        const content = rootEl.innerHTML;
        if (content.includes('Loading component...')) {
          rootEl.innerHTML = '<div class="error-display">Timeout: Component failed to render after 5 seconds.\\n\\nPossible issues:\\n1. Component has a syntax error\\n2. Component is not exported correctly\\n3. Missing dependencies\\n\\nCheck browser console (F12) for detailed errors.\\n\\nComponent name: ${componentName}</div>';
          console.error('Component render timeout. Component name:', '${componentName}');
          console.error('Check the component code for errors.');
        }
      }
    }, 5000);
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    return new NextResponse('Error loading preview', { status: 500 });
  }
}
