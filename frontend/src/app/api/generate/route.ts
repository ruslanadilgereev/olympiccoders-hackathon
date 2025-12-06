import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const GENERATED_DIR = path.join(process.cwd(), 'src', 'generated', 'components');
const REGISTRY_PATH = path.join(process.cwd(), 'src', 'generated', 'registry.json');

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

async function ensureDirectories() {
  try {
    await fs.mkdir(GENERATED_DIR, { recursive: true });
  } catch (e) {
    // Directory exists
  }
}

async function readRegistry(): Promise<Registry> {
  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      components: [],
      lastUpdated: null,
      activeComponent: null,
    };
  }
}

async function writeRegistry(registry: Registry) {
  await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2));
}

// GET - List all generated components (with optional code content)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withCode = searchParams.get('withCode') === 'true';
    const componentId = searchParams.get('id');
    
    const registry = await readRegistry();
    
    // If requesting a specific component with code
    if (componentId && withCode) {
      const component = registry.components.find(c => c.id === componentId);
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
        registry.components.map(async (comp) => {
          try {
            const filePath = path.join(GENERATED_DIR, comp.filename);
            const code = await fs.readFile(filePath, 'utf-8');
            return { ...comp, code };
          } catch {
            return { ...comp, code: null };
          }
        })
      );
      return NextResponse.json({ ...registry, components: componentsWithCode });
    }
    
    return NextResponse.json(registry);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read registry' },
      { status: 500 }
    );
  }
}

// POST - Create a new generated component
export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const body = await request.json();
    const { code, name, prompt } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    // Generate unique ID and filename
    const id = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const componentName = name || `Generated_${id}`;
    const filename = `${componentName.replace(/[^a-zA-Z0-9]/g, '_')}.tsx`;
    
    // Ensure the code has a default export
    let finalCode = code;
    if (!code.includes('export default')) {
      // Wrap in a default export if needed
      const exportMatch = code.match(/export\s+(?:const|function)\s+(\w+)/);
      if (exportMatch) {
        finalCode = code + `\n\nexport default ${exportMatch[1]};`;
      } else {
        // Create a wrapper component
        finalCode = `const GeneratedComponent = () => {\n  return (\n    ${code}\n  );\n};\n\nexport default GeneratedComponent;`;
      }
    }

    // Write the component file
    const filePath = path.join(GENERATED_DIR, filename);
    await fs.writeFile(filePath, finalCode, 'utf-8');

    // Update registry
    const registry = await readRegistry();
    const entry: ComponentEntry = {
      id,
      name: componentName,
      filename,
      createdAt: new Date().toISOString(),
      prompt,
    };
    
    registry.components.push(entry);
    registry.lastUpdated = new Date().toISOString();
    registry.activeComponent = id;
    
    await writeRegistry(registry);

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

// DELETE - Remove a generated component
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Component ID is required' },
        { status: 400 }
      );
    }

    const registry = await readRegistry();
    const component = registry.components.find(c => c.id === id);

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Delete the file
    const filePath = path.join(GENERATED_DIR, component.filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist
    }

    // Update registry
    registry.components = registry.components.filter(c => c.id !== id);
    if (registry.activeComponent === id) {
      registry.activeComponent = registry.components.length > 0 
        ? registry.components[registry.components.length - 1].id 
        : null;
    }
    registry.lastUpdated = new Date().toISOString();
    
    await writeRegistry(registry);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete component' },
      { status: 500 }
    );
  }
}

