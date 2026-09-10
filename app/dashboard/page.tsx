'use client'

import { Dashboard } from '@/components/Dashboard'
import { useAuth } from '@/components/AuthProvider'

const ROLE_GREETINGS: Record<string, { title: string; subtitle: string }> = {
  admin: {
    title: 'Administrator Dashboard',
    subtitle: 'Full system access — manage visitors, reports, and settings.',
  },
  reception: {
    title: 'Reception Dashboard',
    subtitle: 'Register visitors, check them in and out, generate passes.',
  },
  security: {
    title: 'Security Dashboard',
    subtitle: 'Monitor who is currently inside and scan visitor passes.',
  },
}

export default function DashboardPage() {
  const { profile, role } = useAuth()

  const greeting = role ? ROLE_GREETINGS[role] : null
  const name = profile?.full_name?.split(' ')[0] ?? ''

  return (
    <div>
      {/* Role-aware welcome banner */}
      {greeting && (
        <div className="mb-6 p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500 mb-0.5">
              Welcome back{name ? `, ${name}` : ''}
            </p>
            <h2 className="text-lg font-bold text-slate-100">{greeting.title}</h2>
            <p className="text-sm text-slate-400">{greeting.subtitle}</p>
          </div>
          {role === 'admin' && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ADMIN
            </span>
          )}
          {role === 'reception' && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              RECEPTION
            </span>
          )}
          {role === 'security' && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SECURITY
            </span>
          )}
        </div>
      )}

      {/* No profile warning */}
      {!role && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <p className="text-sm font-semibold text-red-300">Profile not found</p>
          <p className="text-xs text-red-400 mt-1">
            Your account has no profile row in the database. Ask an administrator to
            run the profile INSERT SQL for your email address.
          </p>
        </div>
      )}

      <Dashboard />
    </div>
  )
}
