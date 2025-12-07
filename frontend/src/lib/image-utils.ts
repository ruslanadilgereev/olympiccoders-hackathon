/**
 * Process images for AI analysis
 * NOTE: NO COMPRESSION - Preserve full quality for pixel-perfect DNA extraction
 * 
 * Critical for accurate extraction of:
 * - Exact hex colors (gradients, shadows, subtle effects)
 * - Fine details (dashed borders, glows, drop shadows)
 * - Button states and accent colors
 */

// Maximum dimension - only resize if image exceeds this (very large images)
const MAX_DIMENSION = 4096;

/**
 * Process image WITHOUT compression - preserves original quality
 * Only resizes if image exceeds MAX_DIMENSION
 */
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      
      // Check if we need to resize (only for very large images)
      const img = new Image();
      img.onload = () => {
        const needsResize = img.width > MAX_DIMENSION || img.height > MAX_DIMENSION;
        
        if (!needsResize) {
          // Return original data without any processing
          const base64 = dataUrl.split(',')[1];
          resolve(base64);
          return;
        }
        
        // Only resize, but keep PNG format for lossless quality
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Keep as PNG for lossless quality (preserves gradients, shadows, etc.)
        const resizedDataUrl = canvas.toDataURL('image/png');
        const base64 = resizedDataUrl.split(',')[1];
        
        resolve(base64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Process base64 image WITHOUT compression
 * Only resizes if image exceeds MAX_DIMENSION
 */
export async function compressBase64Image(base64: string, mimeType: string = 'image/png'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const needsResize = img.width > MAX_DIMENSION || img.height > MAX_DIMENSION;
      
      if (!needsResize) {
        // Return original data without any processing
        resolve(base64);
        return;
      }
      
      // Only resize, but keep PNG format for lossless quality
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Keep as PNG for lossless quality
      const resizedDataUrl = canvas.toDataURL('image/png');
      const resizedBase64 = resizedDataUrl.split(',')[1];
      
      resolve(resizedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = `data:${mimeType};base64,${base64}`;
  });
}

/**
 * Get approximate token count for base64 image
 * Base64 increases size by ~33%, and each token is roughly 4 chars
 */
export function estimateImageTokens(base64: string): number {
  return Math.ceil(base64.length / 4);
}
