/**
 * Analytics utility functions for the Reports & Analytics Dashboard.
 *
 * All functions in this module are pure (no side effects, no Supabase calls).
 * They operate entirely on in-memory arrays so that filter changes and
 * real-time updates never issue additional database queries.
 *
 * Validates: Requirements 2.1–2.4, 3.1–3.3, 4.1–4.3, 5.1–5.4,
 *            6.1–6.3, 7.1–7.2, 8.5, 9.4, 10.4, 13.1, 13.2
 */

import {
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  getHours,
  getDay,
  subDays,
} from 'date-fns'
import type {
  AnalyticsMetrics,
  VisitorStatsMetrics,
  DepartmentMetrics,
  CompanyMetrics,
  DurationMetrics,
  TimeMetrics,
  ActivityEvent,
  AnalyticsFilters,
  VisitWithVisitor,
} from './analyticsTypes'

// ---------------------------------------------------------------------------
// Day-of-week helpers
// ---------------------------------------------------------------------------

/** Ordered day names starting from Monday (date-fns getDay returns 0=Sunday). */
const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

/** Map date-fns day index (0=Sunday…6=Saturday) → Monday-first index (0=Monday…6=Sunday). */
function mondayFirstIndex(dateFnsDayIndex: number): number {
  // 0=Sun → 6, 1=Mon → 0, 2=Tue → 1, …
  return (dateFnsDayIndex + 6) % 7
}

// ---------------------------------------------------------------------------
// Duration bucket helpers
// ---------------------------------------------------------------------------

/** 15-minute histogram bucket labels in order, with a catch-all for 120+ min. */
const DURATION_BUCKETS = [
  '0-15 min',
  '16-30 min',
  '31-45 min',
  '46-60 min',
  '61-75 min',
  '76-90 min',
  '91-105 min',
  '106-120 min',
  '120+ min',
] as const

/**
 * Map a duration in minutes to its histogram bucket label.
 *
 * @param minutes - Visit duration in minutes (should be ≥ 0).
 */
function getDurationBucketLabel(minutes: number): string {
  if (minutes <= 15) return '0-15 min'
  if (minutes <= 30) return '16-30 min'
  if (minutes <= 45) return '31-45 min'
  if (minutes <= 60) return '46-60 min'
  if (minutes <= 75) return '61-75 min'
  if (minutes <= 90) return '76-90 min'
  if (minutes <= 105) return '91-105 min'
  if (minutes <= 120) return '106-120 min'
  return '120+ min'
}

// ---------------------------------------------------------------------------
// Filter functions
// ---------------------------------------------------------------------------

/**
 * Filter an array of visits to only those whose `check_in_at` falls within
 * the given inclusive date range.
 *
 * Validates: Requirements 8.5
 */
export function filterVisitsByDateRange(
  visits: VisitWithVisitor[],
  start: Date,
  end: Date
): VisitWithVisitor[] {
  const startMs = startOfDay(start).getTime()
  // Include the whole end day by using the start of the NEXT day – 1 ms,
  // but simpler: compare up to end-of-day by treating end as inclusive.
  const endMs = new Date(end).setHours(23, 59, 59, 999)
  return visits.filter((v) => {
    const t = new Date(v.check_in_at).getTime()
    return t >= startMs && t <= endMs
  })
}

/**
 * Filter an array of visits to only those belonging to one of the given departments.
 * If `departments` is an empty array, all visits are returned unchanged.
 *
 * Validates: Requirements 9.4
 */
export function filterVisitsByDepartments(
  visits: VisitWithVisitor[],
  departments: string[]
): VisitWithVisitor[] {
  if (departments.length === 0) return visits
  const set = new Set(departments)
  return visits.filter((v) => set.has(v.department))
}

/**
 * Filter an array of visits to only those whose visitor belongs to one of the
 * given companies. Company information is read from the joined `visitors` record.
 * If `companies` is an empty array, all visits are returned unchanged.
 *
 * Validates: Requirements 10.4
 */
