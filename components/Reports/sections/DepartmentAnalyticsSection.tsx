'use client'

/**
 * DepartmentAnalyticsSection
 *
 * Bar chart of departments sorted descending by visit count, followed by a
 * ranked list showing visit counts and percentages.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */

import React, { memo } from 'react'
import { Building2 } from 'lucide-react'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import BarChartComponent from '../charts/BarChartComponent'
import { CHART_COLORS } from '../charts/chartUtils'
import type { DepartmentMetrics } from '@/lib/analyticsTypes'

interface DepartmentAnalyticsSectionProps {
  metrics: DepartmentMetrics
  isLoading: boolean
}

function DepartmentAnalyticsSectionInner({
  metrics,
  isLoading,
}: DepartmentAnalyticsSectionProps) {
  if (isLoading) {
    return <LoadingState rows={4} showChart />
  }

  const hasData = metrics.byDepartment.length > 0

  return (
    <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <Building2 size={16} className="text-purple-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">Department Analytics</h2>
      </div>

      {!hasData ? (
        <EmptyState message="No department data available for the selected filters." />
      ) : (
        <>
          {/* Bar chart */}
          <BarChartComponent
            data={metrics.byDepartment}
            xKey="name"
            yKey="visitCount"
            color={CHART_COLORS.purple}
            height={240}
          />

          {/* Ranked list */}
          <div className="space-y-2 mt-2">
            {metrics.byDepartment.map((dept, idx) => (
              <div
                key={dept.name}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/40 transition-colors"
              >
                {/* Rank */}
                <span className="text-xs font-bold text-slate-500 w-5 shrink-0 text-right">
                  {idx + 1}
                </span>

                {/* Progress bar + name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {dept.name}
                    </span>
                    <span className="text-xs font-semibold text-purple-300 ml-2 shrink-0">
                      {dept.visitCount}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500/70 rounded-full transition-all duration-500"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Percentage */}
                <span className="text-xs text-slate-400 shrink-0 w-10 text-right">
                  {dept.percentage}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const DepartmentAnalyticsSection = memo(DepartmentAnalyticsSectionInner)
