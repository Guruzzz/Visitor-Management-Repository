'use client'

import { Loader } from 'lucide-react'

export function LoadingStates() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Photo skeleton */}
          <div className="w-24 h-24 rounded-lg bg-slate-700/50 flex-shrink-0" />

          {/* Name and Info skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-8 bg-slate-700/50 rounded-lg w-3/4 mb-2" />
            <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-2" />
            <div className="h-4 bg-slate-700/50 rounded w-1/3" />
          </div>

          {/* Stats skeleton */}
          <div className="flex gap-4 w-full md:w-auto flex-col sm:flex-row">
            <div className="h-16 bg-slate-700/50 rounded-lg flex-1 md:flex-none min-w-24" />
            <div className="h-16 bg-slate-700/50 rounded-lg flex-1 md:flex-none min-w-24" />
          </div>
        </div>
      </div>

      {/* Details Section Skeleton */}
      <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-5 h-5 bg-slate-700/50 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-slate-700/50 rounded w-1/4 mb-2" />
                <div className="h-4 bg-slate-700/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Section Skeleton */}
      <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-sm p-6 rounded-lg border border-slate-700/50 text-center">
              <div className="h-4 bg-slate-700/50 rounded w-2/3 mx-auto mb-3" />
              <div className="h-8 bg-slate-700/50 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* History Section Skeleton */}
      <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
        <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-sm p-4 rounded-lg border border-slate-700/50 animate-pulse">
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-slate-700/50 rounded w-1/4" />
                <div className="h-4 bg-slate-700/50 rounded w-1/6" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-700/50 rounded w-3/4" />
                <div className="h-3 bg-slate-700/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function InitialLoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader size={48} className="text-slate-400 mb-4 animate-spin" />
      <p className="text-slate-400">Loading visitor profile...</p>
    </div>
  )
}
