# Project Structure

## Overview

```
visitor-management/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout with dark theme
│   ├── globals.css               # Global styles + glassmorphism
│   ├── page.tsx                  # Redirect to login
│   ├── login/
│   │   └── page.tsx             # Login page
│   └── dashboard/
│       ├── layout.tsx            # Dashboard layout with sidebar
│       ├── page.tsx              # Main dashboard
│       ├── visitors/
│       │   └── page.tsx          # Visitor management
│       ├── scanner/
│       │   └── page.tsx          # QR code scanner
│       └── reports/
│           └── page.tsx          # Analytics & reports
│
├── components/                    # React components
│   ├── AuthProvider.tsx          # Auth state provider
│   ├── LoginPage.tsx             # Supabase Auth UI
│   ├── Dashboard.tsx             # Real-time "Who's Inside?" dashboard
│   ├── VisitorRegistrationForm.tsx   # Register visitors
│   ├── VisitCheckInForm.tsx      # Check-in form
│   ├── QRCodeGenerator.tsx       # Generate QR passes
│   └── QRScanner.tsx             # Camera QR scanner
│
├── lib/                          # Utilities & API
│   ├── supabase.ts               # Supabase client
│   ├── database.types.ts         # TypeScript types
│   ├── auth.ts                   # Auth functions
│   ├── visitors.ts               # Visitor API functions
│   ├── validations.ts            # Zod validation schemas
│   ├── utils.ts                  # Helper functions
│   └── __tests__/                # Test files
│       ├── utils.test.ts
│       └── validations.test.ts
│
├── sql/
│   └── schema.sql                # Database schema & RLS policies
│
├── test/
│   └── setup.ts                  # Vitest configuration
│
├── public/                        # Static assets
│
├── Configuration Files
│   ├── package.json              # Dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.js            # Next.js config
│   ├── tailwind.config.ts        # Tailwind styles
│   ├── postcss.config.js         # PostCSS config
│   ├── vitest.config.ts          # Vitest config
│   ├── .eslintrc.json            # ESLint config
│   └── .env.local.example        # Environment template
│
├── Documentation
│   ├── README.md                 # Features & tech stack
│   ├── SETUP.md                  # Step-by-step setup guide
│   ├── DEPLOYMENT.md             # Deployment instructions
│   └── PROJECT_STRUCTURE.md      # This file
│
└── .gitignore                    # Git configuration
```

## File Descriptions

### App Routes

| File | Purpose |
| --- | --- |
| `app/layout.tsx` | Root layout with dark theme, aurora gradient background |
| `app/page.tsx` | Redirect to login |
| `app/login/page.tsx` | Supabase Auth UI login page |
| `app/dashboard/layout.tsx` | Dashboard layout with sidebar navigation |
| `app/dashboard/page.tsx` | Main dashboard with real-time visitor list |
| `app/dashboard/visitors/page.tsx` | Visitor registration & check-in workflow |
| `app/dashboard/scanner/page.tsx` | QR code scanner with camera integration |
| `app/dashboard/reports/page.tsx` | Analytics and visitor statistics |

### Components

| Component | Purpose | Props |
| --- | --- | --- |
| `AuthProvider` | Auth state management | children |
| `LoginPage` | Supabase Auth UI | None |
| `Dashboard` | Real-time "Who's Inside?" | None |
| `VisitorRegistrationForm` | Register new visitors | onSuccess(visitorId) |
| `VisitCheckInForm` | Check-in visitor | visitorId, visitorName, onSuccess(visitId) |
| `QRCodeGenerator` | Generate/download QR | value, title?, visitorName? |
| `QRScanner` | Camera-based QR scanning | onScan(code), onError?, onClose |

### Library Functions

#### Auth (`lib/auth.ts`)
- `signOut()`: Sign out user
- `getCurrentUser()`: Get auth user
- `getUserProfile(userId)`: Get profile
- `createUserProfile(userId, data)`: Create profile

#### Visitors (`lib/visitors.ts`)
- `createVisitor(data)`: Register visitor
- `getVisitor(visitorId)`: Get visitor
- `searchVisitors(type, query)`: Search
- `createVisit(visitorId, data)`: Check-in
- `checkOutVisit(visitId)`: Check-out (calculates duration)
- `getActiveVisits()`: Get checked-in visitors
- `getVisitHistory(visitorId)`: Get visit history
- `subscribeToActiveVisits(callback)`: Real-time subscription
- `getDepartments()`: Get departments

