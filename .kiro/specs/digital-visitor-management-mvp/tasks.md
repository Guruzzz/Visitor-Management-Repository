# Implementation Plan: Digital Visitor Management & Premises Monitoring System MVP

## Overview

This task plan converts the design architecture and 14 correctness properties into discrete implementation steps. The codebase has foundational scaffolding (components, validation schemas, API functions, database schema) that needs completion and integration. Tasks are organized to build from database setup → core APIs → component completion → testing → integration → deployment.

## Tasks

- [ ] 1. Database Setup & RLS Configuration
  - [x] 1.1 Complete RLS policies for all tables
    - Finish partial schema.sql (visitors, visits, departments policies)
    - Verify RLS enforcement for authentication and role-based access
    - Test policy deny scenarios (unauthorized access rejection)
    - _Requirements: Core Features 8 (RBAC), 9 (RLS)_

  - [x] 1.2 Create active_visits database view
    - Implement SQL view for real-time dashboard data
    - Aggregate visitor data with calculated duration
    - Test view returns only checked_in visits
    - _Requirements: Core Features 3 (Real-time dashboard)_

  - [x] 1.3 Initialize seed data (departments & test profile)
    - Create initial departments for testing
    - Add test user profile with admin role
    - Verify seed data in database
    - _Requirements: Core Features setup_

- [ ] 2. Authentication & Authorization Layer
  - [x] 2.1 Implement Supabase Auth integration in AuthProvider
    - Set up Supabase session management
    - Handle auth state changes (sign-in, sign-out, token refresh)
    - Implement route protection middleware
    - _Requirements: Core Features 8 (Authentication)_

  - [ ]* 2.2 Write property test for auth token requirement
    - **Property 11: Auth token required for dashboard access**
    - **Validates: Requirements 8 (Authentication)_

  - [x] 2.3 Create login redirect logic
    - Redirect unauthenticated users to /login
    - Redirect authenticated users to /dashboard
    - Handle token expiration gracefully
    - _Requirements: Core Features 8 (Authentication)_

  - [ ]* 2.4 Write property test for role-based access control
    - **Property 9: Role-based access enforced for operations**
    - **Validates: Requirements 8 (RBAC)_

- [x] 3. Visitor Registration & Management
  - [x] 3.1 Complete VisitorRegistrationForm implementation
    - Wire form submission to createVisitor() API
    - Add success/error states and user feedback
    - Clear form after successful registration
    - _Requirements: Core Features 1 (Visitor registration)_

  - [ ]* 3.2 Write property test for visitor registration
    - **Property 1: Visitor registration creates searchable record**
    - **Validates: Requirements 1 (Visitor registration)_

  - [ ]* 3.3 Write property test for duplicate prevention
    - **Property 12: Duplicate visitor registration prevented**
    - **Validates: Requirements 1 (Data integrity)_

  - [x] 3.4 Implement visitor search interface
    - Create search component with query input
    - Integrate searchVisitors() API with all search types
    - Display results with pagination (25 per page)
    - _Requirements: Core Features 6 (Visitor search)_

  - [ ]* 3.5 Write property test for search accuracy
    - **Property 7: Visitor search returns only matching records**
    - **Validates: Requirements 6 (Visitor search)_

  - [x] 3.6 Create visitor detail view
    - Show full visitor information
    - Display visit history
    - Add quick check-in button from detail view
    - _Requirements: Core Features 7 (Visitor history)_

- [x] 4. Check-in/Check-out Workflow
  - [x] 4.1 Complete VisitCheckInForm implementation
    - Wire form to createVisit() API
    - Auto-populate visitor selection
    - Implement error handling
    - _Requirements: Core Features 2 (Check-in workflow)_

  - [ ]* 4.2 Write property test for check-in creation
    - **Property 2: Check-in creates active visit with timestamp**
    - **Validates: Requirements 2 (Check-in workflow)_

  - [ ]* 4.3 Write property test for form validation
    - **Property 13: Form validation rejects invalid inputs**
    - **Validates: Requirements 2 (Input validation)_

  - [x] 4.4 Implement check-out functionality
    - Wire Dashboard check-out button to checkOutVisit() API
    - Implement confirmation modal before checkout
    - Show success message with duration summary
    - _Requirements: Core Features 2 (Check-out workflow)_

  - [ ]* 4.5 Write property test for check-out duration calculation
    - **Property 3: Check-out calculates duration correctly**
    - **Validates: Requirements 2 (Check-out workflow), 3 (Duration)_

  - [ ]* 4.6 Write property test for check-out state machine
    - **Property 14: Check-out not possible for already checked-out visit**
    - **Validates: Requirements 2 (State management)_

