'use client'

/**
 * VisitorStatsSection
 *
 * Displays total unique visitors plus daily, weekly, and monthly trend charts.
 * Weekly and monthly charts are only shown when the selected date range spans
 * at least 14 days.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import React, { memo } from 'react'
import { Users } from 'lucide-react'
import { differenceInCalendarDays } from 'date-fns'
import { MetricCard } from '../common/MetricCard'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import LineChartComponent from '../charts/LineChartComponent'
import BarChartComponent from '../charts/BarChartComponent'
import { CHART_COLORS } from '../charts/chartUtils'
import type { VisitorStatsMetrics } from '@/lib/analyticsTypes'

interface VisitorStatsSectionProps {
  metrics: VisitorStatsMetrics
  dateRange: { start: Date; end: Date }
  isLoading: boolean
}

function VisitorStatsSectionInner({
  metrics,
  dateRange,
  isLoading,
}: VisitorStatsSectionProps) {
  if (isLoading) {
    return <LoadingState rows={3} showChart />
  }

  const rangeDays = differenceInCalendarDays(dateRange.end, dateRange.start)
  const showWeeklyMonthly = rangeDays >= 14

  const hasData = metrics.totalUniqueVisitors > 0

  return (
    <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-6">
      {/* Section heading */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <Users size={16} className="text-blue-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">Visitor Statistics</h2>
      </div>

      {/* Total unique visitors metric */}
      <MetricCard
        label="Total Unique Visitors"
        value={metrics.totalUniqueVisitors}
        icon={<Users size={20} className="text-blue-400" />}
        color="blue"
      />

      {!hasData ? (
        <EmptyState message="No visitor data available for the selected filters." />
      ) : (
        <>
          {/* Daily trend */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Daily Trend
            </p>
            <LineChartComponent
              data={metrics.dailyTrends}
              xKey="date"
              yKey="count"
              color={CHART_COLORS.blue}
              height={200}
            />
          </div>

          {/* Weekly trend (only shown for ≥ 14 days) */}
          {showWeeklyMonthly && metrics.weeklyTrends.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Weekly Trend
              </p>
              <BarChartComponent
                data={metrics.weeklyTrends}
                xKey="week"
                yKey="count"
                color={CHART_COLORS.purple}
                height={200}
              />
            </div>
          )}

          {/* Monthly trend (only shown for ≥ 14 days) */}
          {showWeeklyMonthly && metrics.monthlyTrends.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Monthly Trend
              </p>
              <BarChartComponent
                data={metrics.monthlyTrends}
                xKey="month"
                yKey="count"
                color={CHART_COLORS.cyan}
                height={200}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export const VisitorStatsSection = memo(VisitorStatsSectionInner)
