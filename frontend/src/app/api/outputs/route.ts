import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// List all generated images in the outputs directory
const OUTPUTS_DIR = path.join(process.cwd(), '..', 'outputs');

export async function GET() {
  try {
    // Ensure directory exists
    if (!fs.existsSync(OUTPUTS_DIR)) {
      return NextResponse.json({ images: [], count: 0 });
    }
    
    const files = fs.readdirSync(OUTPUTS_DIR);
    
    // Filter for image files and get their info
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return allowedExtensions.includes(ext);
      })
      .map(filename => {
        const filepath = path.join(OUTPUTS_DIR, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          url: `/api/outputs/${filename}`,
          createdAt: stats.mtime.toISOString(),
          size: stats.size,
        };
      })
      // Sort by newest first
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({
      images,
      count: images.length,
    });
  } catch (error) {
    console.error('Failed to list outputs:', error);
    return NextResponse.json(
      { error: 'Failed to list images', images: [], count: 0 },
      { status: 500 }
    );
  }
}