- [ ] 5. Real-time Dashboard Implementation
  - [ ] 5.1 Complete Dashboard component with real-time subscription
    - Initialize Supabase real-time channel on mount
    - Subscribe to visits table changes
    - Refetch and update active visits on change
    - Implement proper cleanup on unmount
    - _Requirements: Core Features 3 (Real-time dashboard)_

  - [ ]* 5.2 Write property test for real-time updates
    - **Property 4: Real-time dashboard reflects active visits**
    - **Validates: Requirements 3 (Real-time updates)_

  - [ ] 5.3 Implement live duration calculation
    - Calculate elapsed time since check-in
    - Update duration display every 30 seconds
    - Format duration (e.g., "2h 15m")
    - _Requirements: Core Features 3 (Dashboard display)_

  - [ ] 5.4 Add dashboard filters and sorting
    - Filter by department, company, or visitor name
    - Sort by check-in time, duration, or name
    - Persist filter preferences
    - _Requirements: Core Features 3 (Dashboard features)_

- [ ] 6. QR Code Generation & Scanning
  - [ ] 6.1 Complete QRCodeGenerator component
    - Generate QR code after successful check-in
    - Display QR code with visit reference
    - Implement download functionality (PNG)
    - Add print-friendly styling
    - _Requirements: Core Features 4 (Digital passes)_

  - [ ]* 6.2 Write property test for QR encoding
    - **Property 5: QR code encodes visit reference**
    - **Validates: Requirements 4 (QR generation)_

  - [ ] 6.3 Complete QRScanner component
    - Request camera permissions
    - Stream video from device camera
    - Decode QR codes using jsQR library
    - Handle scan errors (invalid QR, permission denied)
    - _Requirements: Core Features 5 (QR scanning)_

  - [ ] 6.4 Implement QR scan → auto check-out workflow
    - Parse decoded QR data
    - Look up visit record by qrCodeIdentifier
    - Auto-trigger check-out
    - Show confirmation with visitor details
    - _Requirements: Core Features 5 (QR scanning workflow)_

  - [ ]* 6.5 Write property test for QR scan retrieval
    - **Property 6: QR scanner retrieves correct visit**
    - **Validates: Requirements 5 (QR scanning)_

- [ ] 7. Page Routing & Navigation Structure
  - [x] 7.1 Implement home page with redirect logic
    - Create `/page.tsx` with authentication check
    - Redirect to /dashboard if authenticated
    - Redirect to /login if not authenticated
    - _Requirements: Routing setup_

  - [ ] 7.2 Create dashboard layout with navigation
    - Build `/dashboard/layout.tsx` with sidebar/header
    - Implement navigation links (visitors, scanner, reports)
    - Add user profile dropdown with sign-out
    - _Requirements: Core Features navigation_

  - [ ] 7.3 Implement dashboard home view
    - Wire Dashboard component to `/dashboard/page.tsx`
    - Ensure real-time subscription initializes
    - Add refresh button for manual data sync
    - _Requirements: Core Features 3 (Dashboard)_

  - [ ] 7.4 Create visitors management page
    - Combine VisitorRegistrationForm and search interface
    - Add tab navigation (register vs search)
    - Show visitor details on selection
    - _Requirements: Core Features 1, 6, 7_

  - [ ] 7.5 Implement QR scanner page
    - Wire QRScanner component to `/dashboard/scanner`
    - Add fallback for devices without camera
    - Show scanned visitor details
    - _Requirements: Core Features 5_

  - [x] 7.6 Create reports page (admin only)
    - Aggregate visitor statistics
    - Display charts: visitors per day, top companies, departments
    - Add date range filters
    - _Requirements: Core Features 10 (Reports)_

- [ ] 8. Error Handling & User Feedback
  - [ ] 8.1 Implement comprehensive error boundaries
    - Create error boundary component
    - Catch component render errors
    - Show fallback UI with error details
    - _Requirements: Error handling_

  - [ ] 8.2 Add toast notifications for user feedback
    - Success messages (registration, check-in, check-out)
    - Error messages with recovery suggestions
    - Loading states during async operations
    - _Requirements: UX improvement_

  - [ ] 8.3 Implement retry logic for failed requests
    - Exponential backoff for network errors (max 3 attempts)
    - Refresh token on 401 authentication error
    - User-friendly error messages
    - _Requirements: Error resilience_

  - [x] 8.4 Create validation error display component
    - Show field-level validation errors from Zod
    - Highlight invalid fields in forms
    - Provide helpful error messages
    - _Requirements: Core Features validation feedback_

