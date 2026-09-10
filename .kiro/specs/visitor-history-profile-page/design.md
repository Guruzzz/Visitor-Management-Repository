# Design Document: Visitor History/Profile Page

## Overview

This design implements a comprehensive visitor profile and visit history feature for the Visitor Management System. The implementation emphasizes real-time data updates, responsive design, and seamless integration with the existing Next.js 15 + React 19 + TypeScript + Tailwind CSS stack.

## Architecture

### High-Level Component Structure

```
VisitorProfilePage (page.tsx)
├── ProfileHeader
│   ├── ProfilePhoto
│   ├── VisitorInfoCard
│   └── QuickStats
├── ProfileContent
│   ├── ProfileDetailsSection
│   │   ├── ContactInfo
│   │   └── RegistrationInfo
│   ├── StatisticsSection
│   │   ├── TotalVisitsCard
│   │   ├── CompletedVisitsCard
│   │   ├── ActiveVisitsCard
│   │   └── AverageDurationCard
│   ├── TopDepartmentsSection
│   └── VisitHistorySection
│       ├── HistoryTable / MobileList
│       ├── PaginationControls
│       ├── VisitStatusBadge
│       └── DurationDisplay
└── ErrorBoundary / LoadingState
```

### Data Flow Architecture

```
VisitorProfilePage
  │
  ├─→ useVisitorProfile(visitorId)
  │   ├─→ Fetch visitor data
  │   ├─→ Subscribe to real-time updates
  │   └─→ Aggregate statistics
  │
  ├─→ useVisitHistory(visitorId, page)
  │   ├─→ Fetch paginated visit history
  │   ├─→ Subscribe to new visits
  │   └─→ Calculate durations
  │
  └─→ useRealtimeUpdates(visitorId)
      ├─→ Listen for visit status changes
      ├─→ Update elapsed time counters
      └─→ Refresh statistics
```

## Component Specifications

### 1. VisitorProfilePage (Server Component)

**File:** `app/dashboard/visitors/[visitorId]/page.tsx`

**Responsibility:** Root page component handling routing, error states, and layout orchestration.

**Key Features:**
- Server-side params extraction for `visitorId`
- 404 error handling for non-existent visitors
- Responsive layout management
- Authentication guard (inherited from layout)

**Implementation Pattern:**
```typescript
export default async function VisitorProfilePage({
  params,
}: {
  params: { visitorId: string }
}) {
  // Server-side data validation
  const visitorId = params.visitorId
  if (!isValidUUID(visitorId)) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VisitorProfileClient visitorId={visitorId} />
    </div>
  )
}
```

### 2. VisitorProfileClient (Client Component)

**File:** `components/VisitorProfile/VisitorProfileClient.tsx`

**Responsibility:** Client-side state management, real-time updates, and orchestration.

**Props:**
```typescript
interface VisitorProfileClientProps {
  visitorId: string
}
```

**State Management:**
- `visitor`: Current visitor data
- `visitHistory`: Paginated visit list
- `statistics`: Aggregated stats (totals, averages, top departments)
- `isLoading`: Initial load state
- `error`: Error message
- `currentPage`: Pagination state
- `realtimeUpdates`: Active subscription handlers

**Hooks:**
- `useVisitorProfile(visitorId)`: Fetches and subscribes to visitor data
- `useVisitHistory(visitorId, page)`: Fetches and subscribes to visit history
- `useRealtimeUpdates(visitorId)`: Manages real-time subscription lifecycle

### 3. ProfileHeader Component

**File:** `components/VisitorProfile/ProfileHeader.tsx`

**Responsibility:** Display visitor name, photo, and key stats in header area.

**Features:**
- Profile photo with fallback placeholder
- Visitor name and visitor number
- Quick stat badges (total visits, last visit date)
- Responsive layout (stack on mobile, side-by-side on desktop)

**Styling Pattern:**
```typescript
// Header uses glass morphism with gradient text for name
<div className="glass p-6 md:p-8 rounded-lg border border-slate-700">
  <div className="flex flex-col md:flex-row gap-6">
    {/* Photo + Name */}
    {/* Stats */}
  </div>
</div>
```

### 4. ProfileDetailsSection Component

**File:** `components/VisitorProfile/ProfileDetailsSection.tsx`

**Responsibility:** Display contact information and registration metadata.

**Layout:**
- Contact information (phone, email if available)
- National ID / Passport
- Company name
- Visitor number
- Registration date

