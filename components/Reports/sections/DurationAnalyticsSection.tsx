'use client'

/**
 * DurationAnalyticsSection
 *
 * Three metric cards (average, longest, shortest visit) plus a histogram of
 * the 15-minute duration buckets. Requires at least 5 completed visits; shows
 * an insufficient-data message otherwise.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

import React, { memo } from 'react'
import { Clock, TrendingUp, TrendingDown, Timer } from 'lucide-react'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import { MetricCard } from '../common/MetricCard'
import HistogramComponent from '../charts/HistogramComponent'
import { CHART_COLORS } from '../charts/chartUtils'
import type { DurationMetrics } from '@/lib/analyticsTypes'

interface DurationAnalyticsSectionProps {
  metrics: DurationMetrics
  isLoading: boolean
}

/** Format a minute count as "Xh Ym" or just "Ym" */
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Sum all bucket counts to determine if there are enough completed visits. */
function completedCount(metrics: DurationMetrics): number {
  return metrics.durationDistribution.reduce((sum, b) => sum + b.count, 0)
}

function DurationAnalyticsSectionInner({
  metrics,
  isLoading,
}: DurationAnalyticsSectionProps) {
  if (isLoading) {
    return <LoadingState rows={3} showChart />
  }

  const total = completedCount(metrics)
  const hasEnoughData = total >= 5

  return (
    <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <Timer size={16} className="text-amber-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">Duration Analytics</h2>
      </div>

      {!hasEnoughData ? (
        <EmptyState
          message="Insufficient visit data to calculate duration statistics. At least 5 completed visits are required."
          icon={<Timer size={32} className="text-slate-500" />}
        />
      ) : (
        <>
          {/* Three metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Average Duration"
              value={metrics.averageDuration !== null ? formatMinutes(metrics.averageDuration) : '—'}
              icon={<Clock size={20} className="text-amber-400" />}
              color="amber"
            />
            <MetricCard
              label="Longest Visit"
              value={metrics.longestVisit ? formatMinutes(metrics.longestVisit.duration) : '—'}
              sublabel={
                metrics.longestVisit
                  ? `${metrics.longestVisit.visitorName} · ${metrics.longestVisit.department}`
                  : undefined
              }
              icon={<TrendingUp size={20} className="text-red-400" />}
              color="red"
            />
            <MetricCard
              label="Shortest Visit"
              value={metrics.shortestVisit ? formatMinutes(metrics.shortestVisit.duration) : '—'}
              sublabel={
                metrics.shortestVisit
                  ? `${metrics.shortestVisit.visitorName} · ${metrics.shortestVisit.department}`
                  : undefined
              }
              icon={<TrendingDown size={20} className="text-green-400" />}
              color="green"
            />
          </div>

          {/* Duration histogram */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Duration Distribution
            </p>
            <HistogramComponent
              data={metrics.durationDistribution}
              color={CHART_COLORS.amber}
              height={240}
            />
          </div>
        </>
      )}
    </div>
  )
}

export const DurationAnalyticsSection = memo(DurationAnalyticsSectionInner)
