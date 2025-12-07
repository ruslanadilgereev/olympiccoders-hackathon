'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onFixWithAI?: (errorMessage: string) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  private handleFixWithAI = () => {
    const { error, errorInfo } = this.state;
    const { componentName } = this.props;
    
    let errorMessage = `Error in component${componentName ? ` "${componentName}"` : ''}:\n`;
    errorMessage += `${error?.name}: ${error?.message}\n`;
    
    if (errorInfo?.componentStack) {
      // Extract just the first few lines of the stack
      const stackLines = errorInfo.componentStack.split('\n').slice(0, 5).join('\n');
      errorMessage += `\nComponent stack:${stackLines}`;
    }
    
    this.props.onFixWithAI?.(errorMessage);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-full bg-zinc-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Component Error</h3>
            <p className="text-zinc-400 text-sm mb-2">
              {this.props.componentName && (
                <span className="text-zinc-300 font-mono">{this.props.componentName}: </span>
              )}
              {this.state.error?.message || 'Something went wrong rendering this component'}
            </p>
            
            {/* Show error details in collapsible */}
            {this.state.error && (
              <details className="text-left mb-4 bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-400">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-red-400 overflow-auto max-h-32 font-mono">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <span className="text-zinc-500">{this.state.errorInfo.componentStack}</span>
                  )}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.handleRetry}
                className="gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </Button>
              {this.props.onFixWithAI && (
                <Button 
                  size="sm" 
                  onClick={this.handleFixWithAI}
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Fix with AI
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based wrapper for easier use
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
