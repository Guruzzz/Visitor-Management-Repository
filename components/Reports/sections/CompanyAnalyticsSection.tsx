'use client'

/**
 * CompanyAnalyticsSection
 *
 * Bar chart of the top 10 companies by visit frequency. Shows an
 * insufficient-data message when fewer than 2 distinct companies are present.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7
 */

import React, { memo } from 'react'
import { Briefcase } from 'lucide-react'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import BarChartComponent from '../charts/BarChartComponent'
import { CHART_COLORS } from '../charts/chartUtils'
import type { CompanyMetrics } from '@/lib/analyticsTypes'

interface CompanyAnalyticsSectionProps {
  metrics: CompanyMetrics
  isLoading: boolean
}

function CompanyAnalyticsSectionInner({
  metrics,
  isLoading,
}: CompanyAnalyticsSectionProps) {
  if (isLoading) {
    return <LoadingState rows={4} showChart />
  }

  const hasData = metrics.topCompanies.length >= 2

  return (
    <div className="glass p-6 rounded-2xl border border-slate-700/50 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
          <Briefcase size={16} className="text-green-400" />
        </div>
        <h2 className="text-base font-semibold text-slate-200">Company Analytics</h2>
        <span className="text-xs text-slate-500 ml-auto">Top 10</span>
      </div>

      {!hasData ? (
        <EmptyState
          message="Insufficient company data available for the selected filters."
          icon={<Briefcase size={32} className="text-slate-500" />}
        />
      ) : (
        <>
          <BarChartComponent
            data={metrics.topCompanies}
            xKey="name"
            yKey="visitCount"
            color={CHART_COLORS.green}
            height={260}
          />

          {/* Ranked list */}
          <div className="space-y-2 mt-2">
            {metrics.topCompanies.map((company, idx) => (
              <div
                key={company.name}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/40 hover:bg-slate-700/40 transition-colors"
              >
                <span className="text-xs font-bold text-slate-500 w-5 shrink-0 text-right">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      {company.name}
                    </span>
                    <span className="text-xs font-semibold text-green-300 ml-2 shrink-0">
                      {company.visitCount}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500/70 rounded-full transition-all duration-500"
                      style={{ width: `${company.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0 w-10 text-right">
                  {company.percentage}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const CompanyAnalyticsSection = memo(CompanyAnalyticsSectionInner)
