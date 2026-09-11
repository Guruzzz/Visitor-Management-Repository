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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Visitors Inside</p>
              <p className="text-2xl font-bold">{visits.length}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Filter size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Departments</p>
              <p className="text-2xl font-bold">{departments.length}</p>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Clock size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Companies</p>
              <p className="text-2xl font-bold">{companies.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {checkoutSuccess && (
        <div className="glass p-4 mb-6 border border-green-500/20 bg-green-500/10 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400" />
          <p className="text-green-300 text-sm">{checkoutSuccess}</p>
        </div>
      )}

      {checkoutError && (
        <div className="glass p-4 mb-6 border border-red-500/20 bg-red-500/10 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400" />
          <p className="text-red-300 text-sm">{checkoutError}</p>
        </div>
      )}

      {/* Main Panel */}
      <div className="glass p-6 md:p-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by visitor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 transition-all"
              />
            </div>

            {/* Sort Options */}
            <div className="relative">
              <ChevronDown
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                size={18}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 focus:border-blue-500 focus:bg-slate-800 transition-all appearance-none"
              >
                <option value="check_in_time">Sort by Check-in Time</option>
                <option value="duration">Sort by Duration</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.length > 0 && (
              <div className="relative">
                <ChevronDown
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 text-sm focus:border-blue-500 focus:bg-slate-800 transition-all appearance-none"
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
              <div className="relative">
                <ChevronDown
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 text-sm focus:border-blue-500 focus:bg-slate-800 transition-all appearance-none"
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

        {/* Visitor List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader size={32} className="mx-auto mb-4 animate-spin text-slate-400" />
              <p className="text-slate-400">Loading visitors...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">
              {searchQuery || departmentFilter || companyFilter
                ? 'No visitors found matching your filters'
                : 'No visitors currently inside'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((visit) => (
              <div
                key={visit.id}
                className="glass-sm p-4 md:p-6 hover:bg-white/10 transition-all duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-slate-400">Visitor</p>
                    <p className="text-lg font-semibold text-slate-50">
                      {visit.visitors.full_name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {visit.visitors.visitor_number}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Company</p>
                    <p className="text-lg font-semibold text-slate-50">
                      {visit.visitors.company}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Visiting</p>
                    <p className="text-slate-50">
                      {visit.person_being_visited}
                    </p>
                    <p className="text-sm text-slate-400">
                      {visit.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Purpose</p>
                    <p className="text-slate-50">{visit.purpose}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Clock size={16} />
                      <span className="text-sm font-medium">
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
                    className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-red-300 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
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
            ))}
          </div>
        )}
      </div>

      {/* Check-out Confirmation Modal */}
      {checkoutConfirm && checkoutDuration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-lg max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Confirm Check-out</h3>
                <button
                  onClick={cancelCheckOut}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-slate-400 mb-4">
                You are checking out:
              </p>
              <p className="text-2xl font-bold mb-6">{checkoutConfirm.visitorName}</p>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Duration</p>
                    <p className="text-lg font-semibold text-blue-400">
                      {checkoutConfirm.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <p className="text-lg font-semibold text-green-400">
                      Ready
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                This visitor will be marked as checked out and removed from the active visitors list.
              </p>

              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelCheckOut}
                  className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckOut}
                  disabled={checkingOut === checkoutConfirm.visitId}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
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
