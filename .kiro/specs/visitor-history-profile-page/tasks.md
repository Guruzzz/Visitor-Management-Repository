# Implementation Plan: Visitor History/Profile Page

## Overview

Implement a comprehensive visitor profile and visit history feature for the Visitor Management System. The feature provides staff members with complete visitor information, visit records, statistics, and real-time updates. Implementation follows the design architecture with component-based structure, hooks for state management, and Supabase real-time subscriptions.

The implementation approach breaks down into foundation layers (page structure and hooks), visualization components, real-time updates, and responsive design with comprehensive testing.

## Tasks

- [x] 1. Set up page route structure and core data fetching
  - Create `app/dashboard/visitors/[visitorId]/page.tsx` as server component
  - Implement param extraction and 404 handling for invalid visitor IDs
  - Add server-side data validation using UUID check
  - _Requirements: 3.3, 3.4, 7.1_

- [ ] 2. Implement core hooks for state management
  - Create `lib/hooks/useVisitorProfile.ts` hook for fetching and subscribing to visitor data
    - Fetch visitor record and visit history
    - Calculate aggregated statistics (total, completed, active visits)
    - Subscribe to visitor updates via Supabase
    - Return loading, error, and data states
  - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.1 Write property test for useVisitorProfile statistics accuracy
    - **Property 8: Aggregated Statistics Accuracy**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
    - Test that statistics are calculated correctly for visitors with various visit counts
    - Test average duration calculation and rounding
    - Test top departments ranking logic

- [ ] 3. Extend library functions for visit history and pagination
  - Add `getVisitorProfile()` function to `lib/visitors.ts`
    - Fetch visitor and visit history
    - Calculate and return statistics
    - _Requirements: 1.1, 4.1_

  - Add `getVisitHistoryPaginated()` function to `lib/visitors.ts`
    - Fetch paginated visits (10 per page) ordered by most recent first
    - Support offset-based pagination
    - _Requirements: 2.1, 2.4_

  - Add helper function `calculateStatistics()` to `lib/visitors.ts`
    - Calculate total, completed, and active visit counts
    - Calculate average duration for completed visits
    - Extract top 3 departments by frequency
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 3.1 Write unit tests for pagination and statistics functions
    - Test pagination boundary conditions (empty results, partial pages, final page)
    - Test statistics with 0, 1, and multiple visits
    - Test average duration rounding
    - _Requirements: 2.4, 4.1, 4.4_

- [ ] 4. Implement client component and visit history hook
  - Create `components/VisitorProfile/VisitorProfileClient.tsx` client component
    - Accept `visitorId` prop
    - Initialize state for visitor, statistics, visit history, pagination, and real-time subscriptions
    - Render layout with ProfileHeader, ProfileDetailsSection, StatisticsSection, and VisitHistorySection
    - _Requirements: 1.1, 2.1, 4.1_

  - Create `lib/hooks/useVisitHistory.ts` hook
    - Fetch first page of 10 visits
    - Subscribe to new visits for the visitor
    - Implement `loadMore()` function to fetch next page
    - Track `hasMore` state
    - Return visits, loading, error, hasMore, and loadMore function
    - _Requirements: 2.1, 2.4, 5.2_

  - [ ]* 4.1 Write property test for visit history ordering
    - **Property 2: Visit History Ordering and Completeness**
    - **Validates: Requirements 2.1, 2.2**
    - Test that visits are always ordered by most recent check-in first
    - Verify all visits are included and not lost
    - Test that pagination maintains order

- [x] 5. Implement ProfileHeader component
  - Create `components/VisitorProfile/ProfileHeader.tsx` component
    - Display visitor photo with fallback placeholder
    - Show visitor full name and visitor number
    - Display quick stat badges (total visits, last visit date)
    - Implement responsive layout (stack on mobile, side-by-side on desktop)
    - Use glass morphism styling with gradient text
    - _Requirements: 1.1, 1.2, 1.5_

  - Create `components/VisitorProfile/LoadingStates.tsx` component
    - Create header skeleton loader matching ProfileHeader structure
    - Create stats skeleton with multiple card placeholders
    - Create history table skeleton with placeholder rows
    - _Requirements: 7.3_

