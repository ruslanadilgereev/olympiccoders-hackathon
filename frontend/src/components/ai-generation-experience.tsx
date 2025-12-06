'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Code2, Palette, Layout, CheckCircle2 } from 'lucide-react';

// Generation phases with timing
type GenerationPhase = 'scanning' | 'understanding' | 'creating' | 'polishing' | 'complete';

interface PhaseConfig {
  name: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // seconds before transitioning to next phase
  color: string;
}

const PHASE_CONFIGS: Record<GenerationPhase, PhaseConfig> = {
  scanning: {
    name: 'Scanning',
    description: 'Analyzing your design...',
    icon: <Zap className="w-6 h-6" />,
    duration: 15,
    color: '#6366f1', // indigo
  },
  understanding: {
    name: 'Understanding',
    description: 'Identifying components & patterns...',
    icon: <Layout className="w-6 h-6" />,
    duration: 25,
    color: '#8b5cf6', // violet
  },
  creating: {
    name: 'Creating',
    description: 'Generating React + Tailwind code...',
    icon: <Code2 className="w-6 h-6" />,
    duration: 30,
    color: '#a855f7', // purple
  },
  polishing: {
    name: 'Polishing',
    description: 'Optimizing & finalizing...',
    icon: <Sparkles className="w-6 h-6" />,
    duration: 20,
    color: '#d946ef', // fuchsia
  },
  complete: {
    name: 'Complete',
    description: 'Your code is ready!',
    icon: <CheckCircle2 className="w-6 h-6" />,
    duration: 0,
    color: '#22c55e', // green
  },
};

// Detected element mock data (simulated AI detection)
const MOCK_DETECTIONS = [
  { type: 'Navigation', x: 5, y: 2, width: 90, height: 8 },
  { type: 'Header', x: 5, y: 12, width: 60, height: 10 },
  { type: 'Card', x: 5, y: 25, width: 28, height: 35 },
  { type: 'Card', x: 36, y: 25, width: 28, height: 35 },
  { type: 'Card', x: 67, y: 25, width: 28, height: 35 },
  { type: 'Button', x: 75, y: 85, width: 20, height: 8 },
];

// Extracted colors (simulated)
const MOCK_COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483'];

interface AIGenerationExperienceProps {
  imageUrl: string;
  imageName?: string;
  isGenerating: boolean;
  onComplete?: () => void;
}

// Circular Progress Ring Component
function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = '#6366f1'
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-2xl font-bold text-white"
          key={Math.floor(progress)}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {Math.floor(progress)}%
        </motion.span>
      </div>
    </div>
  );
}

// Scanning overlay animation
function ScanOverlay({ phase }: { phase: GenerationPhase }) {
  if (phase !== 'scanning') return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
        style={{ boxShadow: '0 0 20px 10px rgba(99, 102, 241, 0.3)' }}
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Corner markers */}
      {[
        'top-4 left-4',
        'top-4 right-4',
        'bottom-4 left-4',
        'bottom-4 right-4',
      ].map((pos, i) => (
        <motion.div
          key={i}
          className={`absolute ${pos} w-8 h-8 border-2 border-indigo-500`}
          style={{
            borderTopWidth: pos.includes('top') ? 2 : 0,
            borderBottomWidth: pos.includes('bottom') ? 2 : 0,
            borderLeftWidth: pos.includes('left') ? 2 : 0,
            borderRightWidth: pos.includes('right') ? 2 : 0,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        />
      ))}
    </motion.div>
  );
}