**Info Display Pattern:**
Uses icon + label + value layout matching existing Dashboard patterns:
```typescript
<div className="flex items-start gap-3">
  <Icon size={18} className="text-blue-400 mt-1 flex-shrink-0" />
  <div>
    <p className="text-sm text-slate-400">Label</p>
    <p className="text-slate-50 font-medium">Value</p>
  </div>
</div>
```

### 5. StatisticsSection Component

**File:** `components/VisitorProfile/StatisticsSection.tsx`

**Responsibility:** Display aggregated visit statistics in cards.

**Cards:**
1. **Total Visits**: Count of all visits
2. **Completed Visits**: Count of checked-out visits
3. **Active Visits**: Count of in-progress visits (checked_in)
4. **Average Duration**: Average time spent on premise (only if completed visits exist)

**Card Pattern:**
```typescript
<div className="glass-sm p-6 text-center rounded-lg border border-slate-700/50">
  <p className="text-sm text-slate-400 mb-2">Label</p>
  <p className="text-4xl font-bold text-blue-400">{value}</p>
  {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
</div>
```

### 6. TopDepartmentsSection Component

**File:** `components/VisitorProfile/TopDepartmentsSection.tsx`

**Responsibility:** Display top 3 departments visited.

**Features:**
- Show top 3 departments by visit count
- Display count for each department
- Ranked/ordered presentation
- Only displays if completed visits exist

**Implementation:**
Aggregates department data from visit history, calculates frequencies, sorts, and displays top 3.

### 7. VisitHistorySection Component

**File:** `components/VisitorProfile/VisitHistorySection.tsx`

**Responsibility:** Display paginated visit history with filtering and real-time updates.

**Key Features:**
- List all visits sorted by most recent first
- Display per-visit: date, person visited, department, purpose, status, duration
- Pagination (10 visits per page)
- Status badges (checked_in vs checked_out visual distinction)
- Real-time elapsed time updates for active visits
- Mobile-responsive table/list layout

**Real-Time Updates:**
- Active visits show "In progress" with elapsed time
- Elapsed time updates every 60 seconds
- When visit is checked out, status and duration update without page refresh

**Pagination:**
- Load More pattern for simplicity
- "Load More" button fetches next 10 visits
- Disable button when no more visits available

### 8. VisitStatusBadge Component

**File:** `components/VisitorProfile/VisitStatusBadge.tsx`

**Responsibility:** Visual status indicator for individual visits.

**Variants:**
```typescript
type Status = 'checked_in' | 'checked_out'
// checked_in: Green badge with "In Progress" or elapsed time
// checked_out: Slate badge with completed duration
```

### 9. DurationDisplay Component

**File:** `components/VisitorProfile/DurationDisplay.tsx`

**Responsibility:** Format and display visit duration.

**Features:**
- Reuses existing `formatDuration()` utility
- For completed visits: displays as "45m" or "1h 30m"
- For active visits: displays elapsed time, updates every 60 seconds
- Real-time calculation of elapsed time

### 10. LoadingStates Component

**File:** `components/VisitorProfile/LoadingStates.tsx`

**Responsibility:** Skeleton loaders and loading indicators.

**Patterns:**
- Header skeleton (photo + name area)
- Stats cards skeleton
- History table skeleton with multiple rows
- Consistent with existing Dashboard loading patterns

### 11. ErrorStates Component

**File:** `components/VisitorProfile/ErrorStates.tsx`

**Responsibility:** Error message display and recovery actions.

**Scenarios:**
- Visitor not found (404)
- Database error loading profile
- Database error loading history
- Retry button / Back to Visitors link

## Data Models and Types

### TypeScript Interfaces

```typescript
// Extends existing Database types
interface VisitorProfile extends Visitor {
  // Visitor model from database.types.ts
}

interface VisitRecord extends Visit {
  // Visit model from database.types.ts
  elapsed_seconds?: number // Calculated client-side for active visits
}

interface VisitorStatistics {
  total_visits: number
  completed_visits: number
  active_visits: number
  average_duration_minutes: number | null
  top_departments: Array<{
    name: string
    count: number
  }>
}

interface PaginationState {
  page: number
  pageSize: number // Default: 10
  hasMore: boolean
}
```

## State Management Hooks

### useVisitorProfile

**Purpose:** Fetch and subscribe to visitor data with aggregated statistics.

