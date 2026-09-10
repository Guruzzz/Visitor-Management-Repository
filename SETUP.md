# Complete Setup Guide

## Step 1: Create Supabase Project

### 1.1 Create Account
1. Visit [supabase.com](https://supabase.com)
2. Click "Sign up"
3. Create account with GitHub or email

### 1.2 Create New Project
1. Go to dashboard
2. Click "New Project"
3. Select organization and fill in:
   - **Project name**: `visitor-management` (or your choice)
   - **Database password**: Create a strong password (save it)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait for database to initialize (2-3 minutes)

## Step 2: Configure Database

### 2.1 Run SQL Migration
1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Open `sql/schema.sql` in your project
4. Copy the entire SQL content
5. Paste into the SQL Editor
6. Click "Run" (or Cmd+Enter)
7. Wait for completion (should see "success" message)

### 2.2 Verify Tables
1. Go to **Table Editor** in left sidebar
2. Verify these tables exist:
   - `profiles`
   - `visitors`
   - `visits`
   - `departments`
3. Click on each to verify columns

## Step 3: Configure Authentication

### 3.1 Enable Email Auth
1. Go to **Authentication** → **Providers**
2. Click "Email"
3. Toggle "Enable Email Provider" ON
4. Scroll down and toggle "Confirm email" OFF (for easier testing)
5. Scroll down and toggle "Enable email confirmations" OFF
6. Click "Save"

### 3.2 Create Test User (Optional)
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Fill in:
   - Email: test@example.com
   - Password: testpassword123
   - Confirm password: testpassword123
4. Check "Auto confirm user"
5. Click "Create user"

## Step 4: Get API Keys

### 4.1 Get Project URL and Key
1. Go to **Project Settings** (gear icon)
2. Click **API** tab
3. Copy these values:
   - **Project URL**: Under "API Gateway"
   - **Anon Public Key**: Under "API keys"

Example:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 5: Clone & Setup Project

### 5.1 Clone Repository
```bash
git clone <your-repo-url>
cd visitor-management
```

### 5.2 Install Dependencies
```bash
npm install
```

### 5.3 Create Environment File
Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual keys from Step 4.

### 5.4 Verify Environment
```bash
# Check that .env.local exists and has values
cat .env.local
```

## Step 6: Run Development Server

### 6.1 Start Server
```bash
npm run dev
```

Output should show:
```
> next dev
  ▲ Next.js 15.1.3
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### 6.2 Test Application
1. Open browser to `http://localhost:3000`
2. Should redirect to `/login`
3. Click "Sign up" to create account or use test account:
   - Email: test@example.com
   - Password: testpassword123
4. After login, should see dashboard

## Step 7: Test Features

### 7.1 Test Visitor Registration
1. Go to Dashboard → Visitors
2. Click "Register Visitor"
3. Fill in sample data:
   - Full Name: John Smith
   - Phone: +1 (555) 123-4567
   - National ID: ABC123456
   - Company: Acme Corp
4. Click "Register Visitor"
5. Should show success and move to check-in

### 7.2 Test Check-In
1. Fill in check-in details:
   - Person Being Visited: Jane Doe
   - Department: Sales
   - Purpose: Client meeting
2. Click "Check In Visitor"
3. Should show QR code pass

### 7.3 Test Dashboard
1. Go to Dashboard home
2. Should see "Who's Inside?" with the checked-in visitor
3. Visit count should show 1

### 7.4 Test QR Scanner
1. Go to Dashboard → QR Scanner
2. Click "Tap to Start Scanning"
3. Browser will ask for camera permission - allow it
4. Generate QR code from visitor pass
5. Scan with phone camera pointing at screen
6. Should show visitor details
7. Click "Check Out" to complete visit

## Step 8: Deploy to Vercel

### 8.1 Push to GitHub
```bash
git add .
git commit -m "Initial commit: Visitor Management System"
git push origin main
```

### 8.2 Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Paste your GitHub repo URL
5. Click "Continue"
6. Click "Continue" on project settings
7. Go to **Environment Variables**
8. Add:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase Anon Key
9. Click "Deploy"

### 8.3 Verify Deployment
1. Wait for deployment (2-3 minutes)
2. Click the deployment URL
3. Login and test features

## Troubleshooting

### Issue: "Cannot find environment variables"
**Solution**: 
- Check `.env.local` exists in project root
- Verify values are not wrapped in quotes
- Stop dev server and restart: `npm run dev`

### Issue: "Invalid API key"
**Solution**:
- Go to Supabase Project Settings → API
- Copy fresh anon key
- Update `.env.local`
- Restart dev server

### Issue: "Error: User not authenticated"
**Solution**:
- Ensure email confirmation is disabled in Supabase
- Clear browser cookies/cache
- Try signing up with a new email
- Check browser console for errors

### Issue: "Camera permission denied"
**Solution**:
- Allow camera access when browser asks
- Check browser settings for site permissions
- Try different browser
- Ensure using HTTPS (localhost works in dev)

### Issue: "Tables don't exist"
**Solution**:
- Go to Supabase SQL Editor
- Verify SQL migration ran successfully
- Check for error messages
- Try running individual table creation statements

### Issue: QR code won't scan
**Solution**:
- Ensure good lighting
- Hold phone camera steady
- Try downloading QR code and scanning with phone camera first
- Verify QR data format is correct

## Next Steps

1. **Create additional users** with different roles (Admin, Reception, Security)
2. **Customize departments** in `sql/schema.sql`
3. **Add more validation** for your specific business rules
4. **Set up email notifications** for visitor arrivals
5. **Configure SSL certificate** for production
6. **Set up automated backups** in Supabase
7. **Add 2FA** to user accounts

## Database Backups

### Supabase Backups
1. Go to **Project Settings** → **Backups**
2. Enable "Automatic backups"
3. Set backup frequency (daily/weekly)
4. Enable "Point-in-time recovery"

### Manual Export
1. Go to SQL Editor
2. Click "Download" (exports to SQL file)
3. Save locally

## Security Best Practices

1. **Never commit `.env.local`** - it's in `.gitignore`
2. **Rotate API keys regularly** in Supabase dashboard
3. **Use strong database password** created during project setup
4. **Enable Row Level Security** (already configured)
5. **Use HTTPS** in production (Vercel does this automatically)
6. **Enable 2FA** for your Supabase account
7. **Restrict database access** by IP if needed
8. **Review RLS policies** regularly

## Performance Tips

1. Enable **Connection Pooling** in Supabase:
   - Project Settings → Database → Pooling
   - Set pool mode to "Transaction"
   - Set pool size to 10-20

2. Create **Database Indexes** for frequently searched fields:
   - Already included in `sql/schema.sql`

3. Use **Supabase Real-time** efficiently:
   - Already subscribed to active visits only
   - Unsubscribe when component unmounts

4. Enable **CDN** for static assets in Vercel

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/documentation)

---

You're all set! Your Visitor Management System is ready to use.
