'use client'

/**
 * TimeAnalyticsSection
 *
 * Two bar charts:
 *   1. Check-ins by hour of day (0–23) with peak hour annotated
 *   2. Check-ins by day of week (Mon–Sun) with peak day annotated
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

import React, { memo } from 'react'
import { Clock4 } from 'lucide-react'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import BarChartComponent from '../charts/BarChartComponent'
import { CHART_COLORS } from '../charts/chartUtils'
import type { TimeMetrics } from '@/lib/analyticsTypes'

interface TimeAnalyticsSectionProps {
  metrics: TimeMetrics
  isLoading: boolean
}

function TimeAnalyticsSectionInner({ metrics, isLoading }: TimeAnalyticsSectionProps) {
  if (isLoading) {
    return <LoadingState rows={2} showChart />
  }

  // Check if there's any data at all
  const totalHourCount = metrics.byHour.reduce((s, h) => s + h.count, 0)
  const hasData = totalHourCount > 0

  return (
    <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
          <Clock4 size={16} className="text-cyan-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">Time Analytics</h2>
      </div>

      {!hasData ? (
        <EmptyState message="No time-based data available for the selected filters." />
      ) : (
        <>
          {/* Hour-of-day chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Check-ins by Hour of Day
              </p>
              {metrics.peakHour !== null && (
                <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                  Peak: {String(metrics.peakHour).padStart(2, '0')}:00
                </span>
              )}
            </div>
            <BarChartComponent
              data={metrics.byHour}
              xKey="label"
              yKey="count"
              color={CHART_COLORS.cyan}
              height={220}
            />
          </div>

          {/* Day-of-week chart */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Check-ins by Day of Week
              </p>
              {metrics.peakDay && (
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Peak: {metrics.peakDay}
                </span>
              )}
            </div>
            <BarChartComponent
              data={metrics.byDayOfWeek}
              xKey="day"
              yKey="count"
              color={CHART_COLORS.indigo}
              height={220}
            />
          </div>
        </>
      )}
    </div>
  )
}

export const TimeAnalyticsSection = memo(TimeAnalyticsSectionInner)
