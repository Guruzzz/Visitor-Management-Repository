'use client'

/**
 * ExportButton
 *
 * Dropdown button in the Reports page header that lets the admin download
 * the currently filtered analytics data as CSV or PDF.
 *
 * Renders a single "Export" trigger; clicking it opens a small dropdown with
 * two options. Both exports are handled entirely in the browser.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, FileText, FileSpreadsheet, Loader, ChevronDown } from 'lucide-react'
import { exportCSV, exportPDF } from '@/lib/reportExport'
import type { AnalyticsMetrics, AnalyticsFilters } from '@/lib/analyticsTypes'

interface ExportButtonProps {
  metrics: AnalyticsMetrics
  filters: AnalyticsFilters
  disabled?: boolean
}

export function ExportButton({ metrics, filters, disabled }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, handleClickOutside])

  const handleCSV = useCallback(async () => {
    setOpen(false)
    setExporting('csv')
    try {
      exportCSV(metrics, filters)
    } finally {
      setExporting(null)
    }
  }, [metrics, filters])

  const handlePDF = useCallback(async () => {
    setOpen(false)
    setExporting('pdf')
    try {
      await exportPDF(metrics, filters)
    } finally {
      setExporting(null)
    }
  }, [metrics, filters])

  const isExporting = exporting !== null

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !isExporting && setOpen(prev => !prev)}
        disabled={disabled || isExporting}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          bg-blue-600/20 border border-blue-500/30 text-blue-300
          hover:bg-blue-600/30 hover:border-blue-500/50 hover:text-blue-200
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500/30
          transition-all duration-150"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {isExporting ? (
          <Loader size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        <span>{isExporting ? (exporting === 'pdf' ? 'Building PDF…' : 'Exporting…') : 'Export'}</span>
        {!isExporting && (
          <ChevronDown
            size={13}
            className={`text-blue-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Dropdown */}
      {open && !isExporting && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 rounded-xl
            bg-slate-800 border border-slate-700 shadow-xl
            overflow-hidden animate-scale-in"
          role="menu"
        >
          {/* CSV option */}
          <button
            type="button"
            onClick={handleCSV}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-200
              hover:bg-green-500/10 hover:text-green-300 transition-colors text-left"
          >
            <div className="p-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
              <FileSpreadsheet size={14} className="text-green-400" />
            </div>
            <div>
              <p className="font-medium">Download CSV</p>
              <p className="text-xs text-slate-500">Spreadsheet-friendly</p>
            </div>
          </button>

          <div className="h-px bg-slate-700/60 mx-3" />

          {/* PDF option */}
          <button
            type="button"
            onClick={handlePDF}
            role="menuitem"
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-200
              hover:bg-red-500/10 hover:text-red-300 transition-colors text-left"
          >
            <div className="p-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
              <FileText size={14} className="text-red-400" />
            </div>
            <div>
              <p className="font-medium">Download PDF</p>
              <p className="text-xs text-slate-500">Formatted report</p>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}