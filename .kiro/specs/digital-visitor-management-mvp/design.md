# Design: Digital Visitor Management & Premises Monitoring System MVP

## Architecture Overview

The Digital Visitor Management MVP is a full-stack Next.js application built on Supabase for real-time visitor tracking, check-in/check-out workflows, and digital pass management. The system prioritizes real-time collaboration, role-based access control, and mobile-friendly QR code interactions.

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Next.js)                    │
│  ┌──────────────┬──────────────┬──────────────────────────┐  │
│  │ Auth Pages   │ Dashboard    │ Admin/Reports Pages      │  │
│  │ (SSR)        │ (CSR + RLS)  │ (RLS-Protected)          │  │
│  └──────────────┴──────────────┴──────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         Component Layer (React, TypeScript)              │ │
│  │  Registration | CheckIn | QRScanner | Dashboard | Forms  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │     State Management & Validation (RHF + Zod)            │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             ↓ (HTTPS)
┌─────────────────────────────────────────────────────────────┐
│              Supabase Platform (Backend)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Auth (JWT, OAuth, Custom)                              │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database (RLS Policies Enforced)            │  │
│  │  - profiles (users & roles)                            │  │
│  │  - visitors (visitor registry)                         │  │
│  │  - visits (check-in/out records)                       │  │
│  │  - departments (organization structure)                │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Real-time Subscriptions (WebSocket)                    │  │
│  │  - Active visits stream                                │  │
│  │  - Visitor updates                                     │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture & Data Flow

### Layer 1: Page Components (Next.js App Router)

**Layout: `/app/layout.tsx`**
- Root application layout
- Global providers (Tailwind, Supabase client initialization)
- Static navigation structure

**Layout: `/app/dashboard/layout.tsx`**
- Protected dashboard layout (authenticated users only)
- Sidebar/header navigation
- Auth state checking

**Pages:**
- `/ (Home)`: Landing page → redirects to login or dashboard
- `/login`: Supabase Auth UI (built-in login form)
- `/dashboard`: Real-time "Who's Inside?" dashboard
- `/dashboard/visitors`: Visitor management and search interface
- `/dashboard/scanner`: QR code scanning interface
- `/dashboard/reports`: Analytics, visitor statistics, trends

### Layer 2: Core Components (React)

**Authentication Components:**
- `AuthProvider.tsx`: Wraps app with Supabase session management, provides auth context
- `LoginPage.tsx`: Renders Supabase Auth UI, handles redirects

**Visitor Management Components:**
- `VisitorRegistrationForm.tsx`: Form for registering new visitors
  - Inputs: name, phone, national ID, company
  - Validation: Zod schemas + React Hook Form
  - Action: Creates visitor record via `createVisitor()` API

- `VisitCheckInForm.tsx`: Check-in form for existing visitors
  - Inputs: visitor selection, person visited, department, purpose
  - Validation: Required fields, text sanitization
  - Action: Creates visit record with automatic check_in_at timestamp

**QR Code Components:**
- `QRCodeGenerator.tsx`: Displays and downloads QR code passes
  - Input: Visit reference/QR identifier
  - Output: PNG image download
  - Used after successful check-in

- `QRScanner.tsx`: Browser-based camera QR code scanner
  - Uses `jsQR` library for decoding
  - Streams video from device camera
  - Callback on successful scan
  - Error handling for permission/camera issues

**Dashboard Components:**
- `Dashboard.tsx`: Real-time visitor display
  - Real-time subscription to active_visits view
  - Shows: visitor name, department, check-in time, duration
  - Live updates via WebSocket
  - Check-out button integration

### Layer 3: Data & State Management

**State Management Pattern:**
- React Hook Form for form state (VisitorRegistrationForm, VisitCheckInForm)
- Local component state for UI interactions (modals, loading states)
- Supabase real-time subscriptions for live dashboard data
- URL params for router-based state (search queries, filters)

**Validation:**
- Zod schemas for all form inputs (lib/validations.ts)
- Client-side validation before submission
- Supabase RLS policies provide server-side enforcement

