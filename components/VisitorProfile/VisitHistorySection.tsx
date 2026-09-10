'use client'

import { format } from 'date-fns'
import { Loader, ChevronRight } from 'lucide-react'
import { VisitStatusBadge } from './VisitStatusBadge'
import { DurationDisplay } from './DurationDisplay'
import type { Visit } from '@/lib/visitors'

interface VisitHistorySectionProps {
  visits: Visit[]
  isLoading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  isLoadingMore?: boolean
}

export function VisitHistorySection({
  visits,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: VisitHistorySectionProps) {
  if (isLoading) {
    return <VisitHistorySectionSkeleton />
  }

  if (visits.length === 0) {
    return (
      <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 text-center py-12">
        <p className="text-slate-400">No visit history available</p>
      </div>
    )
  }

  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700">
      <h2 className="text-xl font-bold text-slate-50 mb-6">Visit History</h2>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Person Visited
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr
                key={visit.id}
                className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-50">
                  <div>
                    {format(new Date(visit.check_in_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs text-slate-500">
                    {format(new Date(visit.check_in_at), 'HH:mm')}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-50">
                  {visit.person_being_visited}
                </td>
                <td className="px-4 py-4 text-sm text-slate-50">
                  {visit.department}
                </td>
                <td className="px-4 py-4 text-sm text-slate-400 max-w-xs truncate">
                  {visit.purpose}
                </td>
                <td className="px-4 py-4 text-sm">
                  <VisitStatusBadge status={visit.status} />
                </td>
                <td className="px-4 py-4 text-center text-sm">
                  <DurationDisplay
                    status={visit.status}
                    checkInAt={visit.check_in_at}
                    checkOutAt={visit.check_out_at}
                    duration={visit.duration}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-3">
        {visits.map((visit) => (
          <div
            key={visit.id}
            className="glass-sm p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-50">
                  {visit.person_being_visited}
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(visit.check_in_at), 'MMM d, HH:mm')}
                </p>
              </div>
              <VisitStatusBadge status={visit.status} />
            </div>

            <div className="space-y-2 mb-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-50">{visit.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <DurationDisplay
                  status={visit.status}
                  checkInAt={visit.check_in_at}
                  checkOutAt={visit.check_out_at}
                  duration={visit.duration}
                />
              </div>
            </div>

            {visit.purpose && (
              <p className="text-xs text-slate-400 italic">
                Purpose: {visit.purpose}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="mt-6 w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-blue-300 font-medium transition-colors"
        >
          {isLoadingMore ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>Load More Visits</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>
      )}
    </div>
  )
}

export function VisitHistorySectionSkeleton() {
  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
      <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-6" />

      <div className="hidden md:block space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-slate-700/50">
            <div className="h-4 bg-slate-700/50 rounded w-1/6 flex-shrink-0" />
            <div className="h-4 bg-slate-700/50 rounded w-1/5 flex-shrink-0" />
            <div className="h-4 bg-slate-700/50 rounded w-1/4 flex-shrink-0" />
            <div className="h-4 bg-slate-700/50 rounded flex-1" />
            <div className="h-4 bg-slate-700/50 rounded w-1/6 flex-shrink-0" />
            <div className="h-4 bg-slate-700/50 rounded w-1/6 flex-shrink-0" />
          </div>
        ))}
      </div>

      <div className="md:hidden space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-sm p-4 rounded-lg border border-slate-700/50">
            <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-2" />
            <div className="h-3 bg-slate-700/50 rounded w-1/3 mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-700/50 rounded w-2/3" />
              <div className="h-3 bg-slate-700/50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
