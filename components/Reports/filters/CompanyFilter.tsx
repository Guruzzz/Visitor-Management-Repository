'use client'

/**
 * CompanyFilter component
 *
 * Multi-select dropdown that lets the user include one or more companies in
 * analytics calculations.  When `selectedCompanies` is `null` or empty, the
 * control reads "All Companies" and every company is included.  Once at least
 * one company is selected the label shows "X selected".
 *
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Building2, ChevronDown, X } from 'lucide-react'

interface CompanyFilterProps {
  /** Full list of companies available for selection. */
  allCompanies: string[]
  /**
   * Currently selected companies.
   * `null` means "all companies" (no filter applied).
   */
  selectedCompanies: string[] | null
  /** Called when the user toggles a single company on or off. */
  onToggle: (company: string) => void
  /** Called when the user clicks "Clear" to reset to "All Companies". */
  onClear: () => void
}

export function CompanyFilter({
  allCompanies,
  selectedCompanies,
  onToggle,
  onClear,
}: CompanyFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ----- Derived state -----

  const hasSelection =
    selectedCompanies !== null && selectedCompanies.length > 0

  const buttonLabel = hasSelection
    ? `${selectedCompanies!.length} selected`
    : 'All Companies'

  // ----- Click-outside to close -----

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  // ----- Handlers -----

  const handleToggle = useCallback(
    (company: string) => {
      onToggle(company)
    },
    [onToggle],
  )

  const handleClear = useCallback(() => {
    onClear()
    setIsOpen(false)
  }, [onClear])

  const isSelected = useCallback(
    (company: string) =>
      !hasSelection || selectedCompanies!.includes(company),
    [hasSelection, selectedCompanies],
  )

  // ----- Render -----

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-slate-800/50 border transition-all duration-200
          text-sm font-medium focus:outline-none focus:ring-2
          focus:ring-green-500/20
          ${
            hasSelection
              ? 'border-green-500/50 text-green-300 bg-green-500/10'
              : 'border-slate-700 text-slate-300 hover:border-green-500/30 hover:text-green-300'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Icon */}
        <div
          className={`p-1 rounded-lg ${
            hasSelection
              ? 'bg-green-500/20'
              : 'bg-gradient-to-br from-green-500/20 to-green-600/10'
          }`}
        >
          <Building2 size={14} className="text-green-400" />
        </div>

        {/* Label */}
        <span>{buttonLabel}</span>

        {/* Clear badge */}
        {hasSelection && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear company filter"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                onClear()
              }
            }}
            className="ml-0.5 p-0.5 rounded-full hover:bg-green-500/30 text-green-400 hover:text-green-200 transition-colors cursor-pointer"
          >
            <X size={12} />
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          size={14}
          className={`ml-auto text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-50 mt-2 w-64 rounded-xl
            bg-slate-900 border border-slate-700
            shadow-xl shadow-black/40
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-150
          "
          role="listbox"
          aria-label="Company filter options"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Filter by Company
            </span>
            {hasSelection && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-green-400 hover:text-green-200 transition-colors flex items-center gap-1"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Company list */}
          <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
            {allCompanies.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500 text-center">
                No companies available
              </p>
            ) : (
              allCompanies.map((company) => {
                const checked = isSelected(company)
                return (
                  <label
                    key={company}
                    className="
                      flex items-center gap-3 px-4 py-2.5 cursor-pointer
                      hover:bg-green-500/10 transition-colors duration-100
                      group
                    "
                  >
                    {/* Custom checkbox */}
                    <span
                      className={`
                        flex-shrink-0 w-4 h-4 rounded border transition-all duration-150
                        flex items-center justify-center
                        ${
                          checked
                            ? 'bg-green-600 border-green-500'
                            : 'border-slate-600 bg-slate-800 group-hover:border-green-500/60'
                        }
                      `}
                    >
                      {checked && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    {/* Hidden native checkbox for accessibility */}
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggle(company)}
                      className="sr-only"
                      aria-label={company}
                    />

                    {/* Company name */}
                    <span
                      className={`text-sm truncate transition-colors ${
                        checked ? 'text-green-300' : 'text-slate-300 group-hover:text-slate-200'
                      }`}
                    >
                      {company}
                    </span>
                  </label>
                )
              })
            )}
          </div>

          {/* Footer — selection summary */}
          {allCompanies.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {hasSelection
                  ? `${selectedCompanies!.length} of ${allCompanies.length} selected`
                  : `All ${allCompanies.length} companies`}
              </span>
              {hasSelection && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-green-400 hover:text-green-200 transition-colors"
                >
                  Show all
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
