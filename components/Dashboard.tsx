'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getActiveVisits,
  subscribeToActiveVisits,
  checkOutVisit,
} from '@/lib/visitors'
import { formatDuration } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Clock,
  Users,
  LogOut,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  Building2,
  TrendingUp,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { withRetry } from '@/lib/retry'

interface ActiveVisit {
  id: string
  visit_reference: string
  person_being_visited: string
  department: string
  purpose: string
  check_in_at: string
  status: string
  qr_code_identifier: string
  visitors: {
    full_name: string
    company: string
    visitor_number: string
  }
}

type SortOption = 'check_in_time' | 'duration' | 'name'

interface CheckoutConfirmation {
  visitId: string
  visitorName: string
  duration: string
}

export function Dashboard() {
  const [visits, setVisits] = useState<ActiveVisit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [companyFilter, setCompanyFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('check_in_time')
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [durations, setDurations] = useState<Record<string, string>>({})
  const [checkoutConfirm, setCheckoutConfirm] = useState<CheckoutConfirmation | null>(null)
  const [checkoutDuration, setCheckoutDuration] = useState<{ hours: number; minutes: number } | null>(null)
  const { addToast } = useToast()

  // Fetch initial data and subscribe to updates
  useEffect(() => {
    const loadVisits = async () => {
      try {
        const data = await getActiveVisits()
        setVisits(data || [])
      } catch (error) {
        console.error('Failed to load visits:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVisits()

    const channel = subscribeToActiveVisits((data) => {
      setVisits(data || [])
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Update durations every 30 seconds
  useEffect(() => {
    const updateDurations = () => {
      const newDurations: Record<string, string> = {}
      visits.forEach((visit) => {
        const now = new Date()
        const checkIn = new Date(visit.check_in_at)
        const minutes = Math.round(
          (now.getTime() - checkIn.getTime()) / 60000
        )
        newDurations[visit.id] = formatDuration(minutes)
      })
      setDurations(newDurations)
    }

    updateDurations()
    const interval = setInterval(updateDurations, 30000)

    return () => clearInterval(interval)
  }, [visits])

  const handleCheckOutClick = useCallback(
    (visitId: string, visitorName: string, checkInTime: string) => {
      // Show confirmation modal
      const now = new Date()
      const checkIn = new Date(checkInTime)
      const totalMinutes = Math.round(
        (now.getTime() - checkIn.getTime()) / 60000
      )
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60

      setCheckoutConfirm({
        visitId,
        visitorName,
        duration: formatDuration(totalMinutes),
      })
      setCheckoutDuration({ hours, minutes })
    },
    []
  )

  const confirmCheckOut = useCallback(async () => {
    if (!checkoutConfirm) return

    setCheckingOut(checkoutConfirm.visitId)
    setCheckoutError(null)
    setCheckoutSuccess(null)

    addToast({
      type: 'loading',
      message: 'Checking out visitor...',
      duration: 0,
    })

    try {
      await withRetry(
        () => checkOutVisit(checkoutConfirm.visitId),
        {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            console.warn(`Retry attempt ${attempt} for check-out:`, error)
          },
        }
      )

      setCheckoutSuccess(
        `${checkoutConfirm.visitorName} checked out successfully. Duration: ${checkoutConfirm.duration}`
      )
      // Remove from visible list
      setVisits((prev) => prev.filter((v) => v.id !== checkoutConfirm.visitId))
      setCheckoutConfirm(null)

      addToast({
        type: 'success',
        message: 'Check-out completed!',
        description: `${checkoutConfirm.visitorName} - Duration: ${checkoutConfirm.duration}`,
      })

      setTimeout(() => setCheckoutSuccess(null), 4000)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to check out. Please try again.'
      setCheckoutError(message)

      addToast({
        type: 'error',
        message: 'Check-out failed',
        description: message,
        action: {
          label: 'Retry',
          onClick: confirmCheckOut,
        },
      })

      setTimeout(() => setCheckoutError(null), 5000)
    } finally {
      setCheckingOut(null)
    }
  }, [checkoutConfirm, addToast])

  const cancelCheckOut = useCallback(() => {
    setCheckoutConfirm(null)
    setCheckoutDuration(null)
  }, [])

  // Get unique departments and companies for filters
  const departments = Array.from(
    new Set(visits.map((v) => v.department))
  ).sort()
  const companies = Array.from(
    new Set(visits.map((v) => v.visitors.company))
  ).sort()

  // Apply filters and sorting
  let filtered = visits.filter((visit) => {
    const matchesSearch = visit.visitors.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesDept =
      !departmentFilter || visit.department === departmentFilter
    const matchesCompany =
      !companyFilter || visit.visitors.company === companyFilter

    return matchesSearch && matchesDept && matchesCompany
  })

  if (sortBy === 'name') {
    filtered.sort((a, b) =>
      a.visitors.full_name.localeCompare(b.visitors.full_name)
    )
  } else if (sortBy === 'duration') {
    filtered.sort(
      (a, b) =>
        new Date(b.check_in_at).getTime() - new Date(a.check_in_at).getTime()
    )
  } else {
    filtered.sort(
      (a, b) =>
        new Date(b.check_in_at).getTime() - new Date(a.check_in_at).getTime()
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
          Who&apos;s Inside?
        </h1>
        <p className="text-slate-400">
          Real-time visitor tracking and management
        </p>
      </div>

      {/* Enhanced Animated Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Visitors Inside Card */}
        <div className="group relative glass p-6 overflow-hidden hover:border-blue-500/30 transition-all duration-300 animate-slide-up">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Users size={24} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Visitors Inside</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                {visits.length}
              </p>
            </div>
          </div>
          
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="animate-shimmer" />
          </div>
        </div>

        {/* Departments Card */}
        <div className="group relative glass p-6 overflow-hidden hover:border-purple-500/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Filter size={24} className="text-purple-400 group-hover:text-purple-300 transition-colors" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Departments</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                {departments.length}
              </p>
            </div>
          </div>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="animate-shimmer" />
          </div>
        </div>

        {/* Companies Card */}
        <div className="group relative glass p-6 overflow-hidden hover:border-green-500/30 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <Building2 size={24} className="text-green-400 group-hover:text-green-300 transition-colors" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Companies</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
                {companies.length}
              </p>
            </div>
          </div>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Enhanced Notifications with animations */}
      {checkoutSuccess && (
        <div className="glass p-4 mb-6 border border-green-500/20 bg-green-500/10 rounded-xl flex items-center gap-3 animate-scale-in">
          <CheckCircle size={20} className="text-green-400 animate-pulse-slow" />
          <p className="text-green-300 text-sm">{checkoutSuccess}</p>
        </div>
      )}

      {checkoutError && (
        <div className="glass p-4 mb-6 border border-red-500/20 bg-red-500/10 rounded-xl flex items-center gap-3 animate-scale-in">
          <AlertCircle size={20} className="text-red-400 animate-pulse-slow" />
          <p className="text-red-300 text-sm">{checkoutError}</p>
        </div>
      )}

      {/* Enhanced Main Panel */}
      <div className="glass p-6 md:p-8 rounded-2xl">
        {/* Enhanced Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Enhanced Search Input */}
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by visitor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Enhanced Sort Options */}
            <div className="relative group">
              <ChevronDown
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-blue-400 transition-colors"
                size={18}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-50 focus:border-blue-500 focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
              >
                <option value="check_in_time">Sort by Check-in Time</option>
                <option value="duration">Sort by Duration</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.length > 0 && (
              <div className="relative group">
                <ChevronDown
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-purple-400 transition-colors"
                  size={18}
                />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-50 text-sm focus:border-purple-500 focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {companies.length > 0 && (
              <div className="relative group">
                <ChevronDown
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-green-400 transition-colors"
                  size={18}
                />
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-50 text-sm focus:border-green-500 focus:bg-slate-800 focus:ring-2 focus:ring-green-500/20 transition-all appearance-none"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Visitor List with enhanced cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center animate-scale-in">
              <Loader size={32} className="mx-auto mb-4 animate-spin text-slate-400" />
              <p className="text-slate-400">Loading visitors...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 animate-scale-in">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">
              {searchQuery || departmentFilter || companyFilter
                ? 'No visitors found matching your filters'
                : 'No visitors currently inside'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((visit, index) => (
              <div
                key={visit.id}
                className="group relative glass-sm p-4 md:p-6 rounded-xl hover:bg-white/5 hover:border-blue-500/20 transition-all duration-300 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Visitor</p>
                      <p className="text-lg font-semibold text-slate-50 group-hover:text-blue-300 transition-colors">
                        {visit.visitors.full_name}
                      </p>
                      <p className="text-sm text-slate-400">
                        {visit.visitors.visitor_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-1">Company</p>
                      <p className="text-lg font-semibold text-slate-50 group-hover:text-green-300 transition-colors">
                        {visit.visitors.company}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-1">Visiting</p>
                      <p className="text-slate-50">
                        {visit.person_being_visited}
                      </p>
                      <p className="text-sm text-slate-400">
                        {visit.department}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400 mb-1">Purpose</p>
                      <p className="text-slate-50">{visit.purpose}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-sm font-semibold text-blue-300">
                          {durations[visit.id] || formatDuration(0)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {format(
                          new Date(visit.check_in_at),
                          'MMM d, HH:mm'
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        handleCheckOutClick(visit.id, visit.visitors.full_name, visit.check_in_at)
                      }
                      disabled={checkingOut === visit.id}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-300 hover:text-red-200 px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-500/30 transition-all duration-300 text-sm font-medium hover:scale-105"
                    >
                      {checkingOut === visit.id ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          <span>Checking Out...</span>
                        </>
                      ) : (
                        <>
                          <LogOut size={16} />
                          <span>Check Out</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Check-out Confirmation Modal */}
      {checkoutConfirm && checkoutDuration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
          <div className="glass rounded-2xl max-w-md w-full overflow-hidden border border-slate-700/50 shadow-2xl shadow-blue-500/10">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-50 to-slate-300 bg-clip-text text-transparent">
                  Confirm Check-out
                </h3>
                <button
                  onClick={cancelCheckOut}
                  className="p-2 hover:bg-slate-800 rounded-xl transition-all hover:scale-110"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-slate-400 mb-3 text-sm">
                You are checking out:
              </p>
              <p className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {checkoutConfirm.visitorName}
              </p>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 mb-6 border border-slate-700/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-blue-400" />
                      <p className="text-lg font-bold text-blue-300">
                        {checkoutConfirm.duration}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 font-medium">Status</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-green-400" />
                      <p className="text-lg font-bold text-green-300">
                        Ready
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                This visitor will be marked as checked out and removed from the active visitors list.
              </p>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelCheckOut}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-50 font-medium transition-all hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckOut}
                  disabled={checkingOut === checkoutConfirm.visitId}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all hover:scale-105 shadow-lg shadow-red-500/20"
                >
                  {checkingOut === checkoutConfirm.visitId ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      Check Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}