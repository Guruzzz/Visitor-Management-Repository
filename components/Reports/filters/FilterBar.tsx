'use client'

/**
 * FilterBar
 *
 * Composes DateRangeFilter, DepartmentFilter, and CompanyFilter into a single
 * glass-card container with a "Reset All" button.
 *
 * Layout:
 *   - DateRangeFilter: full-width top row
 *   - DepartmentFilter + CompanyFilter: side-by-side on ≥ sm, stacked on mobile
 *   - Reset All: aligned right
 *
 * Validates: Requirements 8.1, 9.1, 10.1, 11.1, 11.2, 11.5
 */

import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { DateRangeFilter } from './DateRangeFilter'
import { DepartmentFilter } from './DepartmentFilter'
import { CompanyFilter } from './CompanyFilter'
import type { AnalyticsFilters } from '@/lib/analyticsTypes'

interface FilterBarProps {
  /** Current filter state */
  filters: AnalyticsFilters
  /** All department names available for selection */
  allDepartments: string[]
  /** All company names available for selection */
  allCompanies: string[]
  /** Called when the date range is changed; returns false for invalid ranges */
  onDateRangeChange: (start: Date, end: Date) => boolean
  /** Toggle a single department on/off */
  onToggleDepartment: (dept: string) => void
  /** Toggle a single company on/off */
  onToggleCompany: (company: string) => void
  /** Reset department filter to "all" */
  onClearDepartments: () => void
  /** Reset company filter to "all" */
  onClearCompanies: () => void
  /** Reset all filters to defaults */
  onClearAll: () => void
}

/**
 * Returns a count of how many filter axes have active (non-null, non-empty) selections.
 */
function activeFilterCount(filters: AnalyticsFilters): number {
  let count = 0
  if (filters.departments !== null && filters.departments.length > 0) count++
  if (filters.companies !== null && filters.companies.length > 0) count++
  return count
}

export function FilterBar({
  filters,
  allDepartments,
  allCompanies,
  onDateRangeChange,
  onToggleDepartment,
  onToggleCompany,
  onClearDepartments,
  onClearCompanies,
  onClearAll,
}: FilterBarProps) {
  const filterCount = activeFilterCount(filters)

  return (
    <div className="glass p-6 rounded-2xl mb-6 border border-slate-700/50">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <SlidersHorizontal size={16} className="text-blue-400" />
          </div>
          <h2 className="text-sm font-semibold text-slate-200">Filters</h2>
          {filterCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {filterCount}
            </span>
          )}
        </div>

        {/* Reset All button — only show when something is active */}
        {filterCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            aria-label="Reset all filters to defaults"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
              bg-slate-700/50 border border-slate-600 text-slate-300
              hover:bg-slate-600/60 hover:text-slate-50 hover:border-slate-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
              transition-colors duration-150"
          >
            <RotateCcw size={13} />
            Reset All
          </button>
        )}
      </div>

      {/* Date range — full width */}
      <div className="mb-4">
        <DateRangeFilter
          dateRange={filters.dateRange}
          onDateRangeChange={onDateRangeChange}
        />
      </div>

      {/* Department + Company — side by side on sm+, stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
            Department
          </p>
          <DepartmentFilter
            allDepartments={allDepartments}
            selectedDepartments={filters.departments}
            onToggle={onToggleDepartment}
            onClear={onClearDepartments}
          />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
            Company
          </p>
          <CompanyFilter
            allCompanies={allCompanies}
            selectedCompanies={filters.companies}
            onToggle={onToggleCompany}
            onClear={onClearCompanies}
          />
        </div>
      </div>
    </div>
  )
}
