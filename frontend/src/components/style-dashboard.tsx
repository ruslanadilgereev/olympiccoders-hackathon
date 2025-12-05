'use client';

import { motion } from 'framer-motion';
import { Palette, Type, Layout, Layers, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StyleAnalysis } from '@/lib/store';

interface StyleDashboardProps {
  analysis: StyleAnalysis;
}

export function StyleDashboard({ analysis }: StyleDashboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Style Analysis Complete
          </h3>
          <p className="text-sm text-muted-foreground">
            Extracted visual characteristics from your design
          </p>
        </div>
        <Badge variant="secondary">Style ID: {analysis.styleId}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Color Palette */}
        <Card className="p-4 glass">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-primary" />
            <span className="font-medium">Color Palette</span>
          </div>
          <div className="space-y-3">
            {analysis.colors.primary && (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg shadow-inner"
                  style={{ backgroundColor: analysis.colors.primary }}
                />
                <div>
                  <p className="text-sm font-medium">Primary</p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {analysis.colors.primary}
                  </p>
                </div>
              </div>
            )}
            {analysis.colors.secondary && analysis.colors.secondary.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Secondary</span>
                <div className="flex gap-1">
                  {analysis.colors.secondary.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            {analysis.colors.accent && analysis.colors.accent.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">Accent</span>
                <div className="flex gap-1">
                  {analysis.colors.accent.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Typography */}
        <Card className="p-4 glass">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-4 h-4 text-primary" />
            <span className="font-medium">Typography</span>
          </div>
          <div className="space-y-3">
            {analysis.typography.headingStyle && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading Style</p>
                <p className="text-sm">{analysis.typography.headingStyle}</p>
              </div>
            )}
            {analysis.typography.bodyStyle && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body Style</p>
                <p className="text-sm">{analysis.typography.bodyStyle}</p>
              </div>
            )}
            {analysis.typography.fontFamily && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Font Family</p>
                <p className="text-sm font-mono">{analysis.typography.fontFamily}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Layout */}
        <Card className="p-4 glass">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-4 h-4 text-primary" />
            <span className="font-medium">Layout Patterns</span>
          </div>
          <div className="space-y-3">
            {analysis.layout.gridSystem && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Grid System</p>
                <p className="text-sm">{analysis.layout.gridSystem}</p>
              </div>
            )}
            {analysis.layout.spacing && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Spacing</p>
                <p className="text-sm">{analysis.layout.spacing}</p>
              </div>
            )}
            {analysis.layout.alignment && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Alignment</p>
                <p className="text-sm">{analysis.layout.alignment}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-4 glass">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className="font-medium">Style Summary</span>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          
          {/* Confidence indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Analysis Confidence</span>
              <span className="text-primary">85%</span>
            </div>
            <Progress value={85} className="h-1" />
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

