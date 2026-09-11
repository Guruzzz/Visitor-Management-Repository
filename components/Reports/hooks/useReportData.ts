'use client'

/**
 * useReportData Hook
 *
 * Main data orchestrator for the Reports & Analytics Dashboard.
 * Fetches initial visit data, applies in-memory filtering, computes aggregated
 * metrics, and incorporates real-time INSERT/UPDATE events without additional
 * database queries.
 *
 * Validates: Requirements 2.5, 3.5, 4.5, 5.5, 6.4, 7.3, 8.5, 12.1, 12.2, 12.3, 13.1, 13.2
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getAnalyticsVisits,
  getDepartments,
  subscribeToVisitsChanges,
} from '@/lib/visitors'
import {
  filterVisits,
  computeAnalyticsMetrics,
} from '@/lib/analyticsUtils'
import { supabase } from '@/lib/supabase'
import type {
  AnalyticsFilters,
  AnalyticsMetrics,
  VisitWithVisitor,
} from '@/lib/analyticsTypes'

export interface UseReportDataReturn {
  /** Fully aggregated analytics metrics derived from filteredVisits */
  metrics: AnalyticsMetrics
  /** All distinct department names available for filter dropdowns */
  allDepartments: string[]
  /** All distinct company names extracted from loaded visits */
  allCompanies: string[]
  /** True while the initial data load is in flight */
  isLoading: boolean
  /** Non-null when the initial load (or a reload) fails */
  error: string | null
  /** Manually trigger a full data reload */
  reload: () => void
}

/**
 * Loads all visits for the current filter date range, subscribes to real-time
 * changes, and maintains an in-memory derived state of filtered visits and
 * aggregated analytics metrics.
 *
 * @param filters - Current analytics filter state (date range, departments, companies)
 */
export function useReportData(filters: AnalyticsFilters): UseReportDataReturn {
  const [rawVisits, setRawVisits] = useState<VisitWithVisitor[]>([])
  const [allDepartments, setAllDepartments] = useState<string[]>([])
  const [allCompanies, setAllCompanies] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // -------------------------------------------------------------------------
  // Initial data load — re-runs whenever the date range changes
  // -------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [visits, depts] = await Promise.all([
        getAnalyticsVisits(
          filters.dateRange.start,
          filters.dateRange.end
        ),
        getDepartments(),
      ])

      setRawVisits(visits as VisitWithVisitor[])
      setAllDepartments((depts ?? []).map((d: any) => d.name as string))

      // Extract unique, sorted company names from the loaded visits
      const companySet = new Set<string>()
      for (const v of visits as VisitWithVisitor[]) {
        const co = v.visitors?.company
        if (co) companySet.add(co)
      }
      setAllCompanies(Array.from(companySet).sort())
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load analytics data'
      )
    } finally {
      setIsLoading(false)
    }
  }, [filters.dateRange.start, filters.dateRange.end]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData()
  }, [loadData])

  // -------------------------------------------------------------------------
  // Real-time subscription — single channel, lives for the component lifetime
  // -------------------------------------------------------------------------

  useEffect(() => {
    const channel = subscribeToVisitsChanges(({ type, visit }) => {
      setRawVisits((prev) => {
        if (type === 'INSERT') {
          // Prepend so the newest visit is always first in the raw list
          return [visit as VisitWithVisitor, ...prev]
        }
        // UPDATE — replace the matching record in-place
        return prev.map((v) =>
          v.id === visit.id ? (visit as VisitWithVisitor) : v
        )
      })

      // Keep allCompanies in sync when a new company appears via INSERT
      if (type === 'INSERT') {
        const company = (visit as VisitWithVisitor).visitors?.company
        if (company) {
          setAllCompanies((prev) =>
            prev.includes(company) ? prev : [...prev, company].sort()
          )
        }
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, []) // intentionally empty — subscription is permanent for this hook instance

  // -------------------------------------------------------------------------
  // In-memory filtering (Validates: Requirements 8.5, 9.4, 10.4, 13.2)
  // -------------------------------------------------------------------------

  const filteredVisits = useMemo(
    () => filterVisits(rawVisits, filters),
    [rawVisits, filters]
  )

  // -------------------------------------------------------------------------
  // Aggregation (Validates: Requirements 13.1)
  // -------------------------------------------------------------------------

  const metrics = useMemo(
    () => computeAnalyticsMetrics(filteredVisits),
    [filteredVisits]
  )

  return {
    metrics,
    allDepartments,
    allCompanies,
    isLoading,
    error,
    reload: loadData,
  }
}
