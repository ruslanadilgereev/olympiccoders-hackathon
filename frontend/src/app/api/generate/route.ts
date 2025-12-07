import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const GENERATED_DIR = path.join(process.cwd(), 'src', 'generated', 'components');
const REGISTRY_PATH = path.join(process.cwd(), 'src', 'generated', 'registry.json');

// Available shadcn/ui components that are installed
const AVAILABLE_UI_COMPONENTS = [
  'button', 'card', 'input', 'badge', 'tabs', 'table',
  'dialog', 'dropdown-menu', 'avatar', 'progress', 'tooltip',
  'separator', 'scroll-area', 'skeleton', 'textarea', 'label',
  'checkbox', 'select', 'switch', 'slider', 'alert', 'hover-card'
];

// Validate that all @/components/ui imports are available
function validateImports(code: string): { valid: boolean; missing: string[] } {
  const importRegex = /@\/components\/ui\/([a-z-]+)/g;
  const missing: string[] = [];
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const componentName = match[1];
    if (!AVAILABLE_UI_COMPONENTS.includes(componentName)) {
      if (!missing.includes(componentName)) {
        missing.push(componentName);
      }
    }
  }
  return { valid: missing.length === 0, missing };
}

interface ComponentEntry {
  id: string;
  name: string;
  filename: string;
  createdAt: string;
  prompt?: string;
  threadId?: string;
}

interface Registry {
  components: ComponentEntry[];
  lastUpdated: string | null;
  activeComponent: string | null;
}

interface MetadataStore {
  [filename: string]: {
    id?: string;
    prompt?: string;
    threadId?: string;
    createdAt?: string;
  };
}

async function ensureDirectories() {
  try {
    await fs.mkdir(GENERATED_DIR, { recursive: true });
  } catch {
    // Directory exists
  }
}

// Read metadata from registry.json (includes stable IDs)
async function readMetadataStore(): Promise<MetadataStore> {
  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    const store: MetadataStore = {};
    
    if (Array.isArray(parsed.components)) {
      for (const comp of parsed.components) {
        if (comp.filename) {
          store[comp.filename] = {
            id: comp.id,  // Preserve stable ID!
            prompt: comp.prompt,
            threadId: comp.threadId,
            createdAt: comp.createdAt,
          };
        }
      }
    }
    return store;
  } catch {
    return {};
  }
}