- [ ] 9. Testing & Property Validation
  - [x] 9.1 Set up Vitest testing infrastructure
    - Configure vitest.config.ts for React/TypeScript
    - Set up test utilities (render, screen, userEvent)
    - Create test helpers for API mocking
    - _Requirements: Testing setup_

  - [x] 9.2 Write unit tests for validation schemas
    - Test visitorRegistrationSchema with valid/invalid inputs
    - Test visitRegistrationSchema edge cases
    - Test searchSchema query validation
    - _Requirements: Input validation_

  - [x] 9.3 Write unit tests for utility functions
    - Test generateVisitorNumber() uniqueness
    - Test generateVisitReference() format
    - Test formatDuration() for various time values
    - Test input sanitization functions
    - _Requirements: Utility correctness_

  - [x] 9.4 Write unit tests for API functions
    - Mock Supabase responses
    - Test createVisitor() with valid data
    - Test searchVisitors() with all search types
    - Test checkOutVisit() duration calculation
    - _Requirements: API correctness_

  - [x]* 9.5 Write property test for RLS policy enforcement
    - **Property 10: RLS policies prevent unauthorized data access**
    - **Validates: Requirements 9 (RLS enforcement)_

  - [x]* 9.6 Write integration test for visitor registration → check-in → check-out flow
    - Test end-to-end workflow
    - Verify data persistence across steps
    - Validate real-time updates
    - _Requirements: Integration testing_

- [ ] 10. Integration & Wiring
  - [ ] 10.1 Wire Supabase client initialization
    - Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
    - Test Supabase connection in development
    - Verify all API functions work end-to-end
    - _Requirements: Backend integration_

  - [x] 10.2 Integrate real-time subscriptions throughout app
    - Dashboard subscribes to active visits
    - Components update on data changes
    - Cleanup subscriptions on unmount
    - _Requirements: Real-time features_

  - [x] 10.3 Test complete user workflows
    - Workflow 1: New visitor registration → check-in → QR generation
    - Workflow 2: QR scan → auto check-out
    - Workflow 3: Visitor search → history view
    - _Requirements: Feature completeness_

- [ ] 11. Polish & Performance Optimization
  - [ ] 11.1 Optimize bundle size
    - Audit dependencies (qrcode.react, jsQR, Zod)
    - Implement code splitting for scanner page
    - Test bundle size with next/bundle-analyzer
    - _Requirements: Performance_

  - [ ] 11.2 Implement caching strategy
    - Cache department list in memory
    - Implement SWR/React Query for visitor search (optional)
    - Cache recent searches locally
    - _Requirements: Performance_

  - [ ] 11.3 Add loading and error states
    - Skeleton screens for data loading
    - Error state fallbacks
    - Retry buttons for failed operations
    - _Requirements: UX polish_

  - [ ] 11.4 Ensure responsive design
    - Test on mobile (iOS Safari, Chrome Android)
    - Test on tablet (iPad)
    - Test on desktop (Chrome, Firefox, Safari)
    - Fix layout issues and touch interactions
    - _Requirements: Responsive design_

  - [ ] 11.5 Implement accessibility improvements
    - Add ARIA labels to interactive elements
    - Ensure keyboard navigation works
    - Test with screen reader (NVDA/JAWS)
    - _Requirements: WCAG compliance_

- [ ] 12. Deployment Preparation
  - [ ] 12.1 Prepare environment variables
    - Document all required environment variables
    - Create .env.local.example with template
    - Verify production Supabase credentials
    - _Requirements: Deployment setup_

  - [ ] 12.2 Configure Next.js for production
    - Run `next build` and verify no errors
    - Test static generation and dynamic routes
    - Configure CSP headers (if needed)
    - _Requirements: Build optimization_

  - [ ] 12.3 Test production build locally
    - Run `next start` and verify all features work
    - Test auth flow in production mode
    - Verify real-time subscriptions connect
    - _Requirements: Production verification_

  - [ ] 12.4 Create deployment documentation
    - Write Vercel deployment instructions
    - Document manual Docker deployment (if needed)
    - Create rollback procedures
    - _Requirements: Deployment guide_

  - [ ] 12.5 Set up monitoring and logging
    - Configure error tracking (Sentry optional)
    - Set up performance monitoring
    - Create runbooks for common issues
    - _Requirements: Production monitoring_

