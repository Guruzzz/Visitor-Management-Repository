# Deployment Guide

## Development vs Production

| Aspect | Development | Production |
| --- | --- | --- |
| Database | Supabase free tier | Supabase Pro/Team (recommended) |
| Auth | Email (no confirmation) | Email with 2FA recommended |
| SSL | HTTP (localhost) | HTTPS (automatic with Vercel) |
| Monitoring | Console logs | Sentry or similar |
| Backups | Manual | Automatic + Point-in-time recovery |
| CDN | None | Vercel Edge Network |

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema applied and tested
- [ ] RLS policies verified
- [ ] Authentication working
- [ ] All features tested locally
- [ ] No console errors
- [ ] Build completes: `npm run build`
- [ ] Tests pass: `npm test`

## Deploy to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Authenticate with GitHub
   - Select your repository
   - Click "Continue"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-selected)
   - **Root Directory**: ./ (default)
   - Keep other settings as default
   - Click "Continue"

4. **Add Environment Variables**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL
   - Click "Add"
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon key
   - Click "Add"

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build

### Option 2: Manual Deploy via CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Add environment variables when prompted**

## Deploy to Other Platforms

### Netlify

1. Push to GitHub
2. Connect repository on [netlify.com](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables
6. Deploy

### AWS Amplify

1. Push to GitHub
2. Go to AWS Amplify Console
3. Create new app
4. Select GitHub repository
5. Configure build settings
6. Add environment variables
7. Deploy

### Docker (Self-hosted)

1. **Build Docker image**
   ```bash
   docker build -t visitor-management .
   ```

2. **Create Dockerfile** (if not exists)
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

3. **Run container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=<your-url> \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key> \
     visitor-management
   ```

4. **Push to registry**
   ```bash
   docker tag visitor-management:latest myregistry/visitor-management:latest
   docker push myregistry/visitor-management:latest
   ```

## Production Supabase Setup

### 1. Upgrade Plan

1. Go to Supabase dashboard
2. Project Settings → Billing
3. Upgrade from Free to Pro plan ($25/month)
4. Configure resource limits as needed

Benefits:
- Higher rate limits
- 24/7 support
- Advanced features
- SLA guarantee

### 2. Database Configuration

1. **Enable Connection Pooling**
   - Project Settings → Database
   - Enable "Connection Pooling"
   - Set Mode: "Transaction"
   - Set Pool Size: 20

2. **Enable Point-in-Time Recovery**
   - Project Settings → Backups
   - Enable "Point-in-time recovery"
   - Set retention: 30 days

3. **Enable Automatic Backups**
   - Project Settings → Backups
   - Set frequency: Daily

### 3. Security Configuration

1. **Enable 2FA**
   - Account Settings → Two-Factor Authentication
   - Setup authenticator app

2. **Configure IP Restrictions** (Optional)
   - Project Settings → Database
   - Add IP whitelist (if self-hosted)

3. **Set Strong Database Password**
   - Project Settings → Database
   - Change password regularly

4. **Review RLS Policies**
   - Go to Authentication → Policies
   - Verify all policies are correct
   - Test with different roles

## SSL/HTTPS Setup

### Vercel (Automatic)
- Vercel automatically provides SSL
- Certificates auto-renew
- Custom domain: Project Settings → Domains

### Self-hosted
```bash
# Using Let's Encrypt with Nginx
sudo certbot certonly --nginx -d yourdomain.com
```

## Monitoring & Logging

### Supabase Monitoring
1. Project Settings → Monitoring
2. View database performance
3. Check API statistics
4. Monitor real-time subscriptions

### Application Monitoring

1. **Error Tracking (Sentry)**
   ```bash
   npm install @sentry/nextjs
   ```

   Configure in `next.config.js`:
   ```js
   import * as Sentry from '@sentry/nextjs'

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
   })
   ```

2. **Analytics (Vercel Analytics)**
   - Already included with Vercel deployment
   - View at dashboard.vercel.com

## Performance Optimization

### 1. Database Performance
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
```

### 2. API Response Times
- Supabase Analytics → API
- Monitor avg response times
- Check for N+1 queries

### 3. Real-time Subscriptions
- Limit concurrent subscriptions
- Close subscriptions when not needed
- Monitor active connections

### 4. Build Optimization
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

## Scaling Considerations

### When to Scale Up
- Database: > 10K visits/day → Premium plan
- Storage: > 5GB data → Increase limit
- Real-time: > 100 concurrent users → Increase pooler
- API: > 1M requests/day → Upgrade rate limits

### Scaling Strategy
1. Monitor metrics weekly
2. Scale database first (cheapest impact)
3. Upgrade connection pooling
4. Consider caching layer (Redis)
5. Implement CDN for static assets

## Rollback Plan

### If Issues Occur

1. **Revert to Previous Deployment**
   - Vercel: Go to Deployments → Select Previous → Promote

2. **Revert Database Changes**
   - Supabase: Project Settings → Backups → Restore
   - Choose backup before changes

3. **Check Logs**
   - Vercel: Deployments → View logs
   - Supabase: Logs tab in dashboard

## Maintenance Tasks

### Daily
- Monitor error rates in Sentry
- Check database connection status

### Weekly
- Review visitor statistics
- Check for slow API calls
- Backup verification

### Monthly
- Update dependencies: `npm update`
- Review security advisories: `npm audit`
- Performance optimization review
- Cost analysis on Supabase

### Quarterly
- Major Next.js/dependency updates
- Security audit
- Disaster recovery drill
- Capacity planning review

## Disaster Recovery

### Database Recovery
1. Supabase automatic backups run daily
2. Point-in-time recovery: 30 days
3. Manual export: SQL Editor → Download

### Application Recovery
1. GitHub acts as backup (all code)
2. Environment variables: Store securely
3. Deployment history: 50 deployments on Vercel

### Procedure
1. Identify issue
2. Restore from latest good backup
3. Verify data integrity
4. Update DNS if needed
5. Monitor closely

## Cost Monitoring

### Estimate Monthly Cost
- **Vercel**: Free tier or $20/month Pro
- **Supabase Pro**: $25/month (1M API calls, 8GB storage)
- **Extra Storage**: $0.125 per GB
- **Database Replica**: $75/month (if needed)

### Cost Optimization
- Use Vercel free tier for testing
- Supabase free tier for MVP
- Consolidate databases (use 1 per project)
- Archive old data to reduce storage
- Implement caching to reduce API calls

## Support & Resources

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs/deployment)
- Email support available on Pro plans

---

Your application is now production-ready!
