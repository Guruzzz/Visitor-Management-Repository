/**
 * Analytics Types and Interfaces for the Reports & Analytics Dashboard
 *
 * These types support the six analytics areas:
 *   - Visitor Statistics
 *   - Department Analytics
 *   - Company Analytics
 *   - Duration Analytics
 *   - Time Analytics
 *   - Recent Activity
 *
 * All aggregation is performed in-memory from Visit/Visitor data fetched
 * from Supabase. No analytics queries touch the database after the initial load.
 *
 * Validates: Requirements 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1
 */

import type { Visit, Visitor } from './visitors'

// ---------------------------------------------------------------------------
// Visitor Statistics
// ---------------------------------------------------------------------------

/**
 * Metrics for visitor volume trends over time.
 *
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
export interface VisitorStatsMetrics {
  /** Total count of distinct visitor_id values in the filtered visit set. */
  totalUniqueVisitors: number
  /** Visitor counts aggregated per calendar day (ISO date string, e.g. "2024-03-15"). */
  dailyTrends: Array<{ date: string; count: number }>
  /** Visitor counts aggregated per ISO week (e.g. "2024-W11"). */
  weeklyTrends: Array<{ week: string; count: number }>
  /** Visitor counts aggregated per calendar month (e.g. "2024-03"). */
  monthlyTrends: Array<{ month: string; count: number }>
}

// ---------------------------------------------------------------------------
// Department Analytics
// ---------------------------------------------------------------------------

/**
 * Aggregated visit counts by department, sorted descending by visitCount.
 *
 * Validates: Requirements 3.1, 3.2, 3.3
 */
export interface DepartmentMetrics {
  byDepartment: Array<{
    /** Department name as stored on the visit record. */
    name: string
    /** Total number of visits to this department. */
    visitCount: number
    /** Share of total visits represented as a percentage (0–100). */
    percentage: number
  }>
}

// ---------------------------------------------------------------------------
// Company Analytics
// ---------------------------------------------------------------------------

/**
 * Top 10 companies by visit frequency, sorted descending by visitCount.
 *
 * Validates: Requirements 4.1, 4.2, 4.3
 */
export interface CompanyMetrics {
  topCompanies: Array<{
    /** Company name as stored on the visitor record. */
    name: string
    /** Total number of visits from this company. */
    visitCount: number
    /** Share of total visits represented as a percentage (0–100). */
    percentage: number
  }>
}

// ---------------------------------------------------------------------------
// Duration Analytics
// ---------------------------------------------------------------------------

/**
 * Visit duration statistics and histogram distribution.
 * Only considers visits with status `checked_out` (completed visits).
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */
export interface DurationMetrics {
  /** Mean visit duration in minutes across all completed visits, or null when no data. */
  averageDuration: number | null
  /** The single longest completed visit, or null when no data. */
  longestVisit: {
    duration: number
    visitorName: string
    department: string
  } | null
  /** The single shortest completed visit, or null when no data. */
  shortestVisit: {
    duration: number
    visitorName: string
    department: string
  } | null
  /**
   * Distribution of completed visits bucketed into 15-minute intervals.
   * Bucket labels follow the format "0-15 min", "16-30 min", etc.
   */
  durationDistribution: Array<{
    /** Human-readable bucket label (e.g. "0-15 min", "16-30 min"). */
    bucket: string
    /** Number of completed visits whose duration falls in this bucket. */
    count: number
  }>
}

// ---------------------------------------------------------------------------
// Time Analytics
// ---------------------------------------------------------------------------

/**
 * Check-in distribution by hour of day and day of week.
 *
 * Validates: Requirements 6.1, 6.2, 6.3
 */
export interface TimeMetrics {
  /**
   * Check-in counts for each hour 0–23.
   * Always contains exactly 24 entries (one per hour).
   */
  byHour: Array<{
    /** Hour as a number 0–23. */
    hour: number
    /** Human-readable label (e.g. "00:00", "13:00"). */
    label: string
    /** Number of check-ins during this hour. */
    count: number
  }>
  /** Hour (0–23) with the highest check-in count, or null if no visits. */
  peakHour: number | null
  /**
   * Check-in counts for each day of the week (Monday–Sunday).
   * Always contains exactly 7 entries.
   */
  byDayOfWeek: Array<{
    /** Day name (e.g. "Monday", "Tuesday"). */
    day: string
    /** Number of check-ins on this day of the week. */
    count: number
  }>
  /** Name of the day with the highest check-in count, or null if no visits. */
  peakDay: string | null
}

// ---------------------------------------------------------------------------
// Recent Activity
// ---------------------------------------------------------------------------

/**
 * A single event in the recent activity feed (check-in or check-out).
 *
 * Validates: Requirements 7.1, 7.2
 */
export interface ActivityEvent {
  /** Unique visit ID. */
  id: string
  /** Whether this event represents the initial check-in or the check-out. */
  type: 'check_in' | 'check_out'
  /** Full name of the visitor. */
  visitorName: string
  /** Company of the visitor. */
  visitorCompany: string
  /** Department visited. */
  department: string
  /** ISO timestamp of when the visitor checked in. */
  checkInTime: string
  /** ISO timestamp of when the visitor checked out, or null if still checked in. */
  checkOutTime: string | null
  /**
   * Timestamp used for ordering the feed.
   * For check-in events this equals checkInTime; for check-out events this equals checkOutTime.
   */
  timestamp: string
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

/**
 * Current state of the analytics filter controls.
 *
 * Validates: Requirements 8.1, 9.1, 10.1
 */
export interface AnalyticsFilters {
  /** Inclusive date range applied to visit check_in_at timestamps. */
  dateRange: {
    start: Date
    end: Date
  }
  /**
   * Departments to include in all metrics.
   * `null` means "all departments" (no department filter applied).
   */
  departments: string[] | null
  /**
   * Companies to include in all metrics.
   * `null` means "all companies" (no company filter applied).
   */
  companies: string[] | null
}

// ---------------------------------------------------------------------------
// Real-time Subscription Events
// ---------------------------------------------------------------------------

/**
 * Payload delivered by the Supabase PostgreSQL Change subscription.
 *
 * Validates: Requirements 12.1, 12.2, 12.3
 */
export interface ChangeEvent {
  /** Whether the visit was newly inserted or an existing visit was updated. */
  type: 'INSERT' | 'UPDATE'
  /**
   * The new (or current) state of the visit.
   * May include the joined visitor record when fetched with a select join.
   */
  visit: Visit & { visitors?: Visitor }
  /** The previous state of the visit, present only for UPDATE events. */
  oldVisit?: Visit
}

// ---------------------------------------------------------------------------
// Composite / Derived Types
// ---------------------------------------------------------------------------

/**
 * Aggregated analytics across all six metric categories.
 * Returned by `computeAnalyticsMetrics()` and consumed by the dashboard.
 *
 * Validates: Requirements 2.1, 3.1, 4.1, 5.1, 6.1, 7.1
 */
export interface AnalyticsMetrics {
  visitorStats: VisitorStatsMetrics
  departmentStats: DepartmentMetrics
  companyStats: CompanyMetrics
  durationStats: DurationMetrics
  timeStats: TimeMetrics
  recentActivity: ActivityEvent[]
}

/**
 * A visit record with the related visitor row already joined.
 * Used in analytics queries that require visitor-level data (e.g. company filtering).
 *
 * The `visitors` property is non-optional here because analytics queries
 * always join the visitors table.
 */
export interface VisitWithVisitor extends Visit {
  visitors: Visitor
}