### Layer 4: API Integration Layer (lib/supabase/)

**Core API Functions:**

```typescript
// Authentication
getCurrentUser() → User | null
getUserProfile(userId: string) → ProfileRow
signOut() → void

// Visitor Operations
createVisitor(data: VisitorInput) → VisitorRow
getVisitor(visitorId: string) → VisitorRow
searchVisitors(type: 'name' | 'phone' | 'id' | 'company', query: string) → VisitorRow[]

// Visit Operations
createVisit(visitorId: string, data: VisitInput) → VisitRow
checkOutVisit(visitId: string) → VisitRow (with calculated duration)
getActiveVisits() → VisitRow[] (includes visitor data)
getVisitHistory(visitorId: string) → VisitRow[]

// Real-time Subscriptions
subscribeToActiveVisits(callback: (visits: VisitRow[]) => void) → Unsubscribe
subscribeToVisitUpdates(visitId: string, callback: (visit: VisitRow) => void) → Unsubscribe

// Department Operations
getDepartments() → DepartmentRow[]
```

## Data Model & Schema

### Core Tables

**Table: `profiles`**
```sql
- id (UUID, primary key, references auth.users.id)
- full_name (VARCHAR)
- email (VARCHAR, unique)
- phone (VARCHAR)
- role (user_role: 'admin' | 'reception' | 'security')
- avatar_url (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Table: `visitors`**
```sql
- id (UUID, primary key)
- visitor_number (VARCHAR, unique)  -- auto-generated: VIS-YYYYMMDD-XXXXX
- full_name (VARCHAR)
- phone (VARCHAR)
- national_id (VARCHAR)
- company (VARCHAR)
- photo_url (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Table: `visits`**
```sql
- id (UUID, primary key)
- visitor_id (UUID, foreign key → visitors.id)
- visit_reference (VARCHAR, unique)  -- auto-generated: VISIT-XXXXX
- qr_code_identifier (VARCHAR, unique)  -- reference for QR scanning
- person_being_visited (VARCHAR)
- department (VARCHAR or FK to departments.id)
- purpose (TEXT)
- check_in_at (TIMESTAMP)
- check_out_at (TIMESTAMP, nullable)
- duration (INTEGER, nullable)  -- duration in minutes, calculated on checkout
- status (visit_status: 'checked_in' | 'checked_out')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**Table: `departments`**
```sql
- id (UUID, primary key)
- name (VARCHAR, unique)
- description (TEXT, nullable)
- created_at (TIMESTAMP)
```

### Database Views & Queries

**View: `active_visits`** (Used for real-time dashboard)
```sql
SELECT 
  v.id,
  v.visit_reference,
  vi.full_name AS visitor_name,
  vi.company,
  v.department,
  v.person_being_visited,
  v.check_in_at,
  v.purpose,
  EXTRACT(MINUTE FROM NOW() - v.check_in_at) AS duration_minutes
FROM visits v
JOIN visitors vi ON v.visitor_id = vi.id
WHERE v.status = 'checked_in'
ORDER BY v.check_in_at DESC
```

**Indexes:**
- `visits.visitor_id` (foreign key)
- `visits.status` (filtering for active visits)
- `visits.check_in_at` (ordering and time-range queries)
- `visitors.visitor_number` (search/lookup)
- `visitors.phone` (search/lookup)

## Authentication & Authorization

### Authentication Flow

```
┌──────────────┐
│  User Lands  │
│  on App      │
└──────┬───────┘
       ↓
┌──────────────────────┐
│ Check Session Token  │
│ (Supabase JWT)       │
└──────┬───────────────┘
       ↓
┌─────────────────┐
│  Valid Token?   │
└────┬────────┬───┘
     │ YES    │ NO
     ↓        ↓
┌─────────┐  ┌──────────────┐
│Dashboard│  │ Redirect to  │
│   Page  │  │ /login       │
└─────────┘  │              │
             │ Show Supabase│
             │ Auth UI      │
             └──────┬───────┘
                    ↓
           ┌─────────────────┐
           │ User Signs In   │
           │ (Email/Password,│
           │  OAuth, etc.)   │
           └────────┬────────┘
                    ↓
           ┌─────────────────┐
           │ JWT Created     │
           │ & Stored in     │
           │ Local Storage   │
           └────────┬────────┘
                    ↓
           ┌─────────────────┐
           │ Create/Update   │
           │ Profile Record  │
           └────────┬────────┘
                    ↓
           ┌─────────────────┐
           │ Redirect to     │
           │ Dashboard       │
           └─────────────────┘
```

### Role-Based Access Control (RBAC)

**Roles:**
- `admin`: Full system access, user management, reports, all operations
- `reception`: Can register visitors, check-in/out, view dashboard
- `security`: Can view dashboard, check-in/out, scan QR codes
- `user`: Default role (read-only, no operations)

**Authorization Matrix:**

| Operation | Admin | Reception | Security | User |
|-----------|-------|-----------|----------|------|
| View Dashboard | ✓ | ✓ | ✓ | ✗ |
| Register Visitor | ✓ | ✓ | ✗ | ✗ |
| Check-in Visitor | ✓ | ✓ | ✓ | ✗ |
| Check-out Visitor | ✓ | ✓ | ✓ | ✗ |
| Scan QR Code | ✓ | ✓ | ✓ | ✗ |
| Search Visitors | ✓ | ✓ | ✓ | ✓ |
| View Reports | ✓ | ✗ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ |

### Supabase Row Level Security (RLS) Policies

**Table: `profiles`**
```sql
-- SELECT: Users can view their own profile, admins can view all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.jwt() ->> 'user_role' = 'admin');

