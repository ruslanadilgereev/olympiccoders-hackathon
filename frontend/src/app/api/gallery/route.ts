import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type GalleryItem = {
  id: string;
  type: 'image' | 'component';
  createdAt: string;
  prompt?: string;
  // Image specific
  filename?: string;
  imageUrl?: string;
  // Component specific
  name?: string;
  previewUrl?: string;
  componentFilename?: string;
};

const OUTPUTS_DIR = path.join(process.cwd(), '..', 'outputs');
const REGISTRY_PATH = path.join(process.cwd(), 'src', 'generated', 'registry.json');

async function readImages(): Promise<GalleryItem[]> {
  try {
    const files = await fs.readdir(OUTPUTS_DIR);
    const allowed = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

    const items = await Promise.all(
      files
        .filter((file) => allowed.has(path.extname(file).toLowerCase()))
        .map(async (file) => {
          const stat = await fs.stat(path.join(OUTPUTS_DIR, file));
          return {
            id: `image-${file}`,
            type: 'image' as const,
            filename: file,
            imageUrl: `/api/outputs/${file}`,
            createdAt: stat.mtime.toISOString(),
          };
        })
    );

    // Newest first
    return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch (error) {
    console.warn('[gallery] Failed to read outputs directory', error);
    return [];
  }
}

async function readRegistry(): Promise<GalleryItem[]> {
  try {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const registry = JSON.parse(content) as {
      components?: Array<{
        id: string;
        name: string;
        filename: string;
        createdAt: string;
        prompt?: string;
      }>;
    };

    if (!registry.components) return [];

    const items: GalleryItem[] = registry.components.map((comp) => ({
      id: comp.id,
      type: 'component',
      name: comp.name,
      componentFilename: comp.filename,
      previewUrl: `/preview?id=${comp.id}`,
      prompt: comp.prompt,
      createdAt: comp.createdAt || new Date().toISOString(),
    }));

    return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch (error) {
    // If registry missing, return empty instead of 500
    console.warn('[gallery] Failed to read registry.json', error);
    return [];
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
    }

    if (type === 'image') {
      // Extract filename from id (format: "image-filename.png")
      const filename = id.replace(/^image-/, '');
      const filePath = path.join(OUTPUTS_DIR, filename);
      
      try {
        await fs.unlink(filePath);
        return NextResponse.json({ success: true, message: 'Image deleted' });
      } catch (error) {
        console.error('[gallery] Failed to delete image:', error);
        return NextResponse.json({ error: 'Failed to delete image file' }, { status: 500 });
      }
    } else if (type === 'component') {
      // Remove from registry
      try {
        const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
        const registry = JSON.parse(content) as {
          components?: Array<{
            id: string;
            name: string;
            filename: string;
            createdAt: string;
            prompt?: string;
          }>;
          lastUpdated?: string;
          activeComponent?: string;
        };

        if (!registry.components) {
          return NextResponse.json({ error: 'No components found' }, { status: 404 });
        }

        const componentToDelete = registry.components.find(c => c.id === id);
        if (!componentToDelete) {
          return NextResponse.json({ error: 'Component not found' }, { status: 404 });
        }

        // Remove from registry
        registry.components = registry.components.filter(c => c.id !== id);
        registry.lastUpdated = new Date().toISOString();
        
        // If this was the active component, clear it or set to latest
        if (registry.activeComponent === id) {
          registry.activeComponent = registry.components.length > 0 
            ? registry.components[registry.components.length - 1].id 
            : null;
        }

        await fs.writeFile(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');

        // Try to delete the component file itself
        try {
          const componentPath = path.join(
            process.cwd(),
            'src',
            'generated',
            'components',
            componentToDelete.filename
          );
          await fs.unlink(componentPath);
        } catch (fileError) {
          console.warn('[gallery] Component file already deleted or not found:', fileError);
        }

        return NextResponse.json({ success: true, message: 'Component deleted' });
      } catch (error) {
        console.error('[gallery] Failed to delete component:', error);
        return NextResponse.json({ error: 'Failed to delete component' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[gallery] DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get('since');

  const sinceMs = sinceParam ? Date.parse(sinceParam) : NaN;
  const hasSince = !Number.isNaN(sinceMs);

  const filterBySince = (items: GalleryItem[]) =>
    hasSince
      ? items.filter((item) => {
          const createdMs = item.createdAt ? Date.parse(item.createdAt) : NaN;
          return !Number.isNaN(createdMs) && createdMs >= sinceMs;
        })
      : items;

  const [images, components] = await Promise.all([readImages(), readRegistry()]);
  const filteredImages = filterBySince(images);
  const filteredComponents = filterBySince(components);
  const items = [...filteredImages, ...filteredComponents].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );

  return NextResponse.json({
    items,
    counts: {
      images: filteredImages.length,
      components: filteredComponents.length,
    },
  });
}