export function filterVisitsByCompanies(
  visits: VisitWithVisitor[],
  companies: string[]
): VisitWithVisitor[] {
  if (companies.length === 0) return visits
  const set = new Set(companies)
  return visits.filter((v) => v.visitors && set.has(v.visitors.company))
}

/**
 * Apply all analytics filters simultaneously (intersection, not union).
 *
 * - `filters.departments === null` → no department filter applied
 * - `filters.companies === null`   → no company filter applied
 *
 * **Validates: Requirements 2.5, 8.5, 9.4, 10.4, 13.2**
 */
export function filterVisits(
  visits: VisitWithVisitor[],
  filters: AnalyticsFilters
): VisitWithVisitor[] {
  let result = filterVisitsByDateRange(
    visits,
    filters.dateRange.start,
    filters.dateRange.end
  )

  if (filters.departments !== null && filters.departments.length > 0) {
    result = filterVisitsByDepartments(result, filters.departments)
  }

  if (filters.companies !== null && filters.companies.length > 0) {
    result = filterVisitsByCompanies(result, filters.companies)
  }

  return result
}

// ---------------------------------------------------------------------------
// Individual metric calculators (exported for unit testing)
// ---------------------------------------------------------------------------

/**
 * Compute visitor statistics (unique count and time-based trends).
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 */
export function computeVisitorStats(
  visits: VisitWithVisitor[]
): VisitorStatsMetrics {
  // Total unique visitors
  const uniqueVisitorIds = new Set(visits.map((v) => v.visitor_id))
  const totalUniqueVisitors = uniqueVisitorIds.size

  // Daily trends
  const dailyMap = new Map<string, number>()
  const weeklyMap = new Map<string, number>()
  const monthlyMap = new Map<string, number>()

  for (const visit of visits) {
    const date = new Date(visit.check_in_at)

    const dayKey = format(startOfDay(date), 'MMM d')
    dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + 1)

    const weekKey = format(startOfWeek(date, { weekStartsOn: 1 }), 'MMM d')
    weeklyMap.set(weekKey, (weeklyMap.get(weekKey) ?? 0) + 1)

    const monthKey = format(startOfMonth(date), 'MMM yyyy')
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + 1)
  }

  // Sort all trends ascending by their representative date value.
  // We re-derive a sortable key from the label by iterating over the original visits.
  const dailyOrder = buildOrderedTrend(visits, (v) => {
    const d = startOfDay(new Date(v.check_in_at))
    return { label: format(d, 'MMM d'), sortMs: d.getTime() }
  })
  const weeklyOrder = buildOrderedTrend(visits, (v) => {
    const d = startOfWeek(new Date(v.check_in_at), { weekStartsOn: 1 })
    return { label: format(d, 'MMM d'), sortMs: d.getTime() }
  })
  const monthlyOrder = buildOrderedTrend(visits, (v) => {
    const d = startOfMonth(new Date(v.check_in_at))
    return { label: format(d, 'MMM yyyy'), sortMs: d.getTime() }
  })

  const dailyTrends = dailyOrder.map(({ label }) => ({
    date: label,
    count: dailyMap.get(label) ?? 0,
  }))
  const weeklyTrends = weeklyOrder.map(({ label }) => ({
    week: label,
    count: weeklyMap.get(label) ?? 0,
  }))
  const monthlyTrends = monthlyOrder.map(({ label }) => ({
    month: label,
    count: monthlyMap.get(label) ?? 0,
  }))

  return { totalUniqueVisitors, dailyTrends, weeklyTrends, monthlyTrends }
}

/**
 * Helper: build a deduplicated, ascending-sorted list of { label, sortMs } pairs
 * by applying `keyFn` to each visit.
 */
function buildOrderedTrend(
  visits: VisitWithVisitor[],
  keyFn: (v: VisitWithVisitor) => { label: string; sortMs: number }
): Array<{ label: string; sortMs: number }> {
  const seen = new Map<string, number>()
  for (const v of visits) {
    const { label, sortMs } = keyFn(v)
    if (!seen.has(label)) seen.set(label, sortMs)
  }
  return Array.from(seen.entries())
    .map(([label, sortMs]) => ({ label, sortMs }))
    .sort((a, b) => a.sortMs - b.sortMs)
}

/**
 * Compute department analytics (sorted descending by visit count).
 *
 * **Validates: Requirements 3.1, 3.2, 3.3**
 */
export function computeDepartmentStats(
  visits: VisitWithVisitor[]
): DepartmentMetrics {
  const total = visits.length

  const deptMap = new Map<string, number>()
  for (const v of visits) {
    deptMap.set(v.department, (deptMap.get(v.department) ?? 0) + 1)
  }

  const byDepartment = Array.from(deptMap.entries())
    .map(([name, visitCount]) => ({
      name,
      visitCount,
      percentage: total > 0 ? Math.round((visitCount / total) * 100) : 0,
    }))
    .sort((a, b) => b.visitCount - a.visitCount)

  return { byDepartment }
}

/**
 * Compute company analytics — top 10 by visit frequency (sorted descending).
 *
 * **Validates: Requirements 4.1, 4.2, 4.3**
 */
export function computeCompanyStats(
  visits: VisitWithVisitor[]
): CompanyMetrics {
  const total = visits.length

  const companyMap = new Map<string, number>()
  for (const v of visits) {
    const company = v.visitors?.company ?? 'Unknown'
    companyMap.set(company, (companyMap.get(company) ?? 0) + 1)
  }

  const topCompanies = Array.from(companyMap.entries())
    .map(([name, visitCount]) => ({
      name,
      visitCount,
      percentage: total > 0 ? Math.round((visitCount / total) * 100) : 0,
    }))
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 10)

  return { topCompanies }
}

/**
 * Compute duration analytics for completed (checked-out) visits only.
 *
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 */
export function computeDurationStats(
  visits: VisitWithVisitor[]
): DurationMetrics {
  // Only consider completed visits with a numeric duration
  const completed = visits.filter(
    (v) => v.status === 'checked_out' && v.duration != null
  )

  // Initialize histogram buckets to zero
  const bucketCounts = new Map<string, number>()
  for (const label of DURATION_BUCKETS) {
    bucketCounts.set(label, 0)
  }

  if (completed.length === 0) {
    return {
      averageDuration: null,
      longestVisit: null,
      shortestVisit: null,
      durationDistribution: DURATION_BUCKETS.map((bucket) => ({
        bucket,
        count: 0,
      })),
    }
  }

  let totalDuration = 0
  let longest: VisitWithVisitor | null = null
  let shortest: VisitWithVisitor | null = null

  for (const v of completed) {
    const dur = v.duration as number
    totalDuration += dur

    // Update longest
    if (longest === null || dur > (longest.duration as number)) {
      longest = v
    }
    // Update shortest
    if (shortest === null || dur < (shortest.duration as number)) {
      shortest = v
    }

    // Histogram
    const bucketLabel = getDurationBucketLabel(dur)
    bucketCounts.set(bucketLabel, (bucketCounts.get(bucketLabel) ?? 0) + 1)
  }

  const averageDuration = Math.round(totalDuration / completed.length)

  const longestVisit = longest
    ? {
        duration: longest.duration as number,
        visitorName: longest.visitors?.full_name ?? 'Unknown',
        department: longest.department,
      }
    : null

  const shortestVisit = shortest
    ? {
        duration: shortest.duration as number,
        visitorName: shortest.visitors?.full_name ?? 'Unknown',
        department: shortest.department,
      }
    : null

  const durationDistribution = DURATION_BUCKETS.map((bucket) => ({
    bucket,
    count: bucketCounts.get(bucket) ?? 0,
  }))

  return { averageDuration, longestVisit, shortestVisit, durationDistribution }
}

/**
 * Compute time-based analytics (hourly and day-of-week distributions).
 *
 * The returned `byHour` array always contains exactly 24 entries (hours 0–23).
 * The returned `byDayOfWeek` array always contains exactly 7 entries (Mon–Sun).
 *
 * **Validates: Requirements 6.1, 6.2, 6.3**
 */
