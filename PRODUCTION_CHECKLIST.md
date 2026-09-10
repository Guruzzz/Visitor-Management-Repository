# Production Deployment Checklist

Complete this checklist before deploying to production.

## Code Quality

- [ ] All TypeScript errors resolved: `npm run build` succeeds
- [ ] ESLint passes: `npm run lint` shows no errors
- [ ] Tests pass: `npm test` passes all
- [ ] No console.error in production code
- [ ] No TODO/FIXME comments left
- [ ] Removed all console.log statements
- [ ] Error handling on all async operations
- [ ] Loading states on all async operations

## Security

- [ ] `.env.local` not committed to git
- [ ] `.env.local.example` has placeholder values only
- [ ] `.gitignore` includes `.env*`
- [ ] No secrets in environment variables shown in console
- [ ] RLS policies reviewed and tested
- [ ] Admin access restricted to specific users
- [ ] Input validation on all forms
- [ ] Input sanitization implemented
- [ ] HTTPS forced in production
- [ ] CORS configured properly
- [ ] Database credentials stored securely

## Supabase Configuration

- [ ] Upgraded to Supabase Pro plan
- [ ] Connection pooling enabled
- [ ] Point-in-time recovery enabled
- [ ] Automatic backups configured (daily)
- [ ] Email authentication enabled
- [ ] Email confirmation disabled (or configured)
- [ ] Rate limiting configured
- [ ] RLS policies enabled on all tables
- [ ] Public access disabled except for auth
- [ ] Database backups tested

## Database

- [ ] All tables created successfully
- [ ] All indexes created
- [ ] RLS policies active on all tables
- [ ] Foreign keys configured
- [ ] Default values set
- [ ] Data types correct
- [ ] Constraints in place
- [ ] Tested with sample data
- [ ] Backup/restore procedure tested

## Application Configuration

- [ ] Environment variables set in production
- [ ] API keys verified (not expired)
- [ ] Email service configured
- [ ] Error tracking setup (Sentry/similar)
- [ ] Analytics enabled (Vercel)
- [ ] CDN configured
- [ ] Cache headers configured
- [ ] Compression enabled
- [ ] Rate limiting configured
- [ ] CORS headers appropriate

## Performance

- [ ] Initial load time < 3 seconds
- [ ] Real-time updates respond < 100ms
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Indexes on frequently searched columns
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Build size acceptable
- [ ] Bundle analysis reviewed

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing complete
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Accessibility checked (WCAG)
- [ ] Error scenarios tested
- [ ] Edge cases handled
- [ ] Load testing completed

## Monitoring & Alerts

- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring setup
- [ ] Database alerts configured
- [ ] API rate limit alerts
- [ ] Storage alerts
- [ ] Cost alerts
- [ ] Performance monitoring
- [ ] Real-time alerts on errors
- [ ] Log aggregation setup
- [ ] Backup verification alerts

## Documentation

- [ ] README.md complete and accurate
- [ ] SETUP.md tested (follow instructions exactly)
- [ ] API_REFERENCE.md updated
- [ ] Deployment guide updated
- [ ] API documentation complete
- [ ] Code comments explain complex logic
- [ ] Troubleshooting guide included
- [ ] Known limitations documented
- [ ] Version history maintained

## User Access

- [ ] Admin account created and tested
- [ ] Test users created
- [ ] Role-based access verified
- [ ] Permissions tested for each role
- [ ] Profile data correctly set
- [ ] Default departments added
- [ ] First user onboarding smooth

## Feature Completeness

- [ ] Visitor registration working
- [ ] Check-in/check-out workflow complete
- [ ] Duration calculation verified
- [ ] QR generation working
- [ ] QR scanning on different devices
- [ ] Real-time dashboard updating
- [ ] Search functionality tested
- [ ] Reports generating correctly
- [ ] Responsive design on all devices
- [ ] Dark theme consistent

## Data Integrity

- [ ] No orphaned records possible
- [ ] Foreign keys prevent deletion of referenced data
- [ ] Duplicate prevention working
- [ ] Unique constraints enforced
- [ ] Data validation at database level
- [ ] Timestamps auto-populated
- [ ] Update triggers working
- [ ] Audit logs setup (if needed)

