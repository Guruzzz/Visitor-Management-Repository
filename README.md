# Digital Visitor Management & Premises Monitoring System

A production-quality MVP for managing visitor check-ins, tracking active visitors in real-time, and generating digital visitor passes with QR codes.

## Features

- **Visitor Registration**: Register visitors with name, phone, ID, company details
- **Real-Time Dashboard**: Live "Who's Inside?" dashboard with Supabase subscriptions
- **Check-In/Check-Out Workflow**: Automatic duration calculation on check-out
- **Digital Visitor Passes**: QR code generation with visit references
- **QR Code Scanning**: Browser-based camera integration for scanning passes
- **Visitor Search**: Search by name, phone, ID, company, or visitor number
- **Visitor History**: Track all visits and profiles
- **Role-Based Access Control**: Admin, Reception, and Security roles
- **Row Level Security**: Supabase RLS policies for data protection
- **Reports & Analytics**: Visitor statistics, top companies, and department insights
- **Modern 2026 SaaS UI**: Glassmorphism effects, aurora gradients, responsive design

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Backend**: Supabase (PostgreSQL, Auth, Real-time subscriptions)
- **Forms**: React Hook Form + Zod validation
- **QR Code**: qrcode.react for generation, jsQR for scanning
- **Date**: date-fns for date formatting
- **Testing**: Vitest with React Testing Library
- **Icons**: Lucide React

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available)

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be created
4. Go to SQL Editor and run the SQL from `sql/schema.sql`

### 3. Get Supabase Keys

1. In Supabase dashboard, go to Project Settings → API
2. Copy `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
3. Copy `anon public key` (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to access the application.

## Database Schema

### profiles
- id (UUID, primary key, from auth.users)
- full_name (VARCHAR)
- email (VARCHAR, unique)
- phone (VARCHAR)
- role (user_role: admin, reception, security)
- avatar_url (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)

### visitors
- id (UUID, primary key)
- visitor_number (VARCHAR, unique - auto-generated)
- full_name (VARCHAR)
- phone (VARCHAR)
- national_id (VARCHAR)
- company (VARCHAR)
- photo_url (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)

### visits
- id (UUID, primary key)
- visitor_id (UUID, foreign key)
- visit_reference (VARCHAR, unique - auto-generated)
- person_being_visited (VARCHAR)
- department (VARCHAR)
- purpose (TEXT)
- check_in_at (TIMESTAMP)
- check_out_at (TIMESTAMP, nullable)
- duration (INTEGER minutes, nullable)
- status (visit_status: checked_in, checked_out)
- qr_code_identifier (VARCHAR, unique)
- created_at, updated_at (TIMESTAMP)

### departments
- id (UUID, primary key)
- name (VARCHAR, unique)
- description (TEXT, nullable)
- created_at (TIMESTAMP)

## Row Level Security (RLS)

### profiles
- Users can view/update their own profile
- Admins can view and update all profiles

### departments
- Authenticated users can read
- Only admins can insert/update

### visitors
- Authenticated users can read
- Reception/Security/Admin can insert
- Only admins can update

### visits
- Authenticated users can read
- Reception/Security/Admin can insert/update

## API Functions

### Auth
- `signOut()`: Sign out current user
- `getCurrentUser()`: Get authenticated user
- `getUserProfile(userId)`: Get user profile
- `createUserProfile(userId, data)`: Create profile after signup

### Visitors
- `createVisitor(data)`: Register a new visitor
- `getVisitor(visitorId)`: Get visitor details
- `searchVisitors(type, query)`: Search visitors
- `createVisit(visitorId, data)`: Check-in visitor
- `checkOutVisit(visitId)`: Check-out visitor (calculates duration)
- `getActiveVisits()`: Get all checked-in visitors
- `getVisitHistory(visitorId)`: Get visitor's visit history
- `subscribeToActiveVisits(callback)`: Real-time subscription
- `getDepartments()`: Get all departments

## Components

### Authentication
- `LoginPage`: Supabase Auth UI login
- `AuthProvider`: Auth state management

### Visitor Management
- `VisitorRegistrationForm`: Register new visitors
- `VisitCheckInForm`: Check-in visitor with details
- `QRCodeGenerator`: Generate and download QR passes
- `QRScanner`: Camera-based QR code scanning
- `Dashboard`: Real-time "Who's Inside?" with Supabase subscriptions

### Pages
- `/login`: Authentication
- `/dashboard`: Main dashboard
- `/dashboard/visitors`: Visitor management
- `/dashboard/scanner`: QR code scanner
- `/dashboard/reports`: Analytics and reports

## Validation

All forms use Zod schemas with React Hook Form:
- Visitor registration: Name, phone, ID, company
- Visit registration: Person visited, department, purpose
- Search: Query and search type

Validation includes:
- Input sanitization (HTML removal, truncation)
- Email validation
- Phone number validation
- Min/max length constraints

## Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Test suites:
- `lib/__tests__/utils.test.ts`: Utility functions
- `lib/__tests__/validations.test.ts`: Zod schemas

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Yes | Your Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Yes | Your Supabase anon key |

## Security Notes

- All API calls use Supabase client with Row Level Security
- RLS policies enforce role-based access
- Input validation and sanitization on all forms
- Authentication required for all dashboard routes
- Environment variables never exposed in client code

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
npm run build
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Performance

- Server-side rendering with Next.js App Router
- Image optimization disabled (self-hosted assets)
- Real-time updates via Supabase subscriptions
- Indexed database queries for fast search
- CSS-in-JS with Tailwind for minimal bundle size

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Support

For issues or questions:
1. Check the setup instructions
2. Verify Supabase configuration
3. Check browser console for errors
4. Ensure environment variables are set

## Future Enhancements

- Photo capture for visitor profiles
- Multi-location support
- Bulk import/export visitors
- Email notifications
- SMS alerts
- Mobile app
- Advanced analytics
- Badge printing
- Integration with access control systems