- [x] 6. Implement ProfileDetailsSection and StatisticsSection components
  - Create `components/VisitorProfile/ProfileDetailsSection.tsx` component
    - Display contact information (phone, national ID, company)
    - Display visitor number and registration date
    - Use icon + label + value layout pattern
    - _Requirements: 1.1, 1.3_

  - Create `components/VisitorProfile/StatisticsSection.tsx` component
    - Display 4 stat cards: total visits, completed visits, active visits, average duration
    - Use conditional rendering for average duration (only show if completed visits exist)
    - Implement glass card styling with centered values
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - Create `components/VisitorProfile/TopDepartmentsSection.tsx` component
    - Display top 3 departments by visit count in ranked order
    - Show visit count for each department
    - Only render if visitor has completed visits
    - _Requirements: 4.5_

- [ ] 7. Implement VisitHistorySection with pagination
  - Create `components/VisitorProfile/VisitHistorySection.tsx` component
    - Render paginated table/list of visits
    - Display per-visit: date (check_in_at), person visited, department, purpose, status, duration
    - Implement "Load More" button for pagination
    - Disable button when no more visits available
    - _Requirements: 2.1, 2.2, 2.4_

  - Create `components/VisitorProfile/VisitStatusBadge.tsx` component
    - Create badge variants for checked_in (green) and checked_out (slate)
    - Show status text and visual distinction
    - _Requirements: 2.3_

  - Create `components/VisitorProfile/DurationDisplay.tsx` component
    - Reuse existing `formatDuration()` utility
    - Format completed visits as "45m" or "1h 30m"
    - Calculate and display elapsed time for active visits
    - _Requirements: 2.5_

  - [ ]* 7.1 Write unit tests for VisitStatusBadge and DurationDisplay
    - Test badge rendering for both active and completed visits
    - Test duration formatting (minutes, hours, combined)
    - Test elapsed time calculation
    - _Requirements: 2.3, 2.5_

- [x] 8. Checkpoint - Verify foundation components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement real-time updates hook
  - Create `lib/hooks/useRealtimeUpdates.ts` hook
    - Set 60-second interval for updating elapsed times
    - Calculate elapsed time as `(now - check_in_at) / 60000` for active visits
    - Update component state with new elapsed times
    - Clean up interval on unmount
    - _Requirements: 2.6, 5.3_

  - Extend `lib/visitors.ts` with real-time subscription functions
    - Add `subscribeToVisitorUpdates()` to listen for visitor data changes
    - Add `subscribeToVisitorVisits()` to listen for visit table changes
    - Handle INSERT (new visit) and UPDATE (status change) events
    - _Requirements: 5.1, 5.2_

  - [ ]* 9.1 Write property test for elapsed time updates
    - **Property 5: Elapsed Time Updates**
    - **Validates: Requirements 2.6, 5.3**
    - Test that elapsed time is calculated correctly for active visits
    - Test that elapsed time updates are triggered every 60 seconds
    - Test with various check-in times

- [ ] 10. Integrate real-time updates into VisitorProfileClient
  - Update `VisitorProfileClient.tsx` to use `useRealtimeUpdates()` hook
    - Subscribe to visitor profile changes
    - Subscribe to visit status changes and new visits
    - Update visit list when new visits arrive
    - Update status and duration when active visit is checked out
    - Re-calculate statistics on changes
    - _Requirements: 5.1, 5.2_

  - [ ]* 10.1 Write property test for real-time synchronization
    - **Property 6: Real-Time Visit Status Synchronization**
    - **Validates: Requirements 5.1**
    - Test that status changes are reflected without page refresh
    - Test that duration is calculated and displayed immediately

  - [ ]* 10.2 Write property test for new visit addition
    - **Property 7: Real-Time New Visit Addition**
    - **Validates: Requirements 5.2**
    - Test that new visits are prepended to history
    - Test that total visit count updates
    - Test that statistics recalculate correctly

- [ ] 11. Implement error handling and recovery
  - Create `components/VisitorProfile/ErrorStates.tsx` component
    - Display error message for visitor not found (404)
    - Display generic error message for database errors
    - Provide "Retry" button and "Return to Visitors" link
    - _Requirements: 3.4, 7.4_

  - Update `VisitorProfileClient.tsx` error handling
    - Catch and display errors from data fetching
    - Provide retry mechanism using `withRetry()` pattern
    - Handle subscription errors gracefully
    - _Requirements: 7.4_

  - [ ]* 11.1 Write unit tests for error states
    - Test 404 error display and recovery
    - Test database error display and retry
    - Test error boundary integration
    - _Requirements: 3.4, 7.4_