// Detection boxes overlay
function DetectionOverlay({ phase, detections }: { phase: GenerationPhase; detections: typeof MOCK_DETECTIONS }) {
  if (phase !== 'understanding') return null;

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {detections.map((det, i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-violet-500 rounded-md"
          style={{
            left: `${det.x}%`,
            top: `${det.y}%`,
            width: `${det.width}%`,
            height: `${det.height}%`,
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.3, duration: 0.4 }}
        >
          <motion.span
            className="absolute -top-6 left-0 text-xs font-medium text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 + 0.2 }}
          >
            {det.type}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Color palette display
function ColorPaletteDisplay({ phase, colors }: { phase: GenerationPhase; colors: string[] }) {
  if (phase !== 'understanding') return null;

  return (
    <motion.div
      className="absolute bottom-4 left-4 flex gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: 1 }}
    >
      <span className="text-xs text-white/60 self-center mr-2">Colors:</span>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className="w-8 h-8 rounded-lg border border-white/20"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}50` }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2 + i * 0.1, type: 'spring' }}
        />
      ))}
    </motion.div>
  );
}

// Code generation animation
function CodeGenerationOverlay({ phase }: { phase: GenerationPhase }) {
  if (phase !== 'creating') return null;

  const codeLines = [
    "import React from 'react';",
    "import { Card } from '@/components/ui/card';",
    "",
    "export default function Dashboard() {",
    "  return (",
    "    <div className=\"min-h-screen bg-slate-900\">",
    "      <nav className=\"border-b border-slate-800\">",
    "        ...",
  ];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
      <motion.div 
        className="relative w-full max-w-md mx-4 bg-slate-900/90 rounded-xl border border-purple-500/30 p-4 font-mono text-sm"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-1.5 mb-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        {codeLines.map((line, i) => (
          <motion.div
            key={i}
            className="text-purple-300/90"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
          >
            {line || '\u00A0'}
          </motion.div>
        ))}
        <motion.span
          className="inline-block w-2 h-4 bg-purple-500 ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}

// Main component
export function AIGenerationExperience({
  imageUrl,
  imageName,
  isGenerating,
  onComplete,
}: AIGenerationExperienceProps) {
  const [phase, setPhase] = useState<GenerationPhase>('scanning');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Calculate progress based on phase and elapsed time
  const progress = useMemo(() => {
    const phaseOrder: GenerationPhase[] = ['scanning', 'understanding', 'creating', 'polishing', 'complete'];
    const currentIndex = phaseOrder.indexOf(phase);
    const baseProgress = currentIndex * 25;
    
    if (phase === 'complete') return 100;
    
    const phaseConfig = PHASE_CONFIGS[phase];
    const phaseProgress = Math.min((elapsedTime % phaseConfig.duration) / phaseConfig.duration, 1) * 25;
    
    return Math.min(baseProgress + phaseProgress, 99);
  }, [phase, elapsedTime]);

  // Phase transition based on time
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);

      // Auto-transition phases based on time
      if (elapsed < 15) {
        setPhase('scanning');
      } else if (elapsed < 40) {
        setPhase('understanding');
      } else if (elapsed < 70) {
        setPhase('creating');
      } else {
        setPhase('polishing');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, startTime]);

  // Handle completion
  useEffect(() => {
    if (!isGenerating && phase !== 'complete') {
      setPhase('complete');
      onComplete?.();
    }
  }, [isGenerating, phase, onComplete]);

  const currentPhaseConfig = PHASE_CONFIGS[phase];

  // Show completion celebration before fading out
  if (!isGenerating && phase === 'complete') {
    return (
      <motion.div
        className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* Success celebration */}
        <motion.div
          className="text-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
            animate={{ 
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.4)',
                '0 0 0 20px rgba(34, 197, 94, 0)',
              ]
            }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold text-white mb-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Code Generated!
          </motion.h2>
          <motion.p 
            className="text-white/60"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your React component is ready
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col bg-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-950 to-purple-950/50" />
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-indigo-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-8">
        {/* Hero Image Section */}
        <motion.div
          className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Image with glassmorphism frame */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-2xl" />
          <img
            src={imageUrl}
            alt={imageName || 'Uploaded design'}
            className="w-full h-full object-contain p-2"
          />
          
          {/* Phase-specific overlays */}
          <AnimatePresence mode="wait">
            {phase === 'scanning' && <ScanOverlay key="scan-overlay" phase={phase} />}
            {phase === 'understanding' && (
              <>
                <DetectionOverlay key="detection-overlay" phase={phase} detections={MOCK_DETECTIONS} />
                <ColorPaletteDisplay key="color-palette" phase={phase} colors={MOCK_COLORS} />
              </>
            )}
            {phase === 'creating' && <CodeGenerationOverlay key="code-overlay" phase={phase} />}
          </AnimatePresence>

          {/* Image label */}
          {imageName && (
            <motion.div
              className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-lg border border-white/10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-xs text-white/80">{imageName}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Progress & Status Section */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Progress Ring */}
          <ProgressRing 
            progress={progress} 
            size={140} 
            strokeWidth={10}
            color={currentPhaseConfig.color}
          />

          {/* Phase indicator */}
          <div className="text-center">
            <motion.div
              key={phase}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center justify-center gap-2 mb-2"
              style={{ color: currentPhaseConfig.color }}
            >
              {currentPhaseConfig.icon}
              <span className="text-xl font-semibold">{currentPhaseConfig.name}</span>
            </motion.div>
            <motion.p
              key={`${phase}-desc`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/60 text-sm"
            >
              {currentPhaseConfig.description}
            </motion.p>
          </div>

          {/* Time elapsed */}
          <div className="text-center">
            <span className="text-3xl font-mono text-white/80">{elapsedTime}s</span>
            <p className="text-xs text-white/40 mt-1">elapsed</p>
          </div>

          {/* Phase steps */}
          <div className="flex gap-2">
            {(['scanning', 'understanding', 'creating', 'polishing'] as GenerationPhase[]).map((p, i) => {
              const phaseOrder = ['scanning', 'understanding', 'creating', 'polishing'];
              const currentIndex = phaseOrder.indexOf(phase);
              const thisIndex = phaseOrder.indexOf(p);
              const isActive = thisIndex <= currentIndex;
              const isCurrent = p === phase;

              return (
                <motion.div
                  key={p}
                  className={`w-3 h-3 rounded-full ${
                    isActive ? 'bg-indigo-500' : 'bg-white/20'
                  } ${isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' : ''}`}
                  animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom tip */}
      <motion.div
        className="relative py-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs text-white/40">
          Tip: The AI is analyzing your design to create pixel-perfect React code
        </p>
      </motion.div>
    </motion.div>
  );
}

