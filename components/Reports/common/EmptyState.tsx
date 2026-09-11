'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="glass p-10 flex flex-col items-center justify-center gap-4 border border-slate-700/50 animate-scale-in">
      <div className="p-4 bg-slate-700/30 rounded-2xl border border-slate-700/50">
        {icon ?? <BarChart3 size={32} className="text-slate-500" />}
      </div>
      <p className="text-slate-500 text-sm text-center max-w-xs">{message}</p>
    </div>
  );
}
