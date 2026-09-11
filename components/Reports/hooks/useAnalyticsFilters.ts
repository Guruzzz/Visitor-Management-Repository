/**
 * useAnalyticsFilters Hook
 *
 * Manages the filter state for the Reports & Analytics Dashboard.
 * Provides stable callbacks for updating date range, toggling departments
 * and companies, and resetting filters to defaults.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3, 9.5, 10.1, 10.2, 10.3, 10.5
 */

import { useState, useCallback } from 'react'
import { subDays } from 'date-fns'
import type { AnalyticsFilters } from '@/lib/analyticsTypes'

/**
 * Creates a fresh default filter state:
 *   - dateRange: today - 30 days → today
 *   - departments: null (all departments)
 *   - companies: null (all companies)
 *
 * Validates: Requirements 8.2, 9.3, 10.3
 */
function createDefaultFilters(): AnalyticsFilters {
  return {
    dateRange: { start: subDays(new Date(), 30), end: new Date() },
    departments: null,
    companies: null,
  }
}

export interface UseAnalyticsFiltersReturn {
  /** Current filter state */
  filters: AnalyticsFilters

  /**
   * Update the date range. Validates that start <= end.
   * Returns true when the update was applied, false when validation failed.
   *
   * Validates: Requirements 8.3, 8.4, 8.5
   */
  updateDateRange: (start: Date, end: Date) => boolean

  /**
   * Toggle a single department in the selection.
   * If departments is currently null (all), starts a new selection from [dept].
   * If dept is already selected, removes it.
   * If dept is not selected, adds it.
   *
   * Validates: Requirements 9.2, 9.4
   */
  toggleDepartment: (dept: string) => void

  /**
   * Toggle a single company in the selection.
   * If companies is currently null (all), starts a new selection from [company].
   * If company is already selected, removes it.
   * If company is not selected, adds it.
   *
   * Validates: Requirements 10.2, 10.4
   */
  toggleCompany: (company: string) => void

  /**
   * Reset all filters to default state (30-day range, all departments, all companies).
   *
   * Validates: Requirements 8.2, 9.3, 9.5, 10.3, 10.5
   */
  clearFilters: () => void

  /**
   * Reset department filter to null (all departments).
   *
   * Validates: Requirements 9.5
   */
  clearDepartments: () => void

  /**
   * Reset company filter to null (all companies).
   *
   * Validates: Requirements 10.5
   */
  clearCompanies: () => void
}

/**
 * Hook that owns the Analytics Dashboard filter state.
 *
 * All returned callbacks are stable references (useCallback) so child
 * components that receive them as props will not re-render unnecessarily.
 *
 * @example
 * ```tsx
 * const {
 *   filters,
 *   updateDateRange,
 *   toggleDepartment,
 *   toggleCompany,
 *   clearFilters,
 *   clearDepartments,
 *   clearCompanies,
 * } = useAnalyticsFilters()
 * ```
 */
export function useAnalyticsFilters(): UseAnalyticsFiltersReturn {
  const [filters, setFilters] = useState<AnalyticsFilters>(createDefaultFilters)

  /**
   * Validates start <= end, then applies the new date range.
   * Returns false (without updating state) when start > end.
   *
   * Validates: Requirements 8.3, 8.4
   */
  const updateDateRange = useCallback((start: Date, end: Date): boolean => {
    if (start > end) {
      return false
    }
    setFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }))
    return true
  }, [])

  /**
   * Adds dept to the selection if absent; removes it if present.
   * If departments was null, initialises the selection to [dept].
   *
   * Validates: Requirements 9.2, 9.4
   */
  const toggleDepartment = useCallback((dept: string): void => {
    setFilters((prev) => {
      const current = prev.departments ?? []
      const updated = current.includes(dept)
        ? current.filter((d) => d !== dept)
        : [...current, dept]
      return {
        ...prev,
        // An empty selection means "no departments" — keep as [] to distinguish
        // from null (all departments). Consumers can call clearDepartments() to
        // return to "all".
        departments: updated,
      }
    })
  }, [])

  /**
   * Adds company to the selection if absent; removes it if present.
   * If companies was null, initialises the selection to [company].
   *
   * Validates: Requirements 10.2, 10.4
   */
  const toggleCompany = useCallback((company: string): void => {
    setFilters((prev) => {
      const current = prev.companies ?? []
      const updated = current.includes(company)
        ? current.filter((c) => c !== company)
        : [...current, company]
      return {
        ...prev,
        companies: updated,
      }
    })
  }, [])

  /**
   * Resets all three filter axes to their defaults.
   *
   * Validates: Requirements 8.2, 9.3, 9.5, 10.3, 10.5
   */
  const clearFilters = useCallback((): void => {
    setFilters(createDefaultFilters())
  }, [])

  /**
   * Clears only the department selection (returns to "all departments").
   *
   * Validates: Requirements 9.5
   */
  const clearDepartments = useCallback((): void => {
    setFilters((prev) => ({ ...prev, departments: null }))
  }, [])

  /**
   * Clears only the company selection (returns to "all companies").
   *
   * Validates: Requirements 10.5
   */
  const clearCompanies = useCallback((): void => {
    setFilters((prev) => ({ ...prev, companies: null }))
  }, [])

  return {
    filters,
    updateDateRange,
    toggleDepartment,
    toggleCompany,
    clearFilters,
    clearDepartments,
    clearCompanies,
  }
}
