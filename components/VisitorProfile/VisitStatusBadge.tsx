'use client'

import { CheckCircle, Clock } from 'lucide-react'

type VisitStatus = 'checked_in' | 'checked_out'

interface VisitStatusBadgeProps {
  status: VisitStatus
  duration?: string | null
}

export function VisitStatusBadge({
  status,
  duration,
}: VisitStatusBadgeProps) {
  if (status === 'checked_in') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
        <Clock size={14} className="text-green-400 animate-pulse" />
        <span className="text-xs font-medium text-green-300">In Progress</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
      <CheckCircle size={14} className="text-slate-400" />
      <span className="text-xs font-medium text-slate-400">
        Completed {duration ? `• ${duration}` : ''}
      </span>
    </div>
  )
}