**Behavior:**
```typescript
const {
  visitor,
  statistics,
  isLoading,
  error,
  refetch,
} = useVisitorProfile(visitorId)
```

**Implementation:**
1. Fetch visitor record from `visitors` table
2. Fetch visit history
3. Calculate statistics from visit history
4. Subscribe to visit changes via Supabase real-time
5. Update statistics when visits change
6. Return all data with loading/error states

### useVisitHistory

**Purpose:** Fetch and manage paginated visit history.

**Behavior:**
```typescript
const {
  visits,
  isLoading,
  error,
  hasMore,
  loadMore,
  refetch,
} = useVisitHistory(visitorId, pageSize = 10)
```

**Implementation:**
1. Fetch first page (10 visits) ordered by check_in_at DESC
2. Subscribe to new visits for the visitor
3. When new visit added, prepend to list
4. `loadMore()` fetches next 10 visits and appends
5. Track hasMore state

### useRealtimeUpdates

**Purpose:** Handle real-time elapsed time updates for active visits.

**Behavior:**
```typescript
const { updateElapsedTime } = useRealtimeUpdates()
```

**Implementation:**
1. Set interval to update elapsed times every 60 seconds
2. Calculate elapsed time for each active visit: `(now - check_in_at) / 60000`
3. Update component state
4. Clean up interval on unmount

### useVisitorsAuth

**Purpose:** Access current user authentication and permissions.

**Pattern:** Reuses existing auth context/hook from AuthProvider

## Data Fetching Patterns

### Fetch Visitor Profile

```typescript
// lib/visitors.ts extension
export async function getVisitorProfile(visitorId: string) {
  const visitor = await getVisitor(visitorId)
  const visitHistory = await getVisitHistory(visitorId)
  const statistics = calculateStatistics(visitHistory)
  return { visitor, statistics, visitHistory }
}

function calculateStatistics(visits: Visit[]): VisitorStatistics {
  const total = visits.length
  const completed = visits.filter(v => v.status === 'checked_out').length
  const active = visits.filter(v => v.status === 'checked_in').length
  const avgDuration = completed > 0
    ? visits
        .filter(v => v.status === 'checked_out' && v.duration)
        .reduce((sum, v) => sum + v.duration!, 0) / completed
    : null
  const topDepartments = getTopDepartments(visits, 3)
  
  return {
    total_visits: total,
    completed_visits: completed,
    active_visits: active,
    average_duration_minutes: avgDuration ? Math.round(avgDuration) : null,
    top_departments: topDepartments,
  }
}

function getTopDepartments(visits: Visit[], limit: number) {
  const deptMap = new Map<string, number>()
  visits.forEach(v => {
    deptMap.set(v.department, (deptMap.get(v.department) ?? 0) + 1)
  })
  return Array.from(deptMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
```

### Fetch Paginated History

```typescript
// lib/visitors.ts extension
export async function getVisitHistoryPaginated(
  visitorId: string,
  page: number = 0,
  pageSize: number = 10
) {
  const start = page * pageSize
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('visitor_id', visitorId)
    .order('check_in_at', { ascending: false })
    .range(start, start + pageSize - 1)

  if (error) throw error
  return data as Visit[]
}
```

### Real-Time Subscriptions

```typescript
// lib/visitors.ts extension
export function subscribeToVisitorUpdates(
  visitorId: string,
  callback: (visitor: Visitor) => void
) {
  return supabase
    .channel(`visitor:${visitorId}`)
    .on('postgres_changes' as any, {
      event: 'UPDATE',
      schema: 'public',
      table: 'visitors',
      filter: `id=eq.${visitorId}`,
    }, (payload) => {
      callback(payload.new as Visitor)
    })
    .subscribe()
}

export function subscribeToVisitorVisits(
  visitorId: string,
  callback: (visits: Visit[]) => void
) {
  return supabase
    .channel(`visits:${visitorId}`)
    .on('postgres_changes' as any, {
      event: '*',
      schema: 'public',
      table: 'visits',
      filter: `visitor_id=eq.${visitorId}`,
    }, async () => {
      // Re-fetch all visits to get updated data
      const { data } = await supabase
        .from('visits')
        .select('*')
        .eq('visitor_id', visitorId)
        .order('check_in_at', { ascending: false })
      if (data) callback(data)
    })
    .subscribe()
}
```

## Styling Approach

### Design System Consistency

