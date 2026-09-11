'use client'

/**
 * DepartmentFilter Component
 *
 * A collapsible dropdown multi-select filter for departments.
 * Displays "All Departments" when no selection is active (null or empty),
 * or "X selected" when one or more departments are chosen.
 *
 * Features:
 *   - Checkbox list of all available departments
 *   - "Clear" button to reset selection to all departments (calls onClear)
 *   - Click-outside detection to close the dropdown
 *   - "No departments available" empty state
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Building2, X } from 'lucide-react'

interface DepartmentFilterProps {
  /** Full list of departments to display in the checkbox list. */
  allDepartments: string[]
  /**
   * Currently active selection.
   * `null` means "all departments" (no filter applied).
   * An empty array means no department is selected (show nothing / treat as none).
   */
  selectedDepartments: string[] | null
  /** Called when the user toggles a single department checkbox. */
  onToggle: (dept: string) => void
  /** Called when the user clicks "Clear" — resets selection to all departments. */
  onClear: () => void
}

/**
 * Returns the label shown on the trigger button.
 */
function getTriggerLabel(selectedDepartments: string[] | null): string {
  if (selectedDepartments === null || selectedDepartments.length === 0) {
    return 'All Departments'
  }
  if (selectedDepartments.length === 1) {
    return selectedDepartments[0]
  }
  return `${selectedDepartments.length} selected`
}

/**
 * Returns whether a department is currently checked.
 * When selectedDepartments is null (all mode), every department is treated as checked.
 */
function isDepartmentChecked(
  dept: string,
  selectedDepartments: string[] | null
): boolean {
  if (selectedDepartments === null) return false
  return selectedDepartments.includes(dept)
}

export function DepartmentFilter({
  allDepartments,
  selectedDepartments,
  onToggle,
  onClear,
}: DepartmentFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when user clicks outside the component
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
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  const hasActiveSelection =
    selectedDepartments !== null && selectedDepartments.length > 0

  const triggerLabel = getTriggerLabel(selectedDepartments)

  return (
    <div ref={containerRef} className="relative w-full min-w-[180px]">
      {/* ── Trigger Button ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          'flex w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5',
          'bg-slate-800/50 border-slate-700 text-slate-50',
          'text-sm font-medium transition-colors',
          'hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50',
          isOpen ? 'ring-2 ring-purple-500/50' : '',
        ].join(' ')}
      >
        {/* Icon + label */}
        <span className="flex items-center gap-2 truncate">
          <Building2
            size={16}
            className={
              hasActiveSelection ? 'text-purple-400' : 'text-slate-400'
            }
          />
          <span
            className={
              hasActiveSelection ? 'text-purple-300' : 'text-slate-300'
            }
          >
            {triggerLabel}
          </span>
        </span>

        {/* Right-side: clear badge or chevron */}
        <span className="flex shrink-0 items-center gap-1">
          {hasActiveSelection && (
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white"
              aria-label={`${selectedDepartments!.length} departments selected`}
            >
              {selectedDepartments!.length}
            </span>
          )}
          <ChevronDown
            size={16}
            className={[
              'text-slate-400 transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            ].join(' ')}
          />
        </span>
      </button>

      {/* ── Dropdown Panel ───────────────────────────────────────────── */}
      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label="Departments"
          className={[
            'absolute left-0 z-50 mt-2 w-full min-w-[220px] overflow-hidden',
            'rounded-xl border border-slate-700 bg-slate-800 shadow-xl',
          ].join(' ')}
        >
          {/* Panel header: title + Clear button */}
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Departments
            </span>
            {hasActiveSelection && (
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setIsOpen(false)
                }}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-purple-400 hover:bg-slate-700 hover:text-purple-300 transition-colors"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Scrollable checkbox list */}
          <div className="max-h-60 overflow-y-auto py-1">
            {allDepartments.length === 0 ? (
              // Empty state
              <p className="px-4 py-3 text-sm text-slate-500 italic">
                No departments available
              </p>
            ) : (
              allDepartments.map((dept) => {
                const checked = isDepartmentChecked(dept, selectedDepartments)
                return (
                  <label
                    key={dept}
                    className={[
                      'flex cursor-pointer items-center gap-3 px-4 py-2 text-sm',
                      'transition-colors hover:bg-slate-700/60',
                      checked ? 'text-slate-100' : 'text-slate-300',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(dept)}
                      className="h-4 w-4 shrink-0 rounded accent-purple-500 cursor-pointer"
                      aria-checked={checked}
                    />
                    <span className="truncate">{dept}</span>
                  </label>
                )
              })
            )}
          </div>

          {/* Footer: "All Departments" reset shortcut (visible when something is selected) */}
          {hasActiveSelection && (
            <div className="border-t border-slate-700 px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setIsOpen(false)
                }}
                className="w-full rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-600/50 hover:text-slate-100"
              >
                Show All Departments
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
