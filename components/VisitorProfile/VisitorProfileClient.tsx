'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useVisitorProfile } from '@/lib/hooks/useVisitorProfile'
import { useVisitHistory } from '@/lib/hooks/useVisitHistory'
import { useRealtimeUpdates } from '@/lib/hooks/useRealtimeUpdates'
import {
  ProfileHeader,
  ProfileDetailsSection,
  StatisticsSection,
  TopDepartmentsSection,
  VisitHistorySection,
  LoadingStates,
  ErrorState,
  VisitorNotFoundError,
} from './index'

interface VisitorProfileClientProps {
  visitorId: string
}

export function VisitorProfileClient({ visitorId }: VisitorProfileClientProps) {
  // Use hooks for data fetching
  const {
    visitor,
    statistics,
    isLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useVisitorProfile(visitorId)

  const {
    visits,
    isLoading: isLoadingMore,
    error: visitError,
    hasMore,
    loadMore,
  } = useVisitHistory(visitorId, 10)

  // Real-time elapsed time updates
  const { elapsedTimes } = useRealtimeUpdates(visits)

  // Determine which error to display (profile error takes priority)
  const error = profileError || visitError

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
        <ErrorState
          error={error}
          onRetry={() => refetchProfile()}
          showRetry={!error.toLowerCase().includes('not found')}
        />
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
        <VisitorNotFoundError />
      </div>
    )
  }

  const lastVisitDate = visits.length > 0 ? visits[0].check_in_at : null

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
          onLoadMore={loadMore}
          isLoadingMore={isLoadingMore}
          elapsedTimes={elapsedTimes}
        />
      </div>
    </div>
  )
}