## Deployment

- [ ] Production environment verified
- [ ] Domain/DNS configured
- [ ] SSL certificate valid
- [ ] Deployment pipeline working
- [ ] Rollback procedure tested
- [ ] Zero-downtime deployment possible
- [ ] Build artifacts optimized
- [ ] Caching strategy implemented
- [ ] CDN warming configured
- [ ] Health check endpoint active

## Scaling Preparation

- [ ] Database connection pooling tested
- [ ] Horizontal scaling possible
- [ ] Caching strategy identified
- [ ] Rate limiting per user/IP
- [ ] Queue system for heavy operations
- [ ] Database replicas planned
- [ ] Load testing completed
- [ ] Auto-scaling configured
- [ ] Resource limits set

## Compliance & Legal

- [ ] Privacy policy reviewed
- [ ] Terms of service ready
- [ ] GDPR compliance checked
- [ ] Data retention policy set
- [ ] Export/delete capabilities
- [ ] User consent mechanism
- [ ] Data breach response plan
- [ ] Security audit completed
- [ ] Legal review done

## Post-Deployment

- [ ] Monitor error rates for 24 hours
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Test with production data volume
- [ ] Check backup/restore procedure
- [ ] Verify uptime monitoring alerts
- [ ] Document any issues found
- [ ] Plan follow-up improvements
- [ ] Communicate with team
- [ ] Schedule post-mortem if issues

## Maintenance Plan

- [ ] Backup verification schedule (weekly)
- [ ] Security update schedule (monthly)
- [ ] Dependency update schedule (monthly)
- [ ] Performance review schedule (monthly)
- [ ] Capacity planning schedule (quarterly)
- [ ] Disaster recovery drill (quarterly)
- [ ] Security audit schedule (annually)
- [ ] Code review process established
- [ ] Incident response procedure documented

## Monitoring Dashboard

Set up monitoring for:

- [ ] Error rate
- [ ] Response times
- [ ] Database connections
- [ ] API request volume
- [ ] Storage usage
- [ ] Active users
- [ ] Visitor check-ins/day
- [ ] System uptime
- [ ] Cost tracking

## Emergency Contacts

- [ ] Supabase support contact
- [ ] Vercel support contact
- [ ] Team on-call schedule
- [ ] Escalation procedure documented

## Sign-Off

- [ ] Technical lead reviewed
- [ ] Product owner approved
- [ ] QA signed off
- [ ] Security team reviewed
- [ ] Deployment approved
- [ ] Go-live date confirmed

---

## Quick Pre-Launch Commands

```bash
# 1. Build production version
npm run build

# 2. Run all tests
npm test

# 3. Run linter
npm run lint

# 4. Check TypeScript
npx tsc --noEmit

# 5. Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# 6. Test local deployment
npm start
# Visit http://localhost:3000
```

## Rollback Procedure

If issues occur after deployment:

1. **Immediate**: Revert to previous Vercel deployment
   - Go to Vercel Dashboard → Deployments
   - Click previous successful deployment
   - Click "Promote to Production"

2. **Database**: Restore from backup
   - Supabase → Settings → Backups
   - Choose pre-deployment backup
   - Click "Restore"
   - Wait for completion

3. **Communication**: 
   - Notify team
   - Post status update
   - Document issue
   - Plan fix

## Post-Launch Monitoring (First Week)

Daily checks:
- [ ] Error rates normal
- [ ] Performance acceptable
- [ ] No data corruption
- [ ] Users can complete workflows
- [ ] Real-time features working
- [ ] QR scanning reliable
- [ ] Reports accurate

## Success Criteria

✅ No critical errors
✅ Response times < 2s
✅ 99.9% uptime
✅ Users completing check-ins
✅ Dashboard real-time updating
✅ Reports generating
✅ Database healthy
✅ Backups verified
✅ Team confident

---

**Last Updated**: [Date]
**Deployed By**: [Name]
**Deployment Date**: [Date]
**Version**: 1.0.0

---

Once all items are checked, you're ready for production launch! 🚀
