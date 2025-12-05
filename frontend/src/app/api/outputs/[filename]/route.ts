import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Serve generated images from the outputs directory
// This allows the frontend to load images without including them in chat context

const OUTPUTS_DIR = path.join(process.cwd(), '..', 'outputs');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  // Security: Only allow specific file extensions
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  const ext = path.extname(filename).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return NextResponse.json(
      { error: 'Invalid file type' },
      { status: 400 }
    );
  }
  
  // Security: Prevent path traversal
  const safeName = path.basename(filename);
  const filepath = path.join(OUTPUTS_DIR, safeName);
  
  // Check if file exists
  if (!fs.existsSync(filepath)) {
    return NextResponse.json(
      { error: 'Image not found' },
      { status: 404 }
    );
  }
  
  try {
    const fileBuffer = fs.readFileSync(filepath);
    
    // Determine content type
    const contentTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentTypes[ext] || 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error reading image file:', error);
    return NextResponse.json(
      { error: 'Failed to read image' },
      { status: 500 }
    );
  }
}

