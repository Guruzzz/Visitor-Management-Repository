# API Reference

Complete reference for all functions and components in the Visitor Management System.

## Table of Contents

1. [Authentication API](#authentication-api)
2. [Visitors API](#visitors-api)
3. [Validation Schemas](#validation-schemas)
4. [Components](#components)
5. [Utility Functions](#utility-functions)

---

## Authentication API

Located in: `lib/auth.ts`

### signOut()

Sign out the current user.

```typescript
import { signOut } from '@/lib/auth'

await signOut()
// Redirects to /login via AuthProvider
```

**Parameters:** None

**Returns:** `Promise<void>`

**Throws:** Supabase auth error

---

### getCurrentUser()

Get the currently authenticated user.

```typescript
import { getCurrentUser } from '@/lib/auth'

const user = await getCurrentUser()
console.log(user.email)
```

**Parameters:** None

**Returns:** `User | null`

**Throws:** Supabase auth error

---

### getUserProfile(userId)

Get a user's profile from the database.

```typescript
import { getUserProfile } from '@/lib/auth'

const profile = await getUserProfile('user-id-123')
// {
//   id: 'user-id-123',
//   full_name: 'John Doe',
//   email: 'john@example.com',
//   phone: '+1...',
//   role: 'reception',
//   avatar_url: null,
//   created_at: '2024-01-01T00:00:00Z',
//   updated_at: '2024-01-01T00:00:00Z'
// }
```

**Parameters:**
- `userId` (string): User ID from auth

**Returns:** User profile object

**Throws:** Supabase query error

---

### createUserProfile(userId, profileData)

Create a new user profile.

```typescript
import { createUserProfile } from '@/lib/auth'

const profile = await createUserProfile('user-id-123', {
  full_name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  role: 'reception' // 'admin', 'reception', or 'security'
})
```

**Parameters:**
- `userId` (string): User ID from auth
- `profileData` (object):
  - `full_name` (string): User's full name
  - `email` (string): Email address
  - `phone` (string): Phone number
  - `role?` (string): 'admin' | 'reception' | 'security' (default: 'reception')

**Returns:** Created profile object

**Throws:** Supabase insert error (e.g., duplicate user)

---

## Visitors API

Located in: `lib/visitors.ts`

### createVisitor(visitorData)

Register a new visitor.

```typescript
import { createVisitor } from '@/lib/visitors'

const visitor = await createVisitor({
  full_name: 'Jane Smith',
  phone: '+1 (555) 987-6543',
  national_id: 'PSP123456',
  company: 'Tech Corp'
})

console.log(visitor.visitor_number) // VIS-XXXXXX-XXX
```

**Parameters:** Object with:
- `full_name` (string): Visitor's full name
- `phone` (string): Contact phone number
- `national_id` (string): Passport or ID number
- `company` (string): Company name

**Returns:** Visitor object with auto-generated `visitor_number`

**Throws:** Validation error or database error

---

### getVisitor(visitorId)

Get visitor details by ID.

```typescript
import { getVisitor } from '@/lib/visitors'

const visitor = await getVisitor('visitor-uuid-123')
// {
//   id: 'visitor-uuid-123',
//   visitor_number: 'VIS-123456-789',
//   full_name: 'Jane Smith',
//   phone: '+1...',
//   national_id: 'PSP123456',
//   company: 'Tech Corp',
//   photo_url: null,
//   created_at: '2024-01-01T00:00:00Z',
//   updated_at: '2024-01-01T00:00:00Z'
// }
```

**Parameters:**
- `visitorId` (string): UUID of visitor

**Returns:** Visitor object

**Throws:** Not found or database error

---

### searchVisitors(searchType, query)

Search visitors by different criteria.

```typescript
import { searchVisitors } from '@/lib/visitors'

// Search by name
const visitors = await searchVisitors('name', 'john')

// Search by phone
const visitors = await searchVisitors('phone', '555')

// Search by national ID
const visitors = await searchVisitors('id', 'PSP')

// Search by company
const visitors = await searchVisitors('company', 'tech')

// Search by visitor number
const visitors = await searchVisitors('visitor_id', 'VIS-123')
```

**Parameters:**
- `searchType` (string): 'name' | 'phone' | 'id' | 'company' | 'visitor_id'
- `query` (string): Search term (case-insensitive)

**Returns:** Array of matching Visitor objects (max 50)

**Throws:** Database error

---

### createVisit(visitorId, visitData)

Check-in a visitor and create a visit record.

```typescript
import { createVisit } from '@/lib/visitors'

const visit = await createVisit('visitor-uuid-123', {
  person_being_visited: 'John Manager',
  department: 'Sales',
  purpose: 'Client meeting and product demo'
})

console.log(visit.visit_reference) // VISIT-20240101-120000-1234
console.log(visit.status) // 'checked_in'
```

**Parameters:**
- `visitorId` (string): Visitor UUID
- `visitData` (object):
  - `person_being_visited` (string): Name of person being visited
  - `department` (string): Department name
  - `purpose` (string): Purpose of visit

**Returns:** Visit object with auto-generated `visit_reference`

**Throws:** Validation or database error

---

### getVisit(visitId)

Get visit details with visitor information.

```typescript
import { getVisit } from '@/lib/visitors'

const visit = await getVisit('visit-uuid-123')
// {
//   id: 'visit-uuid-123',
//   visitor_id: 'visitor-uuid-123',
//   visit_reference: 'VISIT-20240101-120000-1234',
//   person_being_visited: 'John Manager',
//   department: 'Sales',
//   purpose: 'Client meeting',
//   check_in_at: '2024-01-01T12:00:00Z',
//   check_out_at: null,
//   duration: null,
//   status: 'checked_in',
//   qr_code_identifier: 'VISIT-20240101-120000-1234',
//   visitors: { /* visitor object */ },
//   created_at: '2024-01-01T12:00:00Z',
//   updated_at: '2024-01-01T12:00:00Z'
// }
```

**Parameters:**
- `visitId` (string): Visit UUID

**Returns:** Visit object with nested visitor data

**Throws:** Not found or database error

---

### getVisitByReference(visitReference)

Get visit by QR code reference (e.g., for scanning).

```typescript
import { getVisitByReference } from '@/lib/visitors'

const visit = await getVisitByReference('VISIT-20240101-120000-1234')
// Same structure as getVisit()
```

**Parameters:**
- `visitReference` (string): Visit reference from QR code

**Returns:** Visit object with nested visitor data

**Throws:** Not found or database error

---

### checkOutVisit(visitId)

Check-out a visitor and calculate duration.

```typescript
import { checkOutVisit } from '@/lib/visitors'

const visit = await checkOutVisit('visit-uuid-123')
// {
//   ...same as getVisit,
//   check_out_at: '2024-01-01T12:30:00Z',
//   duration: 30, // minutes
//   status: 'checked_out'
// }
```

**Parameters:**
- `visitId` (string): Visit UUID

**Returns:** Updated visit object with duration

**Throws:** Not found or database error

**Note:** Duration is calculated automatically as minutes between check-in and check-out

---

### getActiveVisits()

Get all currently checked-in visitors.

```typescript
import { getActiveVisits } from '@/lib/visitors'

const activeVisits = await getActiveVisits()
// Array of visit objects with visitor data
// Sorted by check_in_at (newest first)
```

**Parameters:** None

**Returns:** Array of visit objects (all checked-in)

**Throws:** Database error

---

### getVisitHistory(visitorId)

Get all visits for a specific visitor.

```typescript
import { getVisitHistory } from '@/lib/visitors'

const history = await getVisitHistory('visitor-uuid-123')
// Array of visit objects (newest first, max 50)
```

**Parameters:**
- `visitorId` (string): Visitor UUID

**Returns:** Array of visit objects

**Throws:** Database error

---

### subscribeToActiveVisits(callback)

Real-time subscription to active visits.

```typescript
import { subscribeToActiveVisits } from '@/lib/visitors'
import { useEffect } from 'react'

export function Dashboard() {
  useEffect(() => {
    const subscription = subscribeToActiveVisits((visits) => {
      console.log('Active visits updated:', visits)
      setVisits(visits)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])
}
```

**Parameters:**
- `callback` (function): Called whenever active visits change
  - Parameter: Array of visit objects

**Returns:** Subscription object (call `.unsubscribe()` to stop)

**Note:** Automatically queries for all checked-in visits when changes occur

---

### getDepartments()

Get all departments.

```typescript
import { getDepartments } from '@/lib/visitors'

const departments = await getDepartments()
// [
//   { id: 'uuid-1', name: 'Sales', description: '...', created_at: '...' },
//   { id: 'uuid-2', name: 'Engineering', description: '...', created_at: '...' },
//   ...
// ]
```

**Parameters:** None

**Returns:** Array of department objects

**Throws:** Database error

---

## Validation Schemas

Located in: `lib/validations.ts`

All schemas use Zod for runtime validation.

### visitorRegistrationSchema

Validates visitor registration data.

```typescript
import { visitorRegistrationSchema, type VisitorRegistration } from '@/lib/validations'

const data = {
  full_name: 'John Doe',
  phone: '+1 (555) 000-0000',
  national_id: 'ABC123456',
  company: 'Acme Corp'
}

try {
  const validated = visitorRegistrationSchema.parse(data)
} catch (error) {
  // ZodError with detailed field errors
}
```

**Fields:**
- `full_name` (string): Min 2, Max 100 chars
- `phone` (string): Valid phone format, min 10 digits
- `national_id` (string): Min 5, Max 50 chars
- `company` (string): Min 2, Max 100 chars

**Type:** `VisitorRegistration`

---

### visitRegistrationSchema

Validates visit registration data.

```typescript
import { visitRegistrationSchema, type VisitRegistration } from '@/lib/validations'

const data = {
  person_being_visited: 'Jane Manager',
  department: 'Sales',
  purpose: 'Client meeting and discussion'
}

const validated = visitRegistrationSchema.parse(data)
```

**Fields:**
- `person_being_visited` (string): Min 2, Max 100 chars
- `department` (string): Min 1 char (required)
- `purpose` (string): Min 5, Max 255 chars

**Type:** `VisitRegistration`

---

### searchSchema

Validates search queries.

```typescript
import { searchSchema, type SearchParams } from '@/lib/validations'

const params = {
  query: 'john',
  searchType: 'name'
}

const validated = searchSchema.parse(params)
```

**Fields:**
- `query` (string): Min 1, Max 100 chars
- `searchType` (enum): 'name' | 'phone' | 'id' | 'company' | 'visitor_id'

**Type:** `SearchParams`

---

## Components

Located in: `components/`

### LoginPage

Supabase Auth UI login component.

```typescript
import { LoginPage } from '@/components/LoginPage'

export default function Login() {
  return <LoginPage />
}
```

**Props:** None

**Features:**
- Email authentication
- Auto-redirect to dashboard if logged in
- Theming matched to dark UI
- Responsive design

---

### AuthProvider

Authentication state provider.

```typescript
import { AuthProvider } from '@/components/AuthProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

**Props:**
- `children` (ReactNode): App content

**Features:**
- Listens to auth state changes
- Auto-redirects on sign-in/sign-out
- Subscription cleanup on unmount

---

### Dashboard

Real-time "Who's Inside?" dashboard.

```typescript
import { Dashboard } from '@/components/Dashboard'

export default function DashboardPage() {
  return <Dashboard />
}
```

**Props:** None

**Features:**
- Real-time visitor list via Supabase
- Search by visitor name
- Shows duration, department, purpose
- Check-out button
- Loading state
- Empty state

---

### VisitorRegistrationForm

Register new visitors.

```typescript
import { VisitorRegistrationForm } from '@/components/VisitorRegistrationForm'

export default function RegisterPage() {
  return (
    <VisitorRegistrationForm
      onSuccess={(visitorId) => {
        console.log('Registered visitor:', visitorId)
        // Move to check-in form
      }}
    />
  )
}
```

**Props:**
- `onSuccess` (function): Called on successful registration
  - Parameter: Visitor ID (string)

**Features:**
- Zod validation
- Error display
- Loading state
- Reset form on success

---

### VisitCheckInForm

Check-in a visitor.

```typescript
import { VisitCheckInForm } from '@/components/VisitCheckInForm'

export default function CheckInPage() {
  return (
    <VisitCheckInForm
      visitorId="visitor-uuid-123"
      visitorName="John Doe"
      onSuccess={(visitId) => {
        console.log('Checked in:', visitId)
        // Show QR code
      }}
    />
  )
}
```

**Props:**
- `visitorId` (string): Visitor UUID
- `visitorName` (string): Display name
- `onSuccess` (function): Called on successful check-in
  - Parameter: Visit ID (string)

**Features:**
- Dropdown for departments
- Zod validation
- Error display
- Loading state

---

### QRCodeGenerator

Generate and download QR code visitor pass.

```typescript
import { QRCodeGenerator } from '@/components/QRCodeGenerator'

export default function PassPage() {
  return (
    <QRCodeGenerator
      value="VISIT-20240101-120000-1234"
      title="Digital Visitor Pass"
      visitorName="John Doe"
    />
  )
}
```

**Props:**
- `value` (string): Data to encode in QR
- `title?` (string): Card title (default: "Visit Pass")
- `visitorName?` (string): Displayed below title

**Features:**
- High error correction (Level H)
- Download as PNG button
- 200x200 QR code size
- White background for scanning

---

### QRScanner

Camera-based QR code scanner.

```typescript
import { QRScanner } from '@/components/QRScanner'
import { useState } from 'react'

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(true)

  return (
    <QRScanner
      onScan={(code) => {
        console.log('Scanned:', code)
        setIsScanning(false)
      }}
      onError={(error) => {
        console.error('Camera error:', error)
      }}
      onClose={() => {
        setIsScanning(false)
      }}
    />
  )
}
```

**Props:**
- `onScan` (function, required): Called when QR is scanned
  - Parameter: QR data (string)
- `onError?` (function): Called on camera errors
  - Parameter: Error message (string)
- `onClose` (function, required): Called when scanner closes

**Features:**
- Requests camera permission
- Uses jsQR for scanning
- Shows scanning animation
- Error handling for camera access
- Cancellable

---

## Utility Functions

Located in: `lib/utils.ts`

### generateVisitorNumber()

Generate unique visitor number.

```typescript
import { generateVisitorNumber } from '@/lib/utils'

const number = generateVisitorNumber()
// VIS-123456-789
```

**Returns:** String in format `VIS-XXXXXX-XXX`

**Note:** Uses current timestamp + random number for uniqueness

---

### generateVisitReference()

Generate unique visit reference.

```typescript
import { generateVisitReference } from '@/lib/utils'

const ref = generateVisitReference()
// VISIT-20240101-120000-1234
```

**Returns:** String in format `VISIT-XXXXXXXX-XXXXXX-XXXX`

**Note:** Includes date and time for human-readability

---

### calculateDurationMinutes(checkInAt, checkOutAt)

Calculate minutes between two dates.

```typescript
import { calculateDurationMinutes } from '@/lib/utils'

const checkIn = new Date('2024-01-01T12:00:00')
const checkOut = new Date('2024-01-01T12:30:00')

const minutes = calculateDurationMinutes(checkIn, checkOut)
// 30
```

**Parameters:**
- `checkInAt` (Date): Check-in time
- `checkOutAt` (Date): Check-out time

**Returns:** Duration in minutes (rounded)

---

### formatDuration(minutes)

Format minutes to human-readable string.

```typescript
import { formatDuration } from '@/lib/utils'

formatDuration(30) // "30m"
formatDuration(60) // "1h"
formatDuration(90) // "1h 30m"
```

**Parameters:**
- `minutes` (number): Duration in minutes

**Returns:** Formatted string

---

### sanitizeInput(input)

Sanitize user input to prevent XSS.

```typescript
import { sanitizeInput } from '@/lib/utils'

sanitizeInput('<script>alert("xss")</script>')
// "script>alert(xss)/script"

sanitizeInput('   hello world   ')
// "hello world"
```

**Parameters:**
- `input` (string): Raw user input

**Returns:** Sanitized string

**Features:**
- Removes HTML characters
- Trims whitespace
- Limits to 255 characters

---

### validateEmail(email)

Validate email address format.

```typescript
import { validateEmail } from '@/lib/utils'

validateEmail('user@example.com') // true
validateEmail('invalid') // false
```

**Parameters:**
- `email` (string): Email to validate

**Returns:** Boolean

---

### validatePhoneNumber(phone)

Validate phone number format.

```typescript
import { validatePhoneNumber } from '@/lib/utils'

validatePhoneNumber('+1 (555) 000-0000') // true
validatePhoneNumber('5550000000') // true
validatePhoneNumber('123') // false
```

**Parameters:**
- `phone` (string): Phone to validate

**Returns:** Boolean

---

## Error Handling

All API functions throw errors that should be caught:

```typescript
import { createVisitor } from '@/lib/visitors'

try {
  const visitor = await createVisitor(data)
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message)
  }
}
```

Common errors:
- `PostgrestError`: Database constraint violations
- `AuthError`: Authentication failures
- `TypeError`: Invalid parameters
- `ZodError`: Validation failures

---

## Type Definitions

All types are exported from their respective modules:

```typescript
import type { Visitor, Visit } from '@/lib/visitors'
import type {
  VisitorRegistration,
  VisitRegistration,
  SearchParams
} from '@/lib/validations'
```

---

This API reference covers all public functions and components. For internal implementation details, refer to the source code comments.