All components follow the existing Visitor Management System design language:
- **Color Palette**: Slate/Blue/Purple gradients with glass morphism
- **Typography**: Gradient text for headers, slate grays for body
- **Spacing**: Consistent padding/margins using Tailwind utilities
- **Borders**: Subtle `border-slate-700` dividers
- **Background**: Glass effect with `bg-slate-800/50` base

### Component Styling Patterns

#### Glass Cards
```typescript
className="glass p-6 md:p-8 rounded-lg border border-slate-700"
// glass class adds backdrop-blur and bg-slate-800/50
```

#### Stat Cards (Smaller)
```typescript
className="glass-sm p-6 text-center rounded-lg border border-slate-700/50"
```

#### Headers
```typescript
className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
```

#### Buttons
```typescript
// Primary action
className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg"

// Secondary action
className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-colors"
```

#### Status Badge
```typescript
// Active (checked_in)
className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-200 text-xs font-medium border border-green-500/50"

// Completed (checked_out)
className="inline-flex items-center px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 text-xs font-medium border border-slate-500/50"
```

### Responsive Design

#### Mobile (< 768px)
- Profile information stacked vertically
- Stats cards displayed in 2-column grid
- Visit history shown as collapsible/mobile-friendly list
- Single column layout with full-width cards
- Essential info visible (date, person visited, duration)
- Purpose/department in expandable details

#### Tablet (768px - 1024px)
- Profile info in 2-column layout
- Stats in 2x2 grid
- History table with horizontal scrolling for overflow

#### Desktop (≥ 1024px)
- Profile sidebar or multi-column layout
- Stats in 1x4 or 2x2 grid
- Full visit history table visible
- Top departments section alongside stats

## Real-Time Update Strategy

### Active Visit Elapsed Time

**Update Interval:** 60 seconds (as per Requirement 2.6)

**Implementation:**
1. Set interval in `useRealtimeUpdates` hook
2. Calculate `(now - check_in_at) / 60000` for each active visit
3. Update component state with new elapsed times
4. Component re-renders with updated time

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setVisits(prev => prev.map(visit => {
      if (visit.status === 'checked_in') {
        const elapsed = Math.round(
          (Date.now() - new Date(visit.check_in_at).getTime()) / 60000
        )
        return { ...visit, elapsed_seconds: elapsed * 60 }
      }
      return visit
    }))
  }, 60000) // 60 second interval

  return () => clearInterval(interval)
}, [])
```

### Visit Status Changes

**Pattern:** Supabase Postgres Changes subscription

**Flow:**
1. Subscribe to visits table changes for visitor
2. On UPDATE event (status changed to checked_out):
   - Update visit in list with new status, duration
   - Recalculate statistics
   - Show success indicator or refresh animation

### New Visit Creation

**Pattern:** Supabase Postgres Changes subscription

**Flow:**
1. Subscribe to visits table changes
2. On INSERT event (new visit for visitor):
   - Prepend new visit to history
   - Update statistics (increment total, etc.)
   - Show toast notification

## Error Handling and Recovery

### Error Scenarios

1. **Visitor Not Found (404)**
   - Display error message with icon
   - Provide "Return to Visitors" link
   - No retry necessary

2. **Database Error Loading Profile**
   - Display error message
   - Show "Retry" button
   - Log error for debugging

3. **Database Error Loading History**
   - Show partial view with available data
   - Display error in history section
   - Offer "Reload History" button

4. **Subscription Error**
   - Graceful degradation (static view works)
   - Log error silently
   - Attempt to re-establish subscription

### Recovery Actions

```typescript
<button
  onClick={() => refetch()}
  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
>
  Retry
