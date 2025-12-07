import React from 'react';

// Workflow Plan: Generate a 5-screen user flow for an S/4 Transformation Project
// This component displays the generation workflow with progress tracking

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'complete';
  linkedComponentId?: string;
  linkedComponentName?: string;
}

const workflowSteps: WorkflowStep[] = [
  {
    "id": "step-1",
    "title": "JIVS IMP Deployment",
    "description": "Initial environment setup screen with a progress bar, based on the first image.",
    "status": "complete",
    "linkedComponentId": "comp_1765149530081_wtaz",
    "linkedComponentName": "JivsImpHarness"
  },
  {
    "id": "step-2",
    "title": "Implementation Status",
    "description": "Systems overview table for the implementation phase, based on the second image.",
    "status": "complete",
    "linkedComponentId": "comp_1765149595763_22qb",
    "linkedComponentName": "ImplementationScreen"
  },
  {
    "id": "step-3",
    "title": "History Analysis (Pending)",
    "description": "History analysis table showing systems in a pending state, based on the fourth image.",
    "status": "complete",
    "linkedComponentId": "comp_1765149705131_bspn",
    "linkedComponentName": "HistoryAnalysisPendingScreen"
  },
  {
    "id": "step-4",
    "title": "History Analysis (Complete)",
    "description": "History analysis table showing systems in a completed state, based on the third image.",
    "status": "complete",
    "linkedComponentId": "comp_1765149814835_zdfp",
    "linkedComponentName": "HistoryAnalysisCompleteScreen"
  },
  {
    "id": "step-5",
    "title": "Results Dashboard",
    "description": "Final results dashboard with trend charts and run history, based on your description and the established design style.",
    "status": "complete",
    "linkedComponentId": "comp_1765149873665_79p5",
    "linkedComponentName": "ResultsDashboardScreen"
  }
];

const statusConfig = {
  pending: {
    bg: 'bg-zinc-800',
    border: 'border-zinc-600 border-dashed',
    text: 'text-zinc-400',
    icon: '○',
    iconColor: 'text-zinc-500',
  },
  in_progress: {
    bg: 'bg-blue-950',
    border: 'border-blue-500 border-solid',
    text: 'text-blue-300',
    icon: '◐',
    iconColor: 'text-blue-400 animate-pulse',
  },
  complete: {
    bg: 'bg-emerald-950',
    border: 'border-emerald-500 border-solid',
    text: 'text-emerald-300',
    icon: '✓',
    iconColor: 'text-emerald-400',
  },
};

export default function WorkflowPlan() {
  const completedCount = workflowSteps.filter(s => s.status === 'complete').length;
  const progress = Math.round((completedCount / workflowSteps.length) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">📋 Generate a 5-screen user flow for an S/4 Transformation Project</h1>
          <p className="text-zinc-400 mb-4">Generation Workflow Plan</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-zinc-800 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-500">
            {completedCount} of {workflowSteps.length} steps complete ({progress}%)
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const config = statusConfig[step.status];
            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-8 bg-zinc-700" />
                )}
                
                {/* Step Card */}
                <div 
                  className={`${config.bg} ${config.border} border-2 rounded-xl p-4 transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number & Icon */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full ${config.bg} border-2 ${config.border} flex items-center justify-center`}>
                        <span className={`text-xl ${config.iconColor}`}>{config.icon}</span>
                      </div>
                      <span className="text-xs text-zinc-500 mt-1">Step {index + 1}</span>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${config.text}`}>{step.title}</h3>
                        {step.status === 'complete' && step.linkedComponentName && (
                          <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full">
                            → {step.linkedComponentName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{step.description}</p>
                      
                      {/* Status Badge */}
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          step.status === 'pending' ? 'bg-zinc-700 text-zinc-400' :
                          step.status === 'in_progress' ? 'bg-blue-900 text-blue-300' :
                          'bg-emerald-900 text-emerald-300'
                        }`}>
                          {step.status === 'pending' ? '⏳ Pending' :
                            step.status === 'in_progress' ? '🔄 In Progress' :
                            '✅ Complete'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-zinc-900 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Legend</h4>
          <div className="flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">○</span>
              <span className="text-zinc-500">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">◐</span>
              <span className="text-zinc-500">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span className="text-zinc-500">Complete</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
