'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import {
  LogOut, Home, Users, QrCode, BarChart3,
  Shield, Menu, X, ChevronRight,
} from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  reception: 'Reception Officer',
  security: 'Security Officer',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  reception: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  security: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, role, loading } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-400 mb-4" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Nav items visible to everyone
  const coreNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/visitors', label: 'Visitors', icon: Users },
    { href: '/dashboard/scanner', label: 'QR Scanner', icon: QrCode },
  ]

  // Admin-only nav items
  const adminNavItems = [
    { href: '/dashboard/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ]

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string
    label: string
    icon: React.ElementType
  }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive(href)
          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      }`}
    >
      <Icon size={18} className={isActive(href) ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
      <span className="font-medium text-sm">{label}</span>
      {isActive(href) && <ChevronRight size={14} className="ml-auto text-blue-400" />}
    </Link>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-slate-900/95 border-r border-slate-700/50
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-50">VMS</h1>
              <p className="text-xs text-slate-500">Visitor Management</p>
            </div>
          </div>
        </div>

        {/* User info + role badge */}
        <div className="px-4 py-4 border-b border-slate-700/50">
          <p className="text-sm font-semibold text-slate-200 truncate">
            {profile?.full_name || user.email}
          </p>
          <p className="text-xs text-slate-500 truncate mb-2">{user.email}</p>
          {role && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                ROLE_COLORS[role] ?? 'bg-slate-700 text-slate-300 border-slate-600'
              }`}
            >
              {ROLE_LABELS[role] ?? role}
            </span>
          )}
          {!role && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-red-500/20 text-red-300 border-red-500/30">
              No profile — see setup guide
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {/* Core nav — all roles */}
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 mb-2">
            Main
          </p>
          {coreNavItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          {/* Admin-only section */}
          {role === 'admin' && (
            <>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 mt-4 mb-2">
                Administration
              </p>
              {adminNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-slate-900/80 backdrop-blur border-b border-slate-700/50 px-4 py-3 flex items-center justify-between md:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Page title derived from pathname */}
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-200">
              {pathname === '/dashboard' && 'Dashboard'}
              {pathname.startsWith('/dashboard/visitors') && 'Visitor Management'}
              {pathname.startsWith('/dashboard/scanner') && 'QR Scanner'}
              {pathname.startsWith('/dashboard/reports') && 'Reports & Analytics'}
            </p>
          </div>

          {/* Right side: role pill + email */}
          <div className="flex items-center gap-3 ml-auto">
            {role && (
              <span
                className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  ROLE_COLORS[role] ?? ''
                }`}
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            )}
            <div className="text-right">
              <p className="text-xs text-slate-500 hidden sm:block">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
