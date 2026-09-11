'use client'

/**
 * DateRangeFilter Component
 *
 * Renders two date input fields (Start Date and End Date) for filtering
 * analytics data. Validates that start <= end before calling the callback.
 * Provides a Reset button to restore the default 30-day range.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { useState, useCallback } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { CalendarDays, RotateCcw, AlertCircle } from 'lucide-react'

/** HTML date input expects and returns values as "yyyy-MM-dd" */
const DATE_INPUT_FORMAT = 'yyyy-MM-dd'

interface DateRangeFilterProps {
  /** Current date range applied to the analytics data */
  dateRange: { start: Date; end: Date }
  /**
   * Called when the user commits a valid new date range.
   * Returns `true` when the update was accepted, `false` when rejected (e.g. start > end).
   */
  onDateRangeChange: (start: Date, end: Date) => boolean
}

/**
 * Returns the default date range: 30 days ago → today.
 * Validates: Requirement 8.2
 */
function getDefaultRange(): { start: Date; end: Date } {
  return { start: subDays(new Date(), 30), end: new Date() }
}

/**
 * Parse an HTML date input string ("yyyy-MM-dd") into a Date object at local midnight.
 * Returns null for empty or invalid strings.
 */
function parseDateInputValue(value: string): Date | null {
  if (!value) return null
  try {
    // parseISO handles "yyyy-MM-dd" as a local date in date-fns v2+
    const parsed = parseISO(value)
    return isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

/**
 * DateRangeFilter
 *
 * Two date pickers (Start Date / End Date) with inline validation and a Reset
 * button. Matches the dark dashboard aesthetic via Tailwind classes.
 *
 * @example
 * ```tsx
 * <DateRangeFilter
 *   dateRange={filters.dateRange}
 *   onDateRangeChange={updateDateRange}
 * />
 * ```
 */
export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
}: DateRangeFilterProps) {
  /**
   * Local draft state — allows the user to partially edit one field without
   * immediately committing. We only commit on blur / when both fields form a
   * valid range.
   */
  const [startValue, setStartValue] = useState<string>(
    format(dateRange.start, DATE_INPUT_FORMAT),
  )
  const [endValue, setEndValue] = useState<string>(
    format(dateRange.end, DATE_INPUT_FORMAT),
  )
  const [error, setError] = useState<string | null>(null)

  /** Attempt to commit the current draft values to the parent. */
  const tryCommit = useCallback(
    (start: string, end: string) => {
      const parsedStart = parseDateInputValue(start)
      const parsedEnd = parseDateInputValue(end)

      if (!parsedStart || !parsedEnd) {
        // Don't report an error for incomplete input — wait until both are filled
        return
      }

      if (parsedStart > parsedEnd) {
        // Validates: Requirement 8.3, 8.4
        setError('Start date must not be after end date.')
        return
      }

      const accepted = onDateRangeChange(parsedStart, parsedEnd)
      if (accepted) {
        setError(null)
      } else {
        setError('Invalid date range.')
      }
    },
    [onDateRangeChange],
  )

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setStartValue(value)
      // Clear stale errors while the user is editing
      setError(null)
      tryCommit(value, endValue)
    },
    [endValue, tryCommit],
  )

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setEndValue(value)
      setError(null)
      tryCommit(startValue, value)
    },
    [startValue, tryCommit],
  )

  /** Validates: Requirement 8.2 — reset to 30-day default */
  const handleReset = useCallback(() => {
    const { start, end } = getDefaultRange()
    const startStr = format(start, DATE_INPUT_FORMAT)
    const endStr = format(end, DATE_INPUT_FORMAT)
    setStartValue(startStr)
    setEndValue(endStr)
    setError(null)
    onDateRangeChange(start, end)
  }, [onDateRangeChange])

  return (
    <div className="flex flex-col gap-3">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <CalendarDays size={16} className="text-blue-400 shrink-0" />
        <span className="text-sm font-medium text-slate-300">Date Range</span>
      </div>

      {/* Inputs row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Start Date */}
        <div className="flex-1 flex flex-col gap-1">
          <label
            htmlFor="date-range-start"
            className="text-xs font-medium text-slate-400 uppercase tracking-wide"
          >
            Start Date
          </label>
          <input
            id="date-range-start"
            type="date"
            value={startValue}
            onChange={handleStartChange}
            aria-label="Start Date"
            aria-invalid={!!error}
            aria-describedby={error ? 'date-range-error' : undefined}
            className={[
              'w-full px-3 py-2 rounded-xl text-sm',
              'bg-slate-800/50 border text-slate-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              // Colour-code the calendar icon in webkit browsers
              '[color-scheme:dark]',
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-700 focus:border-blue-500',
            ].join(' ')}
          />
        </div>

        {/* Separator */}
        <div className="hidden sm:flex items-end pb-2 text-slate-500 text-sm select-none">
          →
        </div>

        {/* End Date */}
        <div className="flex-1 flex flex-col gap-1">
          <label
            htmlFor="date-range-end"
            className="text-xs font-medium text-slate-400 uppercase tracking-wide"
          >
            End Date
          </label>
          <input
            id="date-range-end"
            type="date"
            value={endValue}
            onChange={handleEndChange}
            aria-label="End Date"
            aria-invalid={!!error}
            aria-describedby={error ? 'date-range-error' : undefined}
            className={[
              'w-full px-3 py-2 rounded-xl text-sm',
              'bg-slate-800/50 border text-slate-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              '[color-scheme:dark]',
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-slate-700 focus:border-blue-500',
            ].join(' ')}
          />
        </div>

        {/* Reset button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleReset}
            title="Reset to last 30 days"
            aria-label="Reset date range to last 30 days"
            className={[
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium',
              'bg-slate-700/50 border border-slate-600 text-slate-300',
              'hover:bg-slate-700 hover:text-slate-50 hover:border-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              'transition-colors duration-150',
            ].join(' ')}
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Validation error — Validates: Requirement 8.4 */}
      {error && (
        <div
          id="date-range-error"
          role="alert"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
