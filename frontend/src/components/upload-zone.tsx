'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, FileText, X, Sparkles, Check, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useDesignStore, UploadedAsset } from '@/lib/store';
import { compressImage } from '@/lib/image-utils';

interface UploadZoneProps {
  onAnalyzeComplete?: () => void;
}

export function UploadZone({ onAnalyzeComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [urlInput, setUrlInput] = useState('');
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const { uploadedAssets, addAsset, removeAsset } = useDesignStore();

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim() || isScrapingUrl) return;

    setIsScrapingUrl(true);
    setUrlError(null);
    
    try {
      // Auto-prepend https:// if missing
      let normalizedUrl = urlInput.trim();
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      
      // Validate URL
      const parsedUrl = new URL(normalizedUrl);
      
      // Add as a "URL" asset type
      const id = `url-${Date.now()}`;
      const asset: UploadedAsset = {
        id,
        name: parsedUrl.hostname,
        type: 'document',
        base64: btoa(normalizedUrl), // Store URL as base64
        preview: undefined,
      };
      
      addAsset(asset);
      setUrlInput('');
    } catch (error) {
      console.error('Invalid URL:', error);
      setUrlError('Please enter a valid URL (e.g., example.com)');
      // Clear error after 3 seconds
      setTimeout(() => setUrlError(null), 3000);
    } finally {
      setIsScrapingUrl(false);
    }
  }, [urlInput, isScrapingUrl, addAsset]);

  const processFile = useCallback(async (file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const isImage = file.type.startsWith('image/');

    // Start progress
    setUploadProgress((prev) => ({ ...prev, [id]: 0 }));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const current = prev[id] || 0;
        if (current >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, [id]: current + 10 };
      });
    }, 100);

    try {
      let base64: string;
      let preview: string | undefined;

      if (isImage) {
        // Compress images to reduce token usage (max 1024px, 70% quality)
        base64 = await compressImage(file);
        preview = `data:image/jpeg;base64,${base64}`;
        console.log(`Image compressed: ${file.name}, ~${Math.round(base64.length / 1024)}KB`);
      } else {
        // For non-images, read normally
        const result = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        base64 = result.split(',')[1];
      }

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [id]: 100 }));

      const asset: UploadedAsset = {
        id,
        name: file.name,
        type: isImage ? 'image' : 'document',
        base64,
        preview,
      };

      addAsset(asset);

      // Remove progress after animation
      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[id];
          return newProgress;
        });
      }, 500);
    } catch (error) {
      console.error('Error processing file:', error);
      clearInterval(progressInterval);
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[id];
        return newProgress;
      });
    }
  }, [addAsset]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(processFile);
    },
    [processFile]
  );

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-6 glass gradient-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">Extract from Website</h3>
              <p className="text-sm text-muted-foreground">
                Paste a URL to automatically extract brand colors, fonts & style
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-3">
              <Input
                placeholder="example.com or https://example.com"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                className={`flex-1 glass ${urlError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <Button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || isScrapingUrl}
                className="bg-gradient-to-r from-accent to-primary hover:opacity-90"
              >
                {isScrapingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract
                  </>
                )}
              </Button>
            </div>
            {urlError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500"
              >
                {urlError}
              </motion.p>
            )}
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">or upload files</span>
        <Separator className="flex-1" />
      </div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed
            transition-all duration-300 ease-out
            ${isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-card/50'
            }
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-gradient-x" />
          </div>

          <div className="relative p-12 text-center">
            {/* Icon */}
            <motion.div
              className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Upload className="w-10 h-10 text-primary" />
            </motion.div>

            {/* Text */}
            <h3 className="text-xl font-semibold mb-2">
              {isDragging ? 'Drop your files here' : 'Upload Design Assets'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Drag & drop your existing designs, style guides, or brand assets.
              We&apos;ll analyze them to understand your visual language.
            </p>

            {/* Upload Button */}
            <label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.md"
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                variant="outline"
                className="relative overflow-hidden group"
                asChild
              >
                <span>
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Choose Files
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-10 transition-opacity" />
                </span>
              </Button>
            </label>

            {/* Supported formats */}
            <p className="mt-4 text-xs text-muted-foreground">
              Supports PNG, JPG, SVG, PDF, and text documents
            </p>
          </div>
        </div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {Object.entries(uploadProgress).map(([id, progress]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4 glass">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Uploading...</p>
                  <Progress value={progress} className="h-1 mt-2" />
                </div>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Uploaded Assets Grid */}
      <AnimatePresence mode="popLayout">
        {uploadedAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Uploaded Assets ({uploadedAssets.length})</h4>
              {uploadedAssets.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAnalyzeComplete}
                  className="text-primary hover:text-primary"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Continue
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group relative overflow-hidden glass glass-hover">
                    {/* Preview */}
                    <div className="aspect-square relative">
                      {asset.type === 'image' && asset.preview ? (
                        <img
                          src={asset.preview}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Remove Button */}
                      <button
                        onClick={() => removeAsset(asset.id)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Analyzed Badge */}
                      {asset.analyzedStyle && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-primary/90 text-xs text-white flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Analyzed
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        {asset.type === 'image' ? (
                          <Image className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        {asset.type}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

