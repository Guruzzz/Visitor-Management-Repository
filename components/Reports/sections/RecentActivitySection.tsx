'use client'

/**
 * RecentActivitySection
 *
 * Table/list of up to 20 most recent visit events (check-ins and check-outs)
 * ordered by timestamp descending.
 *
 * Each row shows: visitor name, company, department, check-in time, check-out time
 * (or "Active" badge). Check-ins use a green badge; check-outs use a blue badge.
 *
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import React, { memo } from 'react'
import { Activity, LogIn, LogOut } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import type { ActivityEvent } from '@/lib/analyticsTypes'

interface RecentActivitySectionProps {
  activity: ActivityEvent[]
  isLoading: boolean
}

/** Format an ISO timestamp to a concise human-readable string. */
function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), 'MMM d, HH:mm')
  } catch {
    return iso
  }
}

function RecentActivitySectionInner({
  activity,
  isLoading,
}: RecentActivitySectionProps) {
  if (isLoading) {
    return <LoadingState rows={5} showChart={false} />
  }

  return (
    <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
            <Activity size={16} className="text-pink-400" />
          </div>
          <h2 className="text-base font-semibold text-slate-200">Recent Activity</h2>
        </div>
        {activity.length > 0 && (
          <span className="text-xs text-slate-500">
            {activity.length} event{activity.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {activity.length === 0 ? (
        <EmptyState
          message="No recent activity for the selected filters."
          icon={<Activity size={32} className="text-slate-500" />}
        />
      ) : (
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Type
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Visitor
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Company
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Department
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Check-in
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 py-2">
                  Check-out
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {activity.map((event) => (
                <tr
                  key={`${event.id}-${event.type}`}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Type badge */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {event.type === 'check_in' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-300 border border-green-500/25">
                        <LogIn size={11} />
                        In
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                        <LogOut size={11} />
                        Out
                      </span>
                    )}
                  </td>

                  {/* Visitor name */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="font-medium text-slate-200">{event.visitorName}</span>
                  </td>

                  {/* Company */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-slate-400">{event.visitorCompany}</span>
                  </td>

                  {/* Department */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-slate-400">{event.department}</span>
                  </td>

                  {/* Check-in time */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-slate-300">{formatTime(event.checkInTime)}</span>
                  </td>

                  {/* Check-out time or "Active" badge */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {event.checkOutTime ? (
                      <span className="text-slate-300">{formatTime(event.checkOutTime)}</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export const RecentActivitySection = memo(RecentActivitySectionInner)