- [ ] 12. Implement mobile-responsive layout
  - Update all components with responsive Tailwind classes
    - ProfileHeader: stack vertically on mobile, flex row on desktop
    - StatisticsSection: 2-column grid on mobile, 1x4 grid on desktop
    - VisitHistorySection: essential info visible, collapsible details on mobile
    - Ensure minimum font size 14px on mobile
    - Ensure minimum button size 44px
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - Create mobile-specific list view for visit history (alternative to table)
    - Show date, person visited, duration with full visibility
    - Collapse non-essential fields (purpose)
    - Use horizontal scroll for detailed columns if needed
    - _Requirements: 8.4_

  - [ ]* 12.1 Write unit tests for responsive layout
    - Test that components render correctly at 375px (mobile)
    - Test that components render correctly at 1024px (desktop)
    - Verify readability and touchability on mobile
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 13. Implement authentication and access control
  - Ensure ProfilePage inherits auth guard from dashboard layout
    - Verify unauthenticated users redirected to login
    - _Requirements: 6.1_

  - Update library functions to respect RLS policies
    - Verify Supabase RLS policies prevent unauthorized access
    - _Requirements: 6.3_

  - [ ]* 13.1 Write property test for access control
    - **Property 10: Access Control Enforcement**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Test that unauthenticated users cannot access profile
    - Test that authenticated users can access permitted data

- [ ] 14. Add loading states and performance optimization
  - Update `VisitorProfileClient.tsx` to display loading states
    - Show `LoadingStates` skeleton while fetching initial data
    - Show partial view while loading history
    - _Requirements: 7.1, 7.3_

  - Implement performance optimizations
    - Use `React.memo()` for stat cards to prevent re-renders
    - Optimize subscription lifecycle in hooks
    - Lazy-load history rows if needed
    - _Requirements: 7.2_

  - [ ]* 14.1 Write integration test for load performance
    - **Property 11: Page Load Performance**
    - **Validates: Requirements 7.1, 7.2**
    - Test that profile loads within 2 seconds
    - Test that loading indicators display while fetching

- [ ] 15. Create component index file and finish implementation
  - Create `components/VisitorProfile/index.ts` barrel export
    - Export all components for clean imports
    - _Requirements: All_

  - Wire up all components in `VisitorProfileClient.tsx`
    - Import all sub-components
    - Pass data and callbacks correctly
    - Ensure no orphaned components
    - _Requirements: All_

  - [ ]* 15.1 Write end-to-end integration tests
    - **Property 1: Visitor Profile Completeness**
    - **Validates: Requirements 1.1, 1.3**
    - Test viewing complete visitor profile
    - Test viewing visit history with pagination
    - Test real-time updates during active visit

  - [ ]* 15.2 Write property test for responsive mobile layout
    - **Property 13: Responsive Layout Stack**
    - **Validates: Requirements 8.1, 8.3**
    - Test mobile layout at various widths
    - Test desktop layout at various widths
    - Test that content is readable and navigable

  - [ ]* 15.3 Write property test for mobile content prioritization
    - **Property 14: Mobile Content Prioritization**
    - **Validates: Requirements 8.4**
    - Test that essential info is visible on mobile
    - Test that non-essential details are collapsed or scrollable

  - [ ]* 15.4 Write property test for last visit information
    - **Property 15: Last Visit Information**
    - **Validates: Requirements 1.5**
    - Test that last visit date and time are displayed
    - Test correctness of most recent visit identification

- [~] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All components use the existing glass morphism design system with Tailwind CSS
- Real-time updates use Supabase `postgres_changes` channel pattern (already established in codebase)
- Duration calculations reuse existing `formatDuration()` utility from `lib/utils.ts`
- Error handling follows existing `withRetry()` pattern from `lib/retry.ts`
- Property-based tests use vitest and complement unit tests for edge cases
- Optional test sub-tasks (marked with `*`) can be executed in parallel with implementation
- All timestamps use ISO 8601 format via `new Date()`
- Each task builds on previous tasks with no orphaned code

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2", "3"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4", "5"] },
    { "id": 2, "tasks": ["4.1", "6", "7"] },
    { "id": 3, "tasks": ["7.1", "9", "8"] },
    { "id": 4, "tasks": ["9.1", "10"] },
    { "id": 5, "tasks": ["10.1", "10.2", "11"] },
    { "id": 6, "tasks": ["11.1", "12"] },
    { "id": 7, "tasks": ["12.1", "13"] },
    { "id": 8, "tasks": ["13.1", "14"] },
    { "id": 9, "tasks": ["14.1", "15"] },
    { "id": 10, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 11, "tasks": ["16"] }
  ]
}
```
