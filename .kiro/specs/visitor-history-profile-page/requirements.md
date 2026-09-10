# Requirements Document: Visitor History/Profile Page

## Introduction

This feature adds comprehensive visitor profile and visit history pages to the Visitor Management System. Staff members will access complete visitor information, including contact details, visit records, time spent on premises, and department interaction patterns. The feature provides historical context for visit decisions and enables administrators to maintain visitor data quality.

## Glossary

- **Visitor**: A person registered in the system with unique identification (name, phone, national ID, company)
- **Visit**: A specific instance of a visitor checking in and (optionally) checking out
- **Visit History**: A chronological list of all visits for a given visitor
- **Visitor Profile**: Static visitor information (name, phone, ID, company) combined with aggregate visit statistics
- **Active Visits**: Visits with status 'checked_in' (check-out time is null)
- **Completed Visits**: Visits with status 'checked_out' (duration has been calculated)
- **Duration**: Time in minutes between check-in and check-out for a completed visit
- **System**: The Visitor Management System (web application)
- **Authenticated User**: A staff member logged into the System (admin, reception, or security role)

## Requirements

### Requirement 1: Display Visitor Profile Information

**User Story:** As a staff member, I want to view a visitor's complete profile information so that I can quickly reference their details when they visit.

#### Acceptance Criteria

1. WHEN an Authenticated User navigates to a visitor profile page, THE System SHALL display the visitor's full name, phone number, national ID, and company name in a clearly labeled section.

2. WHEN an Authenticated User views a visitor profile page, THE System SHALL display a badge or label indicating the count of total visits for that visitor.

3. WHEN an Authenticated User views a visitor profile page, THE System SHALL display the date the visitor was first registered in the System.

4. WHEN a visitor has a profile photo stored, THE System SHALL display the photo on the profile page; IF no photo exists, THE System SHALL display a default placeholder image.

5. WHEN an Authenticated User views a visitor profile page, THE System SHALL display a "Last Visit" section showing the most recent visit date and time (check-in timestamp).

### Requirement 2: Display Visitor Visit History

**User Story:** As a staff member, I want to view a chronological list of a visitor's past visits so that I can understand their visit patterns and access historical context.

#### Acceptance Criteria

1. WHEN an Authenticated User navigates to a visitor profile page, THE System SHALL display a visit history section listing all visits for that visitor, sorted with the most recent visit first.

2. WHEN viewing the visit history, THE System SHALL display for each visit: visit date (check-in timestamp), person being visited, department, purpose, status (checked_in or checked_out), and duration in minutes IF the visit is completed.

3. WHEN viewing the visit history, THE System SHALL display a visual indicator (e.g., badge or color coding) distinguishing between checked_in (active) and checked_out (completed) visits.

4. WHILE the visit history list contains more than 10 visits, THE System SHALL implement pagination or lazy-loading to display 10 visits per page or load, with a "Load More" option or page navigation controls.

5. WHEN an Authenticated User views a completed visit in the history, THE System SHALL display the calculated duration (check_out_at - check_in_at in minutes) formatted as a human-readable string (e.g., "45m", "1h 30m").

6. WHEN an Authenticated User views an active visit in the history, THE System SHALL display the elapsed time (current time - check_in_at) and update it in real-time every 60 seconds IF the page remains open.

### Requirement 3: Search and Navigate to Visitor Profile

**User Story:** As a staff member, I want to easily find and navigate to a visitor's profile page so that I can quickly access their information.

#### Acceptance Criteria

1. WHEN an Authenticated User is on the Visitors management page, THE System SHALL provide a link or button for each visitor record that navigates to that visitor's profile page.

2. WHEN an Authenticated User searches for a visitor using the existing search functionality, THE System SHALL include a link or button in each search result that navigates to the visitor's profile page.

3. WHEN an Authenticated User navigates to a visitor profile page via URL (e.g., `/dashboard/visitors/{visitorId}`), THE System SHALL load and display that visitor's data correctly.