- [ ] 13. Final Verification & Checkpoint
  - [ ] 13.1 Run full test suite
    - Execute `npm test` and verify all tests pass
    - Run property tests for all 14 correctness properties
    - Verify 100% coverage of critical paths
    - _Requirements: Testing completeness_

  - [ ] 13.2 Verify all correctness properties
    - Property 1: Visitor registration creates searchable record ✓
    - Property 2: Check-in creates active visit with timestamp ✓
    - Property 3: Check-out calculates duration correctly ✓
    - Property 4: Real-time dashboard reflects active visits ✓
    - Property 5: QR code encodes visit reference ✓
    - Property 6: QR scanner retrieves correct visit ✓
    - Property 7: Visitor search returns matching records ✓
    - Property 8: Visitor history preserves all visits ✓
    - Property 9: Role-based access enforced ✓
    - Property 10: RLS policies prevent unauthorized access ✓
    - Property 11: Auth token required for dashboard ✓
    - Property 12: Duplicate visitor registration prevented ✓
    - Property 13: Form validation rejects invalid inputs ✓
    - Property 14: Check-out state machine enforced ✓
    - _Requirements: Property validation_

  - [ ] 13.3 Perform security audit
    - Verify no secrets in code or environment files
    - Check RLS policies are enforced for all tables
    - Validate input sanitization for all forms
    - Test XSS protection with malicious inputs
    - _Requirements: Security verification_

  - [ ] 13.4 Check documentation completeness
    - README.md updated with MVP features
    - API_REFERENCE.md reflects all endpoints
    - DEPLOYMENT.md includes Vercel/Docker setup
    - Code comments explain complex logic
    - _Requirements: Documentation_

- [ ] 14. Production Deployment
  - [ ] 14.1 Deploy to production environment
    - Push code to main branch
    - Trigger Vercel deployment
    - Verify all environment variables are set
    - _Requirements: Production deployment_

  - [ ] 14.2 Post-deployment verification
    - Test all features in production
    - Verify real-time updates working
    - Monitor error logs for 24 hours
    - _Requirements: Production monitoring_

  - [ ] 14.3 Create operational runbooks
    - Document common issues and solutions
    - Create troubleshooting guides
    - Set up on-call procedures
    - _Requirements: Operations support_

## Notes

- Tasks marked with `*` are optional testing sub-tasks that can be skipped for faster MVP delivery but are recommended for production-grade quality
- Each task references specific requirements and correctness properties for traceability
- Checkpoint tasks (13.1-13.4) validate all 14 correctness properties are met
- Real-time subscriptions are critical for dashboard functionality—prioritize testing
- QR code workflow (tasks 6.1-6.5) enables frictionless check-out experience
- RLS policies (task 1.1) are foundational security requirement—verify thoroughly
- Consider running authentication tests early (task 2) to unblock other features
- Dashboard real-time updates (task 5) should be tested with multiple concurrent users

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.3"]
    },
    {
      "id": 2,
      "tasks": ["2.2", "2.4", "3.1", "4.1"]
    },
    {
      "id": 3,
      "tasks": ["3.2", "3.3", "3.4", "4.2", "4.3", "4.4"]
    },
    {
      "id": 4,
      "tasks": ["3.5", "3.6", "4.5", "4.6", "5.1"]
    },
    {
      "id": 5,
      "tasks": ["5.2", "5.3", "6.1", "6.3"]
    },
    {
      "id": 6,
      "tasks": ["5.4", "6.2", "6.4"]
    },
    {
      "id": 7,
      "tasks": ["6.5", "7.1", "7.2"]
    },
    {
      "id": 8,
      "tasks": ["7.3", "7.4", "7.5", "7.6", "8.1"]
    },
    {
      "id": 9,
      "tasks": ["8.2", "8.3", "8.4", "9.1"]
    },
    {
      "id": 10,
      "tasks": ["9.2", "9.3", "9.4", "9.5", "9.6"]
    },
    {
      "id": 11,
      "tasks": ["10.1", "10.2", "10.3"]
    },
    {
      "id": 12,
      "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5"]
    },
    {
      "id": 13,
      "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5"]
    },
    {
      "id": 14,
      "tasks": ["13.1", "13.2", "13.3", "13.4"]
    },
    {
      "id": 15,
      "tasks": ["14.1", "14.2", "14.3"]
    }
  ]
}
```