#### Utilities (`lib/utils.ts`)
- `generateVisitorNumber()`: Create VIS-XXXXXX-XXX
- `generateVisitReference()`: Create VISIT-XXXXXXXX-XXXXXX-XXXX
- `calculateDurationMinutes(checkIn, checkOut)`: Calculate duration
- `formatDuration(minutes)`: Format to "Xh Ym" or "Xm"
- `sanitizeInput(input)`: Remove HTML, truncate
- `validateEmail(email)`: Email validation
- `validatePhoneNumber(phone)`: Phone validation

#### Validations (`lib/validations.ts`)
- `visitorRegistrationSchema`: Zod schema
- `visitRegistrationSchema`: Zod schema
- `searchSchema`: Zod schema

### Database Schema (`sql/schema.sql`)

Tables:
- `profiles`: User accounts with roles
- `visitors`: Visitor master records
- `visits`: Visit transactions with duration tracking
- `departments`: Organization departments

All tables have:
- Row Level Security (RLS) policies
- Proper indexes for performance
- Timestamps (created_at, updated_at)

### Tests

| File | Tests |
| --- | --- |
| `lib/__tests__/utils.test.ts` | 20+ test cases for utilities |
| `lib/__tests__/validations.test.ts` | 15+ test cases for schemas |

Test coverage:
- Visitor number generation
- Visit reference generation
- Duration calculation and formatting
- Input sanitization
- Email and phone validation
- Zod schema validation

## Styling & Theme

### Colors
- **Primary**: Blue (rgb(59, 130, 246))
- **Secondary**: Purple (rgb(168, 85, 247))
- **Accent**: Green (rgb(34, 197, 94))
- **Background**: Slate-950 (#0f172a)

### Effects
- **Glassmorphism**: `backdrop-blur-md`, `bg-white/5`, `border-white/10`
- **Aurora Gradient**: Purple → Blue → Green blend
- **Animations**: Fade-in, slide-up, pulse-subtle

### Classes (app/globals.css)
- `.glass`: Standard glassmorphism card
- `.glass-sm`: Smaller glassmorphism element
- `.aurora-gradient`: Aurora background
- `.card-enter`: Fade-in animation
- `.card-hover`: Hover effects

## Dependencies

### Production (Dependencies)
- `react@19` & `react-dom@19`: React framework
- `next@15`: Next.js framework
- `@supabase/supabase-js@2.45`: Database & auth
- `@supabase/auth-ui-react@0.4.7`: Auth UI components
- `qrcode.react@1.0.1`: QR generation
- `jsqr@1.4.0`: QR scanning
- `zod@3.22.4`: Data validation
- `react-hook-form@7.51.0`: Form handling
- `date-fns@3.0.0`: Date utilities
- `lucide-react@0.344.0`: Icons
- `clsx@2.0.0`: Class merging

### Development (DevDependencies)
- `typescript@5.3.3`: Type checking
- `tailwindcss@3.4.1`: Styling
- `vitest@1.1.0`: Testing framework
- `@testing-library/react@14.1.2`: React testing utilities
- Plus ESLint, Autoprefixer, and build tools

## Environment Variables

| Variable | Required | Used In |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser (public) |

Store in `.env.local` - **never commit to git**

## Build & Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm test` | Run test suite |
| `npm run test:ui` | Run tests with UI |
| `npm run lint` | Run ESLint |

## Performance Characteristics

### Database Queries
- All queries indexed
- RLS policies cached
- Real-time subscriptions limited to active visits

### Frontend
- Server-side rendering (Next.js)
- Static assets cached
- CSS-in-JS with Tailwind (optimized bundle)
- No external fonts loaded

### Bundle Size
- Estimated: ~200KB (gzipped)
- Main packages: Next.js, React, Supabase

## Browser Support

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Mobile browsers

❌ Internet Explorer (not supported)

## Security Features

1. **Authentication**: Supabase Auth with email
2. **Row Level Security**: Database-level policies
3. **Input Validation**: Zod schemas on forms
4. **Input Sanitization**: HTML removal, truncation
5. **HTTPS**: Auto-enabled on Vercel
6. **Protected Routes**: Redirects to login if not authenticated
7. **Environment Variables**: Public keys only in browser

## Deployment Ready

✅ TypeScript for type safety
✅ ESLint for code quality
✅ Tests included
✅ Documentation complete
✅ Docker support ready
✅ Vercel optimized
✅ Production database schema
✅ RLS policies configured
✅ Error handling throughout
✅ Loading states on all async operations

## Future Enhancements

- [ ] Photo capture for visitor profiles
- [ ] Multi-location support
- [ ] Bulk import/export
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Badge printing
- [ ] Access control system integration
- [ ] Automated visitor reminders
- [ ] Customizable workflows
- [ ] Audit logs
- [ ] Multi-language support

---

This structure follows Next.js best practices with clear separation of concerns, making the codebase maintainable and scalable.