4. IF a visitor ID in the URL does not exist in the database, THEN THE System SHALL display an error message ("Visitor not found") and provide a link to return to the Visitors page.

### Requirement 4: Display Visit Statistics and Aggregate Data

**User Story:** As a staff member, I want to see aggregate statistics about a visitor's visits so that I can identify high-frequency visitors or potential security concerns.

#### Acceptance Criteria

1. WHEN an Authenticated User views a visitor profile page, THE System SHALL display a statistics section showing the total number of visits for that visitor.

2. WHEN an Authenticated User views a visitor profile page, THE System SHALL display the count of completed visits (checked_out status).

3. WHEN an Authenticated User views a visitor profile page, THE System SHALL display the count of active visits (checked_in status).

4. WHEN a visitor has at least one completed visit, THE System SHALL display the average visit duration (sum of all durations / count of completed visits) rounded to the nearest minute.

5. WHEN a visitor has completed visits, THE System SHALL display the department(s) most frequently visited (top 3 departments by visit count).

### Requirement 5: Real-Time Updates for Active Visits

**User Story:** As a staff member, I want to see real-time updates when a visitor's active visit status changes so that I have current information.

#### Acceptance Criteria

1. WHEN an Authenticated User views a visitor profile page with an active visit, AND that visit is checked out in the System, THE System SHALL update the visit status and display the checked-out duration without requiring a page refresh.

2. WHEN a new visit is created for a visitor whose profile page is currently open, THE System SHALL add the visit to the history list and update the total visit count without requiring a page refresh.

3. WHEN an active visit's elapsed time is displayed on a profile page that remains open, THE System SHALL update the elapsed time display every 60 seconds to reflect the current duration.

### Requirement 6: Access Control for Visitor Profiles

**User Story:** As an administrator, I want to ensure that only authorized staff members can view visitor profiles so that sensitive visitor data is protected.

#### Acceptance Criteria

1. WHEN an unauthenticated user attempts to access a visitor profile page, THE System SHALL redirect them to the login page.

2. WHEN an Authenticated User (reception, security, or admin) accesses a visitor profile page, THE System SHALL display the profile without access restrictions.

3. WHEN an Authenticated User views a visitor profile page, THE System SHALL respect Row Level Security policies and only display visitors that their database role permits them to read.

### Requirement 7: Performance and Loading States

**User Story:** As a staff member, I want responsive pages with clear loading indicators so that I can work efficiently without uncertainty.

#### Acceptance Criteria

1. WHEN an Authenticated User navigates to a visitor profile page, THE System SHALL display a loading indicator while fetching visitor data.

2. WHEN the System retrieves a visitor profile with visit history, THE System SHALL complete the initial load and display within 2 seconds for typical database response times.

3. WHILE the System loads visit history data, THE System SHALL display a skeleton loader or similar visual indicator in the history section to show that content is loading.

4. IF a database error occurs while loading visitor data, THEN THE System SHALL display an error message and provide a "Retry" button or link to return to the Visitors page.

### Requirement 8: Responsive Design

**User Story:** As a staff member using the System on various devices, I want the visitor profile page to display correctly on mobile and desktop so that I can access information on any device.

#### Acceptance Criteria

1. WHEN the visitor profile page is viewed on a mobile device (screen width < 768px), THE System SHALL stack profile information and history sections vertically.

2. WHEN the visitor profile page is viewed on a mobile device, THE System SHALL ensure all text remains readable (minimum font size 14px) and buttons are easily tappable (minimum 44px).

3. WHEN the visitor profile page is viewed on a desktop device (screen width >= 1024px), THE System SHALL display profile information in a sidebar or card-based layout with history in a separate section.

4. WHEN viewing visit history on a mobile device, THE System SHALL display essential information (date, person visited, duration) and collapse non-essential details (purpose) or use horizontal scrolling for detailed columns.