// Save metadata back to registry.json
async function saveMetadataStore(components: ComponentEntry[]) {
  const registry: Registry = {
    components,
    lastUpdated: new Date().toISOString(),
    activeComponent: components.length > 0 ? components[components.length - 1].id : null,
  };
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

// Scan filesystem and build component list - THIS IS THE SOURCE OF TRUTH
async function scanComponents(): Promise<ComponentEntry[]> {
  await ensureDirectories();
  
  const metadataStore = await readMetadataStore();
  const components: ComponentEntry[] = [];
  
  try {
    const files = await fs.readdir(GENERATED_DIR);
    
    for (const file of files) {
      // Skip non-tsx files and placeholder files
      if (!file.endsWith('.tsx') || file.startsWith('_') || file.startsWith('.')) {
        continue;
      }
      
      const filePath = path.join(GENERATED_DIR, file);
      const stats = await fs.stat(filePath);
      
      // Get metadata from store or generate defaults
      const metadata = metadataStore[file] || {};
      const name = file.replace('.tsx', '');
      // Use stored ID if exists, only generate new ID for new files
      const id = metadata.id || `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      
      components.push({
        id,
        name,
        filename: file,
        createdAt: metadata.createdAt || stats.mtime.toISOString(),
        prompt: metadata.prompt,
        threadId: metadata.threadId,
      });
    }
    
    // Sort by creation time (newest first)
    components.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
  } catch (error) {
    console.error('Failed to scan components directory:', error);
  }
  
  return components;
}

// GET - List all generated components (scans filesystem!)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withCode = searchParams.get('withCode') === 'true';
    const componentId = searchParams.get('id');
    
    // ALWAYS scan the filesystem - it's the source of truth
    const components = await scanComponents();
    
    // If requesting a specific component with code
    if (componentId && withCode) {
      const component = components.find(c => c.id === componentId);
      if (component) {
        try {
          const filePath = path.join(GENERATED_DIR, component.filename);
          const code = await fs.readFile(filePath, 'utf-8');
          return NextResponse.json({ ...component, code });
        } catch {
          return NextResponse.json({ error: 'Component file not found' }, { status: 404 });
        }
      }
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    
    // If requesting all components with code
    if (withCode) {
      const componentsWithCode = await Promise.all(
        components.map(async (comp) => {
          try {
            const filePath = path.join(GENERATED_DIR, comp.filename);
            const code = await fs.readFile(filePath, 'utf-8');
            return { ...comp, code };
          } catch {
            return { ...comp, code: null };
          }
        })
      );
      return NextResponse.json({ 
        components: componentsWithCode,
        lastUpdated: new Date().toISOString(),
        activeComponent: components.length > 0 ? components[0].id : null,
      });
    }
    
    return NextResponse.json({
      components,
      lastUpdated: new Date().toISOString(),
      activeComponent: components.length > 0 ? components[0].id : null,
    });
  } catch (error) {
    console.error('Failed to list components:', error);
    return NextResponse.json(
      { error: 'Failed to read components' },
      { status: 500 }
    );
  }
}

// POST - Create a new generated component
export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const body = await request.json();
    const { code, name, prompt, threadId } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Validate imports before saving
    const validation = validateImports(code);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: `Missing UI components: ${validation.missing.join(', ')}. Please use only available components: ${AVAILABLE_UI_COMPONENTS.join(', ')}`,
          missingImports: validation.missing,
          availableComponents: AVAILABLE_UI_COMPONENTS,
        },
        { status: 400 }
      );
    }

    // Generate filename from name
    const componentName = name || `Generated_${Date.now()}`;
    const filename = `${componentName.replace(/[^a-zA-Z0-9]/g, '_')}.tsx`;
    
    // Ensure the code has a default export
    let finalCode = code;
    if (!code.includes('export default')) {
      const exportMatch = code.match(/export\s+(?:const|function)\s+(\w+)/);
      if (exportMatch) {
        finalCode = code + `\n\nexport default ${exportMatch[1]};`;
      } else {
        finalCode = `const GeneratedComponent = () => {\n  return (\n    ${code}\n  );\n};\n\nexport default GeneratedComponent;`;
      }
    }

    // Check if this component already exists (to preserve its ID)
    const existingComponents = await scanComponents();
    const existingComponent = existingComponents.find(c => c.filename === filename);
    
    // Generate stable ID - use existing ID if updating, or create new unique one
    // CRITICAL: ID must be stable across file updates to prevent 404 errors
    const id = existingComponent?.id || `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Write the component file
    const filePath = path.join(GENERATED_DIR, filename);
    await fs.writeFile(filePath, finalCode, 'utf-8');
    
    const entry: ComponentEntry = {
      id,
      name: componentName,
      filename,
      createdAt: existingComponent?.createdAt || new Date().toISOString(),
      prompt,
      threadId,
    };

    // Update metadata store (for prompts/threadIds)
    // Re-scan after write to ensure consistency
    const components = await scanComponents();
    const idx = components.findIndex(c => c.filename === filename);
    if (idx !== -1) {
      // Preserve the stable ID
      components[idx] = { ...components[idx], id, prompt, threadId };
    } else {
      // New component - add it with the stable ID
      components.push(entry);
    }
    await saveMetadataStore(components);

    return NextResponse.json({
      success: true,
      component: entry,
      filePath: `src/generated/components/${filename}`,
      previewUrl: `/preview?id=${id}`,
    });
  } catch (error) {
    console.error('Failed to generate component:', error);
    return NextResponse.json(
      { error: `Failed to generate component: ${error}` },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update an existing generated component
export async function PUT(request: NextRequest) {
  return updateComponent(request);
}

export async function PATCH(request: NextRequest) {
  return updateComponent(request);
}

async function updateComponent(request: NextRequest) {
  try {
    await ensureDirectories();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const filename = searchParams.get('filename');

    const body = await request.json();
    const { code, name, prompt } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Validate imports before saving
    const validation = validateImports(code);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: `Missing UI components: ${validation.missing.join(', ')}. Please use only available components: ${AVAILABLE_UI_COMPONENTS.join(', ')}`,
          missingImports: validation.missing,
          availableComponents: AVAILABLE_UI_COMPONENTS,
        },
        { status: 400 }
      );
    }

    // Scan to find the component
    const components = await scanComponents();
    
    let component: ComponentEntry | undefined;
    if (id) {
      component = components.find(c => c.id === id);
    } else if (filename) {
      component = components.find(c => c.filename === filename);
    } else {
      return NextResponse.json(
        { error: 'Component ID or filename is required' },
        { status: 400 }
      );
    }

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Ensure the code has a default export
    let finalCode = code;
    if (!code.includes('export default')) {
      const exportMatch = code.match(/export\s+(?:const|function)\s+(\w+)/);
      if (exportMatch) {
        finalCode = code + `\n\nexport default ${exportMatch[1]};`;
      } else {
        finalCode = `const GeneratedComponent = () => {\n  return (\n    ${code}\n  );\n};\n\nexport default GeneratedComponent;`;
      }
    }

    // Overwrite the existing file
    const filePath = path.join(GENERATED_DIR, component.filename);
    await fs.writeFile(filePath, finalCode, 'utf-8');

    // Update metadata
    const updatedComponents = await scanComponents();
    const idx = updatedComponents.findIndex(c => c.filename === component.filename);
    if (idx !== -1) {
      updatedComponents[idx] = {
        ...updatedComponents[idx],
        name: name || updatedComponents[idx].name,
        prompt: prompt !== undefined ? prompt : updatedComponents[idx].prompt,
      };
    }
    await saveMetadataStore(updatedComponents);

    const updatedComponent = updatedComponents.find(c => c.filename === component.filename);

    return NextResponse.json({
      success: true,
      component: updatedComponent,
      filePath: `src/generated/components/${component.filename}`,
      previewUrl: `/preview?id=${updatedComponent?.id}`,
    });
  } catch (error) {
    console.error('Failed to update component:', error);
    return NextResponse.json(
      { error: `Failed to update component: ${error}` },
      { status: 500 }
    );
  }
}

// DELETE - Remove a generated component
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const filename = searchParams.get('filename');

    if (!id && !filename) {
      return NextResponse.json(
        { error: 'Component ID or filename is required' },
        { status: 400 }
      );
    }

    const components = await scanComponents();
    const component = id 
      ? components.find(c => c.id === id)
      : components.find(c => c.filename === filename);

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Delete the file - this is what actually removes it
    const filePath = path.join(GENERATED_DIR, component.filename);
    await fs.unlink(filePath);

    // Update metadata store
    const remaining = components.filter(c => c.filename !== component.filename);
    await saveMetadataStore(remaining);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete component:', error);
    return NextResponse.json(
      { error: 'Failed to delete component' },
      { status: 500 }
    );
  }
}