export function computeTimeStats(visits: VisitWithVisitor[]): TimeMetrics {
  // Initialize hour buckets
  const hourCounts = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${String(i).padStart(2, '0')}:00`,
    count: 0,
  }))

  // Initialize day-of-week buckets (Monday first)
  const dayCounts = DAY_NAMES.map((day) => ({ day, count: 0 }))

  for (const v of visits) {
    const date = new Date(v.check_in_at)
    const hour = getHours(date)
    hourCounts[hour].count += 1

    const dayIdx = mondayFirstIndex(getDay(date))
    dayCounts[dayIdx].count += 1
  }

  // Peak hour
  let peakHour: number | null = null
  let maxHourCount = 0
  for (const { hour, count } of hourCounts) {
    if (count > maxHourCount) {
      maxHourCount = count
      peakHour = hour
    }
  }
  // If no visits, peakHour stays null
  if (maxHourCount === 0) peakHour = null

  // Peak day
  let peakDay: string | null = null
  let maxDayCount = 0
  for (const { day, count } of dayCounts) {
    if (count > maxDayCount) {
      maxDayCount = count
      peakDay = day
    }
  }
  if (maxDayCount === 0) peakDay = null

  return {
    byHour: hourCounts,
    peakHour,
    byDayOfWeek: dayCounts,
    peakDay,
  }
}

/**
 * Build the recent activity feed — up to 20 events sorted by timestamp descending.
 *
 * Each `ActivityEvent` represents either a check-in or a check-out for a visit.
 * The `timestamp` is the check-out time for checked-out visits and the check-in
 * time for still-active visits, so the feed shows events in the order they occurred.
 *
 * **Validates: Requirements 7.1, 7.2**
 */
export function computeRecentActivity(
  visits: VisitWithVisitor[]
): ActivityEvent[] {
  return visits
    .slice() // avoid mutating the original array
    .sort((a, b) => {
      // Sort by the "most recent event" timestamp descending
      const tsA = a.check_out_at ?? a.check_in_at
      const tsB = b.check_out_at ?? b.check_in_at
      return new Date(tsB).getTime() - new Date(tsA).getTime()
    })
    .slice(0, 20)
    .map((v): ActivityEvent => ({
      id: v.id,
      type: v.status === 'checked_in' ? 'check_in' : 'check_out',
      visitorName: v.visitors?.full_name ?? 'Unknown',
      visitorCompany: v.visitors?.company ?? 'Unknown',
      department: v.department,
      checkInTime: v.check_in_at,
      checkOutTime: v.check_out_at ?? null,
      timestamp: v.check_out_at ?? v.check_in_at,
    }))
}

// ---------------------------------------------------------------------------
// Main aggregation function
// ---------------------------------------------------------------------------

/**
 * Compute all analytics metrics from a filtered array of visits.
 *
 * This is the single entry-point used by the dashboard to derive every metric
 * category from the current in-memory visit set. It performs no I/O.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2,
 *              7.1, 13.1, 13.2**
 *
 * @param visits - Array of visits (with visitor data joined) to aggregate.
 *                 Pass the already-filtered subset — this function does not filter.
 * @returns Complete `AnalyticsMetrics` object ready for consumption by dashboard sections.
 */
export function computeAnalyticsMetrics(
  visits: VisitWithVisitor[]
): AnalyticsMetrics {
  return {
    visitorStats: computeVisitorStats(visits),
    departmentStats: computeDepartmentStats(visits),
    companyStats: computeCompanyStats(visits),
    durationStats: computeDurationStats(visits),
    timeStats: computeTimeStats(visits),
    recentActivity: computeRecentActivity(visits),
  }
}

// ---------------------------------------------------------------------------
// Convenience re-export: default 30-day filter factory
// ---------------------------------------------------------------------------

/**
 * Create a default `AnalyticsFilters` object covering the last 30 days.
 *
 * **Validates: Requirements 8.2**
 */
export function createDefaultFilters(): AnalyticsFilters {
  return {
    dateRange: {
      start: subDays(new Date(), 30),
      end: new Date(),
    },
    departments: null,
    companies: null,
  }
}