-- UPDATE: Users can update their own profile, admins can update all
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Table: `visitors`**
```sql
-- SELECT: All authenticated users
CREATE POLICY "Authenticated users can view visitors"
  ON visitors FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Only reception, security, admin
CREATE POLICY "Reception can register visitors"
  ON visitors FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'user_role' IN ('reception', 'security', 'admin')
  );

-- UPDATE: Only admins
CREATE POLICY "Only admins can update visitors"
  ON visitors FOR UPDATE
  USING (auth.jwt() ->> 'user_role' = 'admin');
```

**Table: `visits`**
```sql
-- SELECT: All authenticated users
CREATE POLICY "Authenticated users can view visits"
  ON visits FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Reception, security, admin
CREATE POLICY "Authorized users can create visits"
  ON visits FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'user_role' IN ('reception', 'security', 'admin')
  );

-- UPDATE: Only admins or record creator
CREATE POLICY "Users can update own visits"
  ON visits FOR UPDATE
  USING (auth.uid() IN (
    SELECT created_by FROM visits WHERE id = visits.id
  ) OR auth.jwt() ->> 'user_role' = 'admin');
```

## Real-Time Subscription Patterns

### Real-Time Dashboard Pattern

The dashboard uses Supabase real-time subscriptions for live updates:

```typescript
// lib/supabase/subscriptions.ts
export function subscribeToActiveVisits(
  callback: (visits: ActiveVisit[]) => void
): () => void {
  const channel = supabase
    .channel('active_visits')
    .on(
      'postgres_changes',
      {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'visits',
        filter: 'status=eq.checked_in'  // Only active visits
      },
      (payload) => {
        // Refetch all active visits on any change
        fetchActiveVisits().then(callback);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => supabase.removeChannel(channel);
}

// components/Dashboard.tsx
useEffect(() => {
  const unsubscribe = subscribeToActiveVisits((visits) => {
    setActiveVisits(visits);
  });
  return unsubscribe;
}, []);
```

### Key Patterns

1. **Event-Driven Updates**: Changes trigger callbacks that refetch aggregated data
2. **Optimistic UI**: Local state updates immediately, then syncs with server
3. **Connection Resilience**: Automatic reconnection on WebSocket failure
4. **Cleanup**: Unsubscribe on component unmount to prevent memory leaks

## Error Handling & State Management

### Error Boundaries

```typescript
// Error scenarios
1. Network failures → Retry with exponential backoff
2. Auth token expiration → Refresh token, retry request
3. Validation failures → Display form errors with ZodError
4. RLS policy violations → Redirect to login or show permission error
5. Database conflicts → Show user-friendly error message
```

