'use client'

/**
 * Reports & Analytics page
 *
 * Client component — auth is already enforced at the layout level (redirect
 * to /login when unauthenticated). This page adds a role check: non-admin
 * users see an "Access Denied" screen instead of the analytics dashboard.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 16.1, 16.2, 16.3
 */

import { Shield } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { ReportsLayoutClient } from '@/components/Reports/ReportsLayoutClient'

export default function ReportsPage() {
  const { role, loading } = useAuth()

  // While auth is initializing, render nothing — the dashboard layout already
  // shows a loading spinner, so we avoid a flash of the access-denied screen.
  if (loading) {
    return null
  }

  // Non-admin users: show access denied (role is known and not admin)
  if (role && role !== 'admin') {
    return (
      <div className="glass p-8 text-center rounded-2xl border border-red-500/20 max-w-md mx-auto mt-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Shield size={40} className="text-red-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
        <p className="text-slate-400 text-sm">
          The Reports &amp; Analytics dashboard is restricted to administrators only.
        </p>
      </div>
    )
  }

  // Admin (or role not yet resolved but unauthenticated redirect handled above)
  return <ReportsLayoutClient />
}
