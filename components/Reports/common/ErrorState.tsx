'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass p-6 border border-red-500/20 bg-red-500/5 animate-scale-in">
      <div className="flex items-start gap-3">
        <div className="shrink-0 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <AlertCircle size={20} className="text-red-400 animate-pulse-slow" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-red-300 text-sm font-medium mb-1">Something went wrong</p>
          <p className="text-red-400/70 text-xs break-words">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-300 text-sm font-medium transition-all hover:scale-105"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