### State Management Patterns

```typescript
// Form State (React Hook Form)
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(visitorSchema),
  mode: 'onChange'  // Real-time validation
});

// Async State (Loading, Success, Error)
const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [error, setError] = useState<string | null>(null);

// Real-time State
const [activeVisits, setActiveVisits] = useState<ActiveVisit[]>([]);
```

### Error Recovery Flow

```
Request Fails
    ↓
Is it a network error?
  ├─ YES → Retry with backoff (max 3 attempts)
  └─ NO → Continue
         ↓
      Is it a 401 (auth)?
        ├─ YES → Refresh token, retry
        └─ NO → Continue
               ↓
            Is it a validation error?
              ├─ YES → Show form errors
              └─ NO → Show generic error message
                     User can retry or contact support
```

## Page Structure & Routing

### Route Map

```
/                           → Home (redirects to /dashboard or /login)
├─ /login                  → Supabase Auth UI (public)
└─ /dashboard              → Protected route (authenticated)
   ├─ (default)            → Dashboard (real-time active visitors)
   ├─ /visitors            → Visitor management, registration, search
   ├─ /scanner             → QR code scanning
   └─ /reports             → Analytics and reports (admin only)
```

### Page Responsibilities

**`/login`**
- Display Supabase Auth UI
- Handle signup/signin
- Redirect to dashboard on success

**`/dashboard` (home)**
- Display "Who's Inside?" real-time list
- Show visitor details: name, company, department, check-in time
- Check-out button for each visitor
- Real-time subscription updates
- Live duration calculation

**`/dashboard/visitors`**
- Visitor registration form
- Visitor search interface
- Search by: name, phone, national ID, company
- Visitor history view
- Visitor detail view
- Check-in form modal/drawer

**`/dashboard/scanner`**
- QR code scanner (camera access)
- Scan visitor pass → Auto check-out
- Handle invalid/expired QR codes
- Show scanned visitor details

**`/dashboard/reports`**
- Visitor statistics (total, today, this week)
- Top companies by visits
- Top departments
- Check-in/out times chart
- Trend analysis (admin only)

## QR Code Workflow

### QR Generation & Scanning Flow

```
User Check-in
    ↓
Visit Record Created
    ↓
QR Code Generated
├─ Encoded data: {
│    visitorId,
│    visitReference,
│    qrCodeIdentifier,
│    timestamp
│  }
├─ Format: PNG image
└─ Download/Print
    ↓
Reception/Security Scans
    ↓
jsQR Decodes → Extract qrCodeIdentifier
    ↓
Lookup visit by qrCodeIdentifier
    ↓
Display Visitor Info
    ↓
Confirm Check-out
    ↓
Update visit record:
├─ check_out_at = NOW()
├─ duration = check_out_at - check_in_at (minutes)
└─ status = 'checked_out'
```

### QR Code Data Structure

```json
{
  "visitorId": "uuid-string",
  "visitReference": "VISIT-12345",
  "qrCodeIdentifier": "QR-XXXXXX-XXXXX",
  "checkInTime": "2024-01-15T10:30:00Z",
  "validUntil": "2024-01-15T23:59:59Z"
}
```

## Performance Optimization

### Caching Strategy

1. **Static Content**: Homepage → ISR (Incremental Static Regeneration)
2. **Auth Pages**: Dynamic rendering (user-specific)
3. **Dashboard**: CSR with real-time subscriptions
4. **Search Results**: Client-side caching with SWR/React Query (if added)

### Database Optimization

1. **Indexes**: On `visits.status`, `visits.check_in_at`, `visitors.phone`, `visitors.visitor_number`
2. **Pagination**: Visitor search results paginated (25 per page)
3. **Denormalization**: `active_visits` view with aggregated data for dashboard
4. **Connection Pooling**: Supabase PgBouncer

### Bundle Size Optimization

