'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Clock,
  Sparkles,
  X,
  FileImage,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDesignStore, GeneratedDesign } from '@/lib/store';

export function DesignGallery() {
  const [selectedDesign, setSelectedDesign] = useState<GeneratedDesign | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { generatedDesigns, removeDesign } = useDesignStore();

  const downloadImage = (design: GeneratedDesign, format: 'png' | 'jpg' = 'png') => {
    const link = document.createElement('a');
    link.href = `data:image/${format};base64,${design.imageBase64}`;
    link.download = `designforge-${design.id}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyBase64 = async (design: GeneratedDesign) => {
    await navigator.clipboard.writeText(design.imageBase64);
    setCopiedId(design.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareDesign = async (design: GeneratedDesign) => {
    if (navigator.share) {
      try {
        // Convert base64 to blob for sharing
        const response = await fetch(`data:image/png;base64,${design.imageBase64}`);
        const blob = await response.blob();
        const file = new File([blob], `design-${design.id}.png`, { type: 'image/png' });

        await navigator.share({
          title: 'Design from DesignForge AI',
          text: design.prompt,
          files: [file],
        });
      } catch {
        // Fallback to copying link
        copyBase64(design);
      }
    } else {
      copyBase64(design);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Generated Designs</h2>
          <p className="text-sm text-muted-foreground">
            {generatedDesigns.length} design{generatedDesigns.length !== 1 ? 's' : ''} created
          </p>
        </div>
        {generatedDesigns.length > 0 && (
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 overflow-auto p-4">
        {generatedDesigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col items-center justify-center text-center p-8"
          >
            <motion.div
              className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileImage className="w-12 h-12 text-muted-foreground" />
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">No designs yet</h3>
            <p className="text-muted-foreground max-w-sm">
              Start creating in the Studio tab. Your generated designs will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {generatedDesigns.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="group overflow-hidden glass glass-hover">
                    {/* Image */}
                    <div
                      className="relative aspect-video cursor-pointer overflow-hidden"
                      onClick={() => setSelectedDesign(design)}
                    >
                      <img
                        src={`data:image/png;base64,${design.imageBase64}`}
                        alt={design.prompt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                          <Badge variant="secondary" className="bg-black/50 text-white">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Generated
                          </Badge>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="bg-white/20 hover:bg-white/30"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-sm line-clamp-2 mb-3">{design.prompt}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(design.createdAt)}
                        </div>

                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => copyBase64(design)}
                              >
                                {copiedId === design.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy as Base64</TooltipContent>
                          </Tooltip>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => downloadImage(design, 'png')}
                              >
                                <FileImage className="w-4 h-4 mr-2" />
                                Download PNG
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => downloadImage(design, 'jpg')}
                              >
                                <FileImage className="w-4 h-4 mr-2" />
                                Download JPG
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => shareDesign(design)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeDesign(design.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Full Screen Preview Dialog */}
      <Dialog open={!!selectedDesign} onOpenChange={() => setSelectedDesign(null)}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Design Preview
              </span>
              <div className="flex items-center gap-2">
                {selectedDesign && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(selectedDesign, 'png')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDesign(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedDesign && (
            <div className="flex-1 overflow-auto">
              <div className="relative bg-muted/20 rounded-lg overflow-hidden">
                <img
                  src={`data:image/png;base64,${selectedDesign.imageBase64}`}
                  alt={selectedDesign.prompt}
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <h4 className="font-medium mb-2">Prompt</h4>
                <p className="text-sm text-muted-foreground">{selectedDesign.prompt}</p>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(selectedDesign.createdAt)}
                  </span>
                  <Badge variant="secondary">{selectedDesign.designType}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

