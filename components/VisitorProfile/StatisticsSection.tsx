'use client'

import { Users, CheckCircle, Clock, Hourglass } from 'lucide-react'

interface VisitorStatistics {
  total_visits: number
  completed_visits: number
  active_visits: number
  average_duration_minutes: number | null
}

interface StatisticsSectionProps {
  statistics: VisitorStatistics | null
  isLoading?: boolean
}

export function StatisticsSection({
  statistics,
  isLoading = false,
}: StatisticsSectionProps) {
  if (isLoading || !statistics) {
    return <StatisticsSectionSkeleton />
  }

  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700">
      <h2 className="text-xl font-bold text-slate-50 mb-6">Visit Statistics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Visits Card */}
        <StatCard
          icon={<Users size={24} className="text-blue-400" />}
          label="Total Visits"
          value={statistics.total_visits}
          bgColor="blue"
        />

        {/* Completed Visits Card */}
        <StatCard
          icon={<CheckCircle size={24} className="text-green-400" />}
          label="Completed Visits"
          value={statistics.completed_visits}
          bgColor="green"
        />

        {/* Active Visits Card */}
        <StatCard
          icon={<Clock size={24} className="text-orange-400" />}
          label="Active Visits"
          value={statistics.active_visits}
          bgColor="orange"
        />

        {/* Average Duration Card - only show if completed visits exist */}
        {statistics.completed_visits > 0 && statistics.average_duration_minutes !== null ? (
          <StatCard
            icon={<Hourglass size={24} className="text-purple-400" />}
            label="Avg Duration"
            value={`${Math.round(statistics.average_duration_minutes)}m`}
            bgColor="purple"
          />
        ) : (
          <StatCard
            icon={<Hourglass size={24} className="text-slate-500" />}
            label="Avg Duration"
            value="—"
            bgColor="slate"
          />
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  bgColor: 'blue' | 'green' | 'orange' | 'purple' | 'slate'
}

function StatCard({ icon, label, value, bgColor }: StatCardProps) {
  const bgColors = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    orange: 'bg-orange-500/10',
    purple: 'bg-purple-500/10',
    slate: 'bg-slate-500/10',
  }

  return (
    <div
      className={`glass-sm p-4 md:p-6 rounded-lg border border-slate-700/50 text-center hover:border-slate-600 transition-colors`}
    >
      <div className={`${bgColors[bgColor]} w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <p className="text-xs md:text-sm text-slate-400 mb-2 line-clamp-2">
        {label}
      </p>
      <p className="text-2xl md:text-3xl font-bold text-slate-50 break-words">
        {value}
      </p>
    </div>
  )
}

export function StatisticsSectionSkeleton() {
  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
      <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-sm p-4 md:p-6 rounded-lg border border-slate-700/50">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-700/50 rounded-lg mx-auto mb-3" />
            <div className="h-3 bg-slate-700/50 rounded w-3/4 mx-auto mb-2" />
            <div className="h-8 bg-slate-700/50 rounded w-1/2 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
