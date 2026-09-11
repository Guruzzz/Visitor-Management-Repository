'use client';

import React from 'react';

interface LoadingStateProps {
  rows?: number;
  showChart?: boolean;
}

export function LoadingState({ rows = 3, showChart = true }: LoadingStateProps) {
  return (
    <div className="glass p-6 animate-slide-up space-y-4">
      {/* Chart area placeholder */}
      {showChart && (
        <div className="w-full h-48 bg-slate-700/50 animate-pulse rounded-xl" />
      )}

      {/* Row placeholders */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Icon placeholder */}
            <div className="h-10 w-10 shrink-0 bg-slate-700/50 animate-pulse rounded-xl" />
            {/* Text placeholders */}
            <div className="flex-1 space-y-2">
              <div
                className="h-3 bg-slate-700/50 animate-pulse rounded"
                style={{ width: `${70 - i * 10}%` }}
              />
              <div
                className="h-3 bg-slate-700/30 animate-pulse rounded"
                style={{ width: `${50 - i * 8}%` }}
              />
            </div>
            {/* Value placeholder */}
            <div className="h-6 w-16 shrink-0 bg-slate-700/50 animate-pulse rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
