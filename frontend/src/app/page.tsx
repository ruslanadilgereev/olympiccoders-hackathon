'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  MessageSquare,
  Images,
  ArrowRight,
  Zap,
  Palette,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UploadZone } from '@/components/upload-zone';
import { GenerationChat } from '@/components/generation-chat';
import { DesignGallery } from '@/components/design-gallery';
import { useDesignStore } from '@/lib/store';

// Animated background particles
function ParticleBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ top: '10%', left: '20%' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px]"
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        style={{ bottom: '20%', right: '10%' }}
      />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

// Feature cards for landing
const FEATURES = [
  {
    icon: Upload,
    title: 'Upload Brand Assets',
    description: 'Import your existing designs, style guides, and brand materials',
  },
  {
    icon: Zap,
    title: 'AI Style Analysis',
    description: 'Our AI extracts colors, typography, and design patterns automatically',
  },
  {
    icon: Palette,
    title: 'Generate Designs',
    description: 'Create new mockups that perfectly match your brand identity',
  },
];

export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const { activeTab, setActiveTab, uploadedAssets, generatedDesigns } = useDesignStore();

  // Skip landing if there are assets
  useEffect(() => {
    if (uploadedAssets.length > 0 || generatedDesigns.length > 0) {
      setShowLanding(false);
    }
  }, [uploadedAssets.length, generatedDesigns.length]);

  const handleGetStarted = () => {
    setShowLanding(false);
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />

      <AnimatePresence mode="wait">
        {showLanding ? (
          // Landing Page
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="p-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">DesignForge</span>
                <Badge variant="secondary" className="ml-2">AI</Badge>
              </motion.div>
            </header>

            {/* Hero */}
            <main className="flex-1 flex items-center justify-center px-6 pb-20">
              <div className="max-w-4xl mx-auto text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className="mb-6 px-4 py-2 text-sm border-primary/30 bg-primary/5"
                  >
                    <Zap className="w-3 h-3 mr-2 text-primary" />
                    Powered by Gemini 3 Pro
                  </Badge>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
                >
                  Design at the
                  <br />
                  <span className="text-gradient">Speed of Thought</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                >
                  Upload your brand assets, describe what you need, and watch AI
                  generate stunning, on-brand designs in seconds.
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center justify-center gap-4"
                >
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 h-14 animate-pulse-glow"
                  >
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 h-14 glass"
                  >
                    Watch Demo
                  </Button>
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-20 grid md:grid-cols-3 gap-6"
                >
                  {FEATURES.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="glass rounded-2xl p-6 text-left hover:border-primary/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-sm text-muted-foreground">
              Built with Gemini 3 Pro, LangGraph & Next.js
            </footer>
          </motion.div>
        ) : (
          // Main App
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 min-h-screen flex flex-col"
          >
            {/* App Header */}
            <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
              <div className="flex items-center justify-between p-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">DesignForge</span>
                </motion.div>

                {/* Navigation Tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                  className="w-auto"
                >
                  <TabsList className="glass">
                    <TabsTrigger value="upload" className="gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Assets</span>
                      {uploadedAssets.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                          {uploadedAssets.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="studio" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Studio</span>
                    </TabsTrigger>
                    <TabsTrigger value="gallery" className="gap-2">
                      <Images className="w-4 h-4" />
                      <span className="hidden sm:inline">Gallery</span>
                      {generatedDesigns.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                          {generatedDesigns.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Breadcrumb indicator */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span
                    className={activeTab === 'upload' ? 'text-primary' : ''}
                  >
                    Upload
                  </span>
                  <ChevronRight className="w-4 h-4" />
                  <span
                    className={activeTab === 'studio' ? 'text-primary' : ''}
                  >
                    Generate
                  </span>
                  <ChevronRight className="w-4 h-4" />
                  <span
                    className={activeTab === 'gallery' ? 'text-primary' : ''}
                  >
                    Export
                  </span>
                </motion.div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
              <Tabs value={activeTab} className="h-full">
                <TabsContent value="upload" className="h-full m-0 p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                  >
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold mb-2">Upload Your Brand Assets</h1>
                      <p className="text-muted-foreground">
                        Start by uploading existing designs, screenshots, or brand guidelines.
                        Our AI will analyze them to understand your visual style.
                      </p>
                    </div>
                    <UploadZone onAnalyzeComplete={() => setActiveTab('studio')} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="studio" className="h-full m-0">
                  <GenerationChat />
                </TabsContent>

                <TabsContent value="gallery" className="h-full m-0">
                  <DesignGallery />
                </TabsContent>
              </Tabs>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
