'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo animation */}
        <motion.div
          className="relative w-24 h-24 mx-auto mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-lg" />
          
          {/* Center icon */}
          <div className="absolute inset-4 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-2">DesignForge AI</h2>
          <div className="flex items-center justify-center gap-1">
            <span className="text-muted-foreground">Loading</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            >
              .
            </motion.span>
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="mt-8 w-48 h-1 bg-muted rounded-full overflow-hidden mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </div>
  );
}