</button>
```

## Accessibility Considerations

- Semantic HTML structure (header, main, section, article)
- ARIA labels for status badges
- Keyboard navigation for all interactive elements
- Sufficient color contrast (≥ 4.5:1 for text)
- Focus indicators on buttons and links
- Descriptive link text ("View Visitor Profile" vs "Click Here")

## Performance Optimization

1. **Pagination**: Load 10 visits per page instead of all
2. **Debounced Updates**: Elapsed time updates every 60s, not every frame
3. **Optimized Re-renders**: Use `React.memo` for stat cards if needed
4. **Lazy Loading**: History table row details loaded on demand
5. **Efficient Subscriptions**: Single subscription per visitor, not per visit

## Integration Points

### With Existing Components

- **AuthProvider**: Access current user and permissions
- **useToast**: Display success/error messages
- **ErrorBoundary**: Catch unexpected errors
- **Navigation**: Link back to Visitors page
- **VisitCheckInForm**: Integrate "Check In" action from profile

### With Existing Utils

- `formatDuration()`: Format visit durations
- `cn()`: Merge Tailwind classes
- `withRetry()`: Retry failed requests
- Database types from `database.types.ts`

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Visitor Profile Completeness

*For any* valid visitor ID and corresponding visitor record, the profile page SHALL display all required visitor information fields (full name, phone, national ID, company, registration date).

**Validates: Requirements 1.1, 1.3**

### Property 2: Visit History Ordering and Completeness

*For any* visitor with visit history, the visit history section SHALL display all visits for that visitor sorted by most recent check-in timestamp first, with complete details for each visit (date, person visited, department, purpose, status, duration).

**Validates: Requirements 2.1, 2.2**

### Property 3: Visit Status Visual Distinction

*For any* visit displayed in history, active visits (checked_in) and completed visits (checked_out) SHALL be visually distinguishable through status badges or color coding, with active visits showing elapsed time and completed visits showing calculated duration.

**Validates: Requirements 2.3, 2.5**

### Property 4: Pagination Functionality

*For any* visitor with more than 10 visits, the history section SHALL implement pagination with a "Load More" button that, when clicked, appends the next 10 visits to the list without requiring page refresh.

**Validates: Requirements 2.4**

### Property 5: Elapsed Time Updates

*For any* active visit (checked_in status) displayed on an open profile page, the elapsed time display SHALL update every 60 seconds to reflect the current duration, calculating elapsed time as (current_time - check_in_at).

**Validates: Requirements 2.6, 5.3**

### Property 6: Real-Time Visit Status Synchronization

*For any* visitor profile page with an active visit, when that visit's status is changed to checked_out in the database, the profile page SHALL reflect the new status and calculated duration without requiring a page refresh.

**Validates: Requirements 5.1**

### Property 7: Real-Time New Visit Addition

*For any* visitor profile page that remains open, when a new visit is created for that visitor in the database, the profile page SHALL add the visit to the history list and update the total visit count without requiring a page refresh.

**Validates: Requirements 5.2**

### Property 8: Aggregated Statistics Accuracy

*For any* visitor with at least one completed visit, the profile page SHALL display accurate aggregate statistics including total visit count, completed visit count, active visit count, and average duration (calculated as total duration / completed visit count, rounded to nearest minute).

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 9: Top Departments Ranking

*For any* visitor with at least one completed visit, the profile page SHALL display the top 3 most frequently visited departments ranked by visit count in descending order.

**Validates: Requirements 4.5**

### Property 10: Access Control Enforcement

*For any* unauthenticated user attempting to access a visitor profile page, the system SHALL redirect them to the login page; for any authenticated user with appropriate database role permissions, the profile page SHALL display the visitor profile without access restrictions.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 11: Page Load Performance

*For any* visitor profile page navigation, the system SHALL display a loading indicator while fetching data and complete the initial profile load and display within 2 seconds for typical database response times.

**Validates: Requirements 7.1, 7.2**

### Property 12: Error State Handling

*For any* invalid visitor ID in the URL, the system SHALL display an error message ("Visitor not found") and provide a navigable link to return to the Visitors page; if a database error occurs during loading, the system SHALL display an error message and provide a "Retry" button or recovery action.

**Validates: Requirements 3.4, 7.4**

### Property 13: Responsive Layout Stack

*For any* mobile device with screen width < 768px, the profile information and history sections SHALL stack vertically with full-width cards and readable font sizes (minimum 14px); for desktop devices with screen width ≥ 1024px, the profile information SHALL display in a multi-column layout with history in a separate section.

**Validates: Requirements 8.1, 8.3**

### Property 14: Mobile Content Prioritization

*For any* visit history displayed on a mobile device (screen width < 768px), the system SHALL prioritize essential information (date, person visited, duration) with visual prominence and collapse or defer non-essential details (purpose) or use horizontal scrolling for detailed columns.

**Validates: Requirements 8.4**

### Property 15: Last Visit Information

*For any* visitor with at least one visit, the profile page SHALL display a "Last Visit" section showing the most recent visit's date and time (check-in timestamp).

**Validates: Requirements 1.5**

## Testing Strategy

### Unit Tests

**Components to Test:**
- `ProfileHeader`: Renders photo, name, badges correctly
- `StatisticsSection`: Calculates and displays stats accurately
- `VisitStatusBadge`: Correct badge variants for visit statuses
- `DurationDisplay`: Formats durations correctly (45m, 1h 30m)
- `ErrorStates`: Shows correct error messages and recovery actions

**Example:**
```typescript
// components/__tests__/ProfileHeader.test.tsx
describe('ProfileHeader', () => {
  it('displays visitor name and photo', () => {
    const visitor = { full_name: 'John Doe', ... }
    render(<ProfileHeader visitor={visitor} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
```

### Property-Based Tests

Property-based tests validate universal properties across many generated inputs (detailed in Correctness Properties section above).

**Example:**
```typescript
// lib/__tests__/visitors.property.test.ts
import { fc } from 'fast-check'

describe('Visit History Properties', () => {
  it('visits are always sorted by check_in time descending', () => {
    fc.assert(
      fc.property(fc.array(visitGenerator), (visits) => {
        const sorted = sortByCheckInTime(visits)
        // Verify sort order property holds
        for (let i = 0; i < sorted.length - 1; i++) {
          expect(new Date(sorted[i].check_in_at) >= new Date(sorted[i + 1].check_in_at)).toBe(true)
        }
      })
    )
  })
})
```

### Integration Tests

**Scenarios to Test:**
1. Navigate to visitor profile by ID
2. View visitor with multiple visits
3. View visitor with no visits
4. Check out an active visit and see real-time update
5. Add new visit while profile page is open
6. Pagination: load more visits
7. Mobile responsive layout
8. Error states and recovery

### E2E Tests

**User Flows:**
1. Staff member searches for visitor → clicks profile link → views full profile and history
2. Staff member views active visits → checks out a visit → sees real-time update without refresh
3. Staff member on mobile device → can view profile and history with appropriate layout
4. Unauthenticated user tries to access profile → redirected to login

## File Structure

```
app/
  dashboard/
    visitors/
      [visitorId]/
        page.tsx                    # Route page component

components/
  VisitorProfile/
    index.ts                        # Export barrel file
    VisitorProfileClient.tsx        # Main client component
    ProfileHeader.tsx               # Header section
    ProfileDetailsSection.tsx       # Contact info display
    StatisticsSection.tsx           # Stats cards
    TopDepartmentsSection.tsx       # Top departments list
    VisitHistorySection.tsx         # History table/list
    VisitStatusBadge.tsx            # Status indicator
    DurationDisplay.tsx             # Duration formatter
    LoadingStates.tsx               # Skeleton loaders
    ErrorStates.tsx                 # Error displays
    __tests__/
      VisitorProfileClient.test.tsx
      ProfileHeader.test.tsx
      ... (component tests)

lib/
  visitors.ts                       # Extended with new functions:
                                    # - getVisitorProfile()
                                    # - getVisitHistoryPaginated()
                                    # - subscribeToVisitorUpdates()
                                    # - subscribeToVisitorVisits()
                                    # - calculateStatistics()
                                    # - getTopDepartments()
  hooks/
    useVisitorProfile.ts            # Visitor profile hook
    useVisitHistory.ts              # Visit history hook
    useRealtimeUpdates.ts           # Real-time updates hook
  __tests__/
    visitors.property.test.ts
    visitors.test.ts
```

## Implementation Phases

### Phase 1: Foundation
1. Create page route structure
2. Implement `VisitorProfileClient` with basic state
3. Implement `ProfileHeader` component
4. Implement `ProfileDetailsSection` component

### Phase 2: History and Statistics
1. Implement `VisitHistorySection` with static list
2. Implement `StatisticsSection` with calculations
3. Implement `TopDepartmentsSection`
4. Add pagination with Load More

### Phase 3: Real-Time Updates
1. Implement real-time subscription hooks
2. Add elapsed time updates every 60 seconds
3. Add real-time visit status changes
4. Add new visit notifications

### Phase 4: Polish and Testing
1. Add loading states and skeletons
2. Add error states and recovery
3. Implement responsive design
4. Add comprehensive tests

## Notes for Developers

- All timestamps use ISO 8601 format via `new Date()`
- Duration calculations: `(checkoutTime - checkinTime) / 60000` = minutes
- Real-time updates via Supabase `postgres_changes` channel
- Consistent error handling with existing `withRetry()` pattern
- Use existing `formatDuration()` utility for time display
- Class merging with `cn()` for complex Tailwind combinations
