/**
 * reportExport.ts
 *
 * Utilities for exporting the analytics dashboard data as CSV or PDF.
 * All logic runs entirely in the browser — no server round-trips.
 *
 * Two export scopes:
 *   - "summary"  : the aggregated metrics (department totals, company totals,
 *                  duration stats, time stats)
 *   - "visits"   : the raw recent-activity feed (up to 20 events visible on screen)
 *
 * PDF uses jsPDF + jspdf-autotable.
 * CSV is built as a plain string and triggered via a Blob URL.
 */

import { format } from 'date-fns'
import type { AnalyticsMetrics, AnalyticsFilters } from './analyticsTypes'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeStr(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v)
}

function formatDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Escape a CSV field (wrap in quotes if it contains comma, quote, or newline). */
function csvField(value: unknown): string {
  const s = safeStr(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

/** Build a CSV string from an array of header labels and rows of values. */
function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines: string[] = [headers.map(csvField).join(',')]
  for (const row of rows) {
    lines.push(row.map(csvField).join(','))
  }
  return lines.join('\r\n')
}

// ---------------------------------------------------------------------------
// Report filename helpers
// ---------------------------------------------------------------------------

function reportFilename(type: 'csv' | 'pdf', section: string, filters: AnalyticsFilters): string {
  const start = formatDate(filters.dateRange.start)
  const end = formatDate(filters.dateRange.end)
  return `vms-${section}-${start}_${end}.${type}`
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

/**
 * Download all analytics data as a single multi-section CSV file.
 */
export function exportCSV(metrics: AnalyticsMetrics, filters: AnalyticsFilters): void {
  const sections: string[] = []
  const dateRange = `${formatDate(filters.dateRange.start)} to ${formatDate(filters.dateRange.end)}`

  // Header block
  sections.push(`Visitor Management System - Analytics Report`)
  sections.push(`Date Range: ${dateRange}`)
  sections.push(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`)
  sections.push('')

  // 1. Visitor Statistics
  sections.push('VISITOR STATISTICS')
  sections.push(buildCsv(
    ['Metric', 'Value'],
    [['Total Unique Visitors', metrics.visitorStats.totalUniqueVisitors]]
  ))
  sections.push('')
  sections.push('Daily Trends')
  sections.push(buildCsv(['Date', 'Visitor Count'], metrics.visitorStats.dailyTrends.map(d => [d.date, d.count])))
  sections.push('')

  // 2. Department Analytics
  sections.push('DEPARTMENT ANALYTICS')
  sections.push(buildCsv(
    ['Department', 'Visit Count', 'Percentage (%)'],
    metrics.departmentStats.byDepartment.map(d => [d.name, d.visitCount, d.percentage])
  ))
  sections.push('')

  // 3. Company Analytics
  sections.push('COMPANY ANALYTICS (Top 10)')
  sections.push(buildCsv(
    ['Company', 'Visit Count', 'Percentage (%)'],
    metrics.companyStats.topCompanies.map(c => [c.name, c.visitCount, c.percentage])
  ))
  sections.push('')

  // 4. Duration Analytics
  sections.push('DURATION ANALYTICS')
  sections.push(buildCsv(
    ['Metric', 'Value'],
    [
      ['Average Duration (min)', metrics.durationStats.averageDuration ?? 'N/A'],
      ['Longest Visit (min)', metrics.durationStats.longestVisit?.duration ?? 'N/A'],
      ['Longest Visit - Visitor', metrics.durationStats.longestVisit?.visitorName ?? 'N/A'],
      ['Longest Visit - Department', metrics.durationStats.longestVisit?.department ?? 'N/A'],
      ['Shortest Visit (min)', metrics.durationStats.shortestVisit?.duration ?? 'N/A'],
      ['Shortest Visit - Visitor', metrics.durationStats.shortestVisit?.visitorName ?? 'N/A'],
      ['Shortest Visit - Department', metrics.durationStats.shortestVisit?.department ?? 'N/A'],
    ]
  ))
  sections.push('')
  sections.push('Duration Distribution')
  sections.push(buildCsv(
    ['Duration Bucket', 'Visit Count'],
    metrics.durationStats.durationDistribution.map(b => [b.bucket, b.count])
  ))
  sections.push('')

  // 5. Time Analytics
  sections.push('TIME ANALYTICS - By Hour')
  sections.push(buildCsv(
    ['Hour', 'Check-in Count'],
    metrics.timeStats.byHour.map(h => [h.label, h.count])
  ))
  sections.push('')
  sections.push('TIME ANALYTICS - By Day of Week')
  sections.push(buildCsv(
    ['Day', 'Check-in Count'],
    metrics.timeStats.byDayOfWeek.map(d => [d.day, d.count])
  ))
  sections.push('')

  // 6. Recent Activity
  sections.push('RECENT ACTIVITY (Last 20 Events)')
  sections.push(buildCsv(
    ['Type', 'Visitor Name', 'Company', 'Department', 'Check-in Time', 'Check-out Time'],
    metrics.recentActivity.map(a => [
      a.type === 'check_in' ? 'Check-in' : 'Check-out',
      a.visitorName,
      a.visitorCompany,
      a.department,
      a.checkInTime,
      a.checkOutTime ?? '',
    ])
  ))

  const csv = sections.join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, reportFilename('csv', 'analytics', filters))
}

// ---------------------------------------------------------------------------
// PDF export
// ---------------------------------------------------------------------------

/**
 * Download all analytics data as a formatted PDF report.
 * Uses jsPDF + jspdf-autotable loaded dynamically to keep initial bundle small.
 */
export async function exportPDF(metrics: AnalyticsMetrics, filters: AnalyticsFilters): Promise<void> {
  // Dynamic import keeps jsPDF out of the initial JS bundle
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const dateRange = `${formatDate(filters.dateRange.start)} to ${formatDate(filters.dateRange.end)}`
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  let y = 20

  // ── Colour palette (matches dark dashboard blues/purples) ──────────────
  const BLUE   = [37, 99, 235]   as [number, number, number]   // blue-600
  const PURPLE = [124, 58, 237]  as [number, number, number]  // purple-600
  const GREEN  = [22, 163, 74]   as [number, number, number]   // green-600
  const AMBER  = [217, 119, 6]   as [number, number, number]   // amber-600
  const CYAN   = [8, 145, 178]   as [number, number, number]   // cyan-600
  const SLATE  = [71, 85, 105]   as [number, number, number]   // slate-600
  const WHITE  = [255, 255, 255] as [number, number, number]

  // ── Cover / header ─────────────────────────────────────────────────────
  doc.setFillColor(...BLUE)
  doc.rect(0, 0, pageW, 36, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Visitor Management System', margin, 14)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Reports & Analytics', margin, 22)
  doc.setFontSize(9)
  doc.text(`Date range: ${dateRange}`, margin, 30)
  doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageW - margin, 30, { align: 'right' })

  y = 46

  // Helper: section heading
  const heading = (label: string, color: [number, number, number] = BLUE) => {
    if (y > 260) { doc.addPage(); y = 20 }
    doc.setFillColor(...color)
    doc.roundedRect(margin, y, pageW - margin * 2, 7, 1, 1, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin + 3, y + 5)
    doc.setTextColor(30, 30, 30)
    doc.setFont('helvetica', 'normal')
    y += 11
  }

  // Helper: key-value pair row
  const kv = (key: string, value: unknown) => {
    if (y > 270) { doc.addPage(); y = 20 }
    doc.setFontSize(9)
    doc.setTextColor(...SLATE)
    doc.text(key, margin + 2, y)
    doc.setTextColor(20, 20, 20)
    doc.text(safeStr(value), margin + 60, y)
    y += 6
  }

  // Helper: autotable wrapper
  const table = (
    head: string[][],
    body: unknown[][],
    headColor: [number, number, number] = BLUE
  ) => {
    autoTable(doc, {
      startY: y,
      head,
      body: body.map(row => row.map(safeStr)),
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: headColor, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: () => { y = (doc as any).lastAutoTable.finalY + 6 },
    })
    y = (doc as any).lastAutoTable.finalY + 8
  }

  // ── 1. Visitor Statistics ──────────────────────────────────────────────
  heading('1. Visitor Statistics', BLUE)
  kv('Total Unique Visitors', metrics.visitorStats.totalUniqueVisitors)
  y += 2
  if (metrics.visitorStats.dailyTrends.length > 0) {
    table(
      [['Date', 'Visitor Count']],
      metrics.visitorStats.dailyTrends.map(d => [d.date, d.count]),
      BLUE
    )
  }

  // ── 2. Department Analytics ────────────────────────────────────────────
  heading('2. Department Analytics', PURPLE)
  if (metrics.departmentStats.byDepartment.length === 0) {
    doc.setFontSize(8); doc.setTextColor(...SLATE)
    doc.text('No department data for the selected filters.', margin + 2, y); y += 8
  } else {
    table(
      [['Department', 'Visit Count', 'Share (%)']],
      metrics.departmentStats.byDepartment.map(d => [d.name, d.visitCount, d.percentage + '%']),
      PURPLE
    )
  }

  // ── 3. Company Analytics ───────────────────────────────────────────────
  heading('3. Company Analytics (Top 10)', GREEN)
  if (metrics.companyStats.topCompanies.length < 2) {
    doc.setFontSize(8); doc.setTextColor(...SLATE)
    doc.text('Insufficient company data for the selected filters.', margin + 2, y); y += 8
  } else {
    table(
      [['Company', 'Visit Count', 'Share (%)']],
      metrics.companyStats.topCompanies.map(c => [c.name, c.visitCount, c.percentage + '%']),
      GREEN
    )
  }

  // ── 4. Duration Analytics ─────────────────────────────────────────────
  heading('4. Duration Analytics', AMBER)
  kv('Average Duration', metrics.durationStats.averageDuration !== null ? `${metrics.durationStats.averageDuration} min` : 'N/A')
  kv('Longest Visit', metrics.durationStats.longestVisit ? `${metrics.durationStats.longestVisit.duration} min — ${metrics.durationStats.longestVisit.visitorName} (${metrics.durationStats.longestVisit.department})` : 'N/A')
  kv('Shortest Visit', metrics.durationStats.shortestVisit ? `${metrics.durationStats.shortestVisit.duration} min — ${metrics.durationStats.shortestVisit.visitorName} (${metrics.durationStats.shortestVisit.department})` : 'N/A')
  y += 2
  table(
    [['Duration Bucket', 'Visit Count']],
    metrics.durationStats.durationDistribution.map(b => [b.bucket, b.count]),
    AMBER
  )

  // ── 5. Time Analytics ─────────────────────────────────────────────────
  heading('5. Time Analytics', CYAN)
  if (metrics.timeStats.peakHour !== null)
    kv('Peak Hour', `${String(metrics.timeStats.peakHour).padStart(2,'0')}:00`)
  if (metrics.timeStats.peakDay)
    kv('Peak Day', metrics.timeStats.peakDay)
  y += 2
  table(
    [['Hour', 'Check-ins']],
    metrics.timeStats.byHour.map(h => [h.label, h.count]),
    CYAN
  )
  table(
    [['Day of Week', 'Check-ins']],
    metrics.timeStats.byDayOfWeek.map(d => [d.day, d.count]),
    CYAN
  )

  // ── 6. Recent Activity ────────────────────────────────────────────────
  heading('6. Recent Activity (Last 20 Events)', SLATE)
  if (metrics.recentActivity.length === 0) {
    doc.setFontSize(8); doc.setTextColor(...SLATE)
    doc.text('No recent activity for the selected filters.', margin + 2, y); y += 8
  } else {
    table(
      [['Type', 'Visitor', 'Company', 'Department', 'Check-in', 'Check-out']],
      metrics.recentActivity.map(a => [
        a.type === 'check_in' ? 'In' : 'Out',
        a.visitorName,
        a.visitorCompany,
        a.department,
        a.checkInTime ? format(new Date(a.checkInTime), 'yyyy-MM-dd HH:mm') : '',
        a.checkOutTime ? format(new Date(a.checkOutTime), 'yyyy-MM-dd HH:mm') : 'Active',
      ]),
      SLATE
    )
  }

  doc.save(reportFilename('pdf', 'analytics', filters))
}