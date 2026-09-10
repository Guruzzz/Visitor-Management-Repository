'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getVisitor, getVisitHistory } from '@/lib/visitors'
import { withRetry } from '@/lib/retry'
import {
  ProfileHeader,
  ProfileDetailsSection,
  StatisticsSection,
  TopDepartmentsSection,
  VisitHistorySection,
  LoadingStates,
} from './index'
import type { Visitor, Visit } from '@/lib/visitors'

interface VisitorStatistics {
  total_visits: number
  completed_visits: number
  active_visits: number
  average_duration_minutes: number | null
  top_departments: Array<{ name: string; count: number }>
}

interface VisitorProfileClientProps {
  visitorId: string
}

export function VisitorProfileClient({ visitorId }: VisitorProfileClientProps) {
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [statistics, setStatistics] = useState<VisitorStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const visitorData = await withRetry(
          () => getVisitor(visitorId),
          { maxAttempts: 3 }
        )

        const visitHistory = await withRetry(
          () => getVisitHistory(visitorId),
          { maxAttempts: 3 }
        )

        // Calculate statistics
        const stats = calculateStatistics(visitHistory || [])

        setVisitor(visitorData)
        setVisits(visitHistory || [])
        setStatistics(stats)
        setHasMore((visitHistory?.length || 0) >= 10)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load visitor data'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [visitorId])

  const calculateStatistics = (visitsList: Visit[]): VisitorStatistics => {
    const total = visitsList.length
    const completed = visitsList.filter((v) => v.status === 'checked_out').length
    const active = visitsList.filter((v) => v.status === 'checked_in').length

    let avgDuration: number | null = null
    if (completed > 0) {
      const totalDuration = visitsList
        .filter((v) => v.status === 'checked_out' && v.duration)
        .reduce((sum, v) => sum + (v.duration || 0), 0)
      avgDuration = Math.round(totalDuration / completed)
    }

    // Calculate top departments
    const deptMap = new Map<string, number>()
    visitsList
      .filter((v) => v.status === 'checked_out')
      .forEach((v) => {
        deptMap.set(v.department, (deptMap.get(v.department) || 0) + 1)
      })

    const topDepartments = Array.from(deptMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    return {
      total_visits: total,
      completed_visits: completed,
      active_visits: active,
      average_duration_minutes: avgDuration,
      top_departments: topDepartments,
    }
  }

  const handleLoadMore = async () => {
    try {
      setIsLoadingMore(true)
      const newPage = currentPage + 1
      const offset = newPage * 10

      const moreVisits = await withRetry(
        () => getVisitHistory(visitorId),
        { maxAttempts: 3 }
      )

      if (!moreVisits || moreVisits.length === 0) {
        setHasMore(false)
      } else {
        // Since getVisitHistory fetches all, we need to paginate client-side
        const newVisits = moreVisits.slice(offset, offset + 10)
        if (newVisits.length === 0) {
          setHasMore(false)
        } else {
          setVisits((prev) => [...prev, ...newVisits])
          setCurrentPage(newPage)
          setHasMore(newVisits.length === 10)
        }
      }
    } catch (err) {
      console.error('Failed to load more visits:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Visitor Profile
          </h1>
          <Link
            href="/dashboard/visitors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
        <LoadingStates />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Visitor Profile
          </h1>
          <Link
            href="/dashboard/visitors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
        <div className="glass p-8 rounded-lg border border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-4">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-300 mb-2">
                Error Loading Profile
              </h2>
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <Link
                href="/dashboard/visitors"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
                Return to Visitors
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!visitor) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Visitor Profile
          </h1>
          <Link
            href="/dashboard/visitors"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
        </div>
        <div className="glass p-8 rounded-lg border border-red-500/30 bg-red-500/10 text-center">
          <AlertCircle size={32} className="mx-auto mb-4 text-red-400" />
          <h2 className="text-lg font-semibold text-red-300 mb-2">
            Visitor Not Found
          </h2>
          <p className="text-sm text-red-400 mb-4">
            The visitor you are looking for does not exist.
          </p>
          <Link
            href="/dashboard/visitors"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Return to Visitors
          </Link>
        </div>
      </div>
    )
  }

  const lastVisitDate =
    visits.length > 0 ? visits[0].check_in_at : null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Visitor Profile
        </h1>
        <Link
          href="/dashboard/visitors"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <ProfileHeader
          visitor={visitor}
          totalVisits={statistics?.total_visits || 0}
          lastVisitDate={lastVisitDate}
        />

        {/* Details and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details Section */}
          <div className="lg:col-span-1">
            <ProfileDetailsSection visitor={visitor} />
          </div>

          {/* Statistics Section */}
          <div className="lg:col-span-2">
            <StatisticsSection statistics={statistics} />
          </div>
        </div>

        {/* Top Departments */}
        {statistics && statistics.top_departments.length > 0 && (
          <TopDepartmentsSection departments={statistics.top_departments} />
        )}

        {/* Visit History */}
        <VisitHistorySection
          visits={visits}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoadingMore={isLoadingMore}
        />
      </div>
    </div>
  )
}