1. **Code Splitting**: Dynamic imports for scanner, reports
2. **Tree Shaking**: ES modules with Tailwind CSS
3. **Minimal Dependencies**: qrcode.react, jsQR, Zod, RHF
4. **Image Optimization**: Next.js Image (if user photos added)

## Security Implementation Details

### Input Validation & Sanitization

```typescript
// Zod schemas provide structured validation
const visitorSchema = z.object({
  full_name: z.string().min(1).max(100).trim(),
  phone: z.string().regex(/^\+?[0-9]{10,}$/),
  national_id: z.string().min(5).max(50),
  company: z.string().min(1).max(100),
});

// HTML sanitization for text inputs
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')  // Remove HTML tags
    .trim()
    .substring(0, 255);  // Max length
}
```

### JWT & Token Management

- Supabase automatically manages JWT tokens
- Tokens stored in `SupabaseClient` (not manual local storage)
- Refresh tokens handled by Supabase client
- Token expiration: 1 hour (configurable)

### HTTPS & Transport Security

- All requests over HTTPS
- CSP headers configured in Next.js middleware (if needed)
- Cookie-based session storage (Supabase)

### Database Security

- RLS policies enforce row-level access control
- No direct SQL from client code
- Parameterized queries via Supabase client
- Service role key never exposed in client

## Testing Strategy

### Unit Tests (Vitest)

**Test Categories:**
1. **Validation**: Zod schemas for all inputs
2. **Utility Functions**: String sanitization, date formatting, duration calc
3. **API Layer**: Mock Supabase responses

**Test Examples:**
```typescript
describe('Validations', () => {
  it('should reject empty visitor name', () => {
    const result = visitorSchema.safeParse({ full_name: '' });
    expect(result.success).toBe(false);
  });
});

describe('Utils', () => {
  it('should sanitize HTML in visitor name', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
  });
});
```

### Integration Tests (Future)

1. Auth flow: Login → Create profile → Access dashboard
2. Visitor registration → Check-in → QR generation → Check-out
3. Real-time updates: Check-in → Dashboard updates
4. Search functionality: Query → Filter → Display results
5. RLS enforcement: Unauthorized access denied

### E2E Tests (Future - Playwright/Cypress)

1. Full user workflows
2. QR scanning simulation
3. Real-time collaboration
4. Error scenarios

## Deployment Architecture

### Development Environment

```
Local: npm run dev
├─ Next.js dev server (port 3000)
├─ Hot reload enabled
└─ Connects to Supabase staging project
```

### Production Environment

```
Vercel (Recommended)
├─ Next.js server (serverless functions)
├─ Automatic deployments from git
├─ Environment variables managed
└─ CDN for static assets

Alternative: Docker
├─ Node.js container
├─ Environment variables injected
└─ Scalable with orchestration (K8s)
```

### Environment Variables

```env
# Public (visible in browser)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Private (server-only, if needed in future)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # For admin operations
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Visitor registration creates searchable record

**For any** valid visitor input (name, phone, national ID, company), after successful registration, a query for that visitor by name, phone, ID, or company should return the registered visitor record.

**Validates: Core Features 1 (Visitor registration)**

### Property 2: Check-in creates active visit with timestamp

**For any** valid check-in operation (visitor ID, person being visited, department, purpose), the created visit record should have:
- `status` = `'checked_in'`
- `check_in_at` timestamp set to current time (within 1 second)
- All provided fields preserved exactly as input

**Validates: Core Features 2 (Check-in/Check-out workflow)**

### Property 3: Check-out calculates duration correctly

**For any** checked-in visit, after check-out, the `duration` field should equal the difference between `check_out_at` and `check_in_at` in minutes (within 1 minute tolerance).

**Validates: Core Features 2 (Check-in/Check-out workflow), 3 (Duration calculation)**

### Property 4: Real-time dashboard reflects active visits

**For any** new check-in, the real-time dashboard subscription should receive an update within 2 seconds that includes the new visitor in the active visits list.

**Validates: Core Features 3 (Real-time dashboard)**

### Property 5: QR code encodes visit reference

**For any** created visit, the generated QR code should encode the visit reference (visit_reference or qrCodeIdentifier) such that scanning and decoding the QR code returns the same reference.

**Validates: Core Features 4 (Digital visitor passes), 5 (QR scanning)**

### Property 6: QR scanner retrieves correct visit

**For any** valid QR code scan of an encoded visit reference, scanning and decoding should successfully retrieve the corresponding visit record with all original data intact.

**Validates: Core Features 5 (QR scanning)**

### Property 7: Visitor search returns only matching records

**For any** search query (name, phone, ID, company), the search results should contain only visitors whose corresponding field matches or contains the query string (case-insensitive).

**Validates: Core Features 6 (Visitor search)**

### Property 8: Visitor history preserves all past visits

**For any** visitor with multiple check-in/out cycles, querying visit history should return all previous visits ordered by check-in time descending.

**Validates: Core Features 7 (Visitor history)**

### Property 9: Role-based access enforced for operations

**For any** user with role `'reception'`, attempting to perform an `'admin'-only` operation should be rejected by RLS policies.

**Validates: Core Features 8 (RBAC), 9 (Row Level Security)**

### Property 10: RLS policies prevent unauthorized data access

**For any** row in the `visits` table, a user with role `'user'` should not be able to SELECT, INSERT, or UPDATE that row (policy denial).

**Validates: Core Features 9 (Row Level Security)**

### Property 11: Auth token required for dashboard access

**For any** attempt to access `/dashboard` without a valid authentication token, the request should be redirected to `/login`.

**Validates: Core Features 8 (Authentication and RBAC)**

### Property 12: Duplicate visitor registration prevented

**For any** visitor registered with a given national ID, attempting to register a new visitor with the same national ID should either be rejected or return the existing visitor.

**Validates: Core Features 1 (Visitor registration data integrity)**

### Property 13: Form validation rejects invalid inputs

**For any** form submission (visitor registration or check-in) with invalid data (empty required fields, invalid phone format, etc.), the form should not submit and should display validation errors.

**Validates: Core Features 1, 2 (Input validation)**

### Property 14: Check-out not possible for already checked-out visit

**For any** visit with `status = 'checked_out'`, attempting to check out again should be rejected.

**Validates: Core Features 2 (Check-in/Check-out state machine)**

## Property Reflection

**Redundancy Analysis:**

- Properties 1, 6, 7, 8 all relate to data retrieval and preservation. However, each tests distinct access patterns:
  - Property 1: Registration creates searchable record (write + search)
  - Property 6: QR scan retrieves visit (specific lookup)
  - Property 7: Search filters correctly (query matching)
  - Property 8: History preserves all visits (aggregation)
  - **No consolidation needed** - each validates different behavior

- Properties 9, 10, 11 all relate to authorization, but test different layers:
  - Property 9: Role-based operation checks (business logic)
  - Property 10: RLS policy enforcement (database layer)
  - Property 11: Route protection (application layer)
  - **No consolidation needed** - each validates different access control layer

- Properties 2, 3 form a natural pair (check-in then check-out), but are distinct:
  - Property 2: Check-in creates record with correct fields
  - Property 3: Check-out calculates duration correctly
  - **Could consolidate into**: "Check-in/Check-out round trip preserves data and calculates duration"
  - **Decision**: Keep separate for clarity - each property verifies a distinct transformation

- Properties 4, 5, 6 relate to QR codes:
  - Property 4: Real-time updates on check-in
  - Property 5: QR encodes visit reference
  - Property 6: QR scanned retrieves visit
  - **No consolidation needed** - different stages of QR workflow

**Final Property Count:** 14 properties (no redundancy eliminated - all provide unique validation value)

## Summary

This design formalizes the MVP architecture around:
- **Real-time collaboration** via Supabase subscriptions
- **Role-based access** through RLS policies and RBAC
- **Mobile-friendly QR workflows** for frictionless check-ins
- **Type-safe validation** with Zod and React Hook Form
- **Scalable infrastructure** with Supabase as the backend

The system prioritizes security (auth, RLS, validation), performance (real-time updates, indexed queries), and user experience (QR scanning, live dashboard, intuitive search).
