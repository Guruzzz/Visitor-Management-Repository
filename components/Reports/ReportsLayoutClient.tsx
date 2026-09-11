'use client'

/**
 * ReportsLayoutClient
 *
 * Root client component for the Reports & Analytics Dashboard.
 * Orchestrates hooks, real-time subscription, filter bar, and all six
 * analytics sections in a responsive grid layout.
 *
 * Grid layout:
 *   - Mobile  (< 768px) : 1 column
 *   - Tablet  (768–1023px) : 2 columns
 *   - Desktop (≥ 1024px) : 3 columns
 *       VisitorStats    → lg:col-span-2
 *       TimeAnalytics   → lg:col-span-3
 *       RecentActivity  → lg:col-span-3
 *       Others          → 1 column each
 *
 * Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.4, 7.3, 11.1, 11.2, 11.3,
 *            11.5, 12.1, 12.6, 13.1, 13.2, 13.3
 */

import { useCallback } from 'react'
import { BarChart3, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { useAnalyticsFilters } from './hooks/useAnalyticsFilters'
import { useReportData } from './hooks/useReportData'
import { useRealtimeSubscription } from './hooks/useRealtimeSubscription'
import { FilterBar } from './filters/FilterBar'
import { VisitorStatsSection } from './sections/VisitorStatsSection'
import { DepartmentAnalyticsSection } from './sections/DepartmentAnalyticsSection'
import { CompanyAnalyticsSection } from './sections/CompanyAnalyticsSection'
import { DurationAnalyticsSection } from './sections/DurationAnalyticsSection'
import { TimeAnalyticsSection } from './sections/TimeAnalyticsSection'
import { RecentActivitySection } from './sections/RecentActivitySection'
import { ErrorState } from './common/ErrorState'
import { ExportButton } from './ExportButton'

export function ReportsLayoutClient() {
  // -----------------------------------------------------------------------
  // Filter state
  // -----------------------------------------------------------------------
  const {
    filters,
    updateDateRange,
    toggleDepartment,
    toggleCompany,
    clearFilters,
    clearDepartments,
    clearCompanies,
  } = useAnalyticsFilters()

  // -----------------------------------------------------------------------
  // Data layer (initial load + in-memory aggregation)
  // -----------------------------------------------------------------------
  const {
    metrics,
    allDepartments,
    allCompanies,
    isLoading,
    error,
    reload,
  } = useReportData(filters)

  // -----------------------------------------------------------------------
  // Real-time subscription
  //
  // The subscription is intentionally separate from useReportData so we can
  // display its status independently without affecting the data loading state.
  // useReportData already handles the INSERT/UPDATE updates internally via
  // its own subscribeToVisitsChanges call — so we wire useRealtimeSubscription
  // only for displaying connection status. We pass a no-op callback here to
  // avoid double-processing events.
  // -----------------------------------------------------------------------
  const noopHandler = useCallback(() => {}, [])
  const { status: subscriptionStatus, error: subscriptionError } =
    useRealtimeSubscription(noopHandler, true)

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <BarChart3 size={22} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-50">Reports & Analytics</h1>
            <p className="text-sm text-slate-400">
              Real-time visit statistics and insights
            </p>
          </div>
        </div>

        {/* Right-side controls: subscription status + export */}
        <div className="flex items-center gap-3">
          <SubscriptionBanner status={subscriptionStatus} error={subscriptionError} />
          <ExportButton
            metrics={metrics}
            filters={filters}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────── */}
      <FilterBar
        filters={filters}
        allDepartments={allDepartments}
        allCompanies={allCompanies}
        onDateRangeChange={updateDateRange}
        onToggleDepartment={toggleDepartment}
        onToggleCompany={toggleCompany}
        onClearDepartments={clearDepartments}
        onClearCompanies={clearCompanies}
        onClearAll={clearFilters}
      />

      {/* ── Error state (initial load failure) ─────────────────────── */}
      {error && (
        <ErrorState message={error} onRetry={reload} />
      )}

      {/* ── Analytics grid ─────────────────────────────────────────── */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Visitor Stats — spans 2 columns on desktop */}
          <div className="lg:col-span-2">
            <VisitorStatsSection
              metrics={metrics.visitorStats}
              dateRange={filters.dateRange}
              isLoading={isLoading}
            />
          </div>

          {/* Department Analytics */}
          <div>
            <DepartmentAnalyticsSection
              metrics={metrics.departmentStats}
              isLoading={isLoading}
            />
          </div>

          {/* Company Analytics */}
          <div>
            <CompanyAnalyticsSection
              metrics={metrics.companyStats}
              isLoading={isLoading}
            />
          </div>

          {/* Duration Analytics */}
          <div>
            <DurationAnalyticsSection
              metrics={metrics.durationStats}
              isLoading={isLoading}
            />
          </div>

          {/* Time Analytics — spans full 3 columns on desktop */}
          <div className="lg:col-span-3">
            <TimeAnalyticsSection
              metrics={metrics.timeStats}
              isLoading={isLoading}
            />
          </div>

          {/* Recent Activity — spans full 3 columns on desktop */}
          <div className="lg:col-span-3">
            <RecentActivitySection
              activity={metrics.recentActivity}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// SubscriptionBanner
// ---------------------------------------------------------------------------

type SubscriptionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface SubscriptionBannerProps {
  status: SubscriptionStatus
  error: string | null
}

function SubscriptionBanner({ status, error }: SubscriptionBannerProps) {
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-green-400">
        <Wifi size={13} />
        Live
      </div>
    )
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        Connecting…
      </div>
    )
  }

  if (status === 'disconnected') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-300">
        <WifiOff size={13} />
        Disconnected – live updates paused
      </div>
    )
  }

  // error
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-300"
      title={error ?? undefined}
    >
      <AlertTriangle size={13} />
      Connection error
    </div>
  )
}
