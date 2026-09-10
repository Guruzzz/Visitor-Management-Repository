'use client'

import { format } from 'date-fns'
import { Badge } from 'lucide-react'
import type { Visitor, Visit } from '@/lib/visitors'

interface ProfileHeaderProps {
  visitor: Visitor | null
  totalVisits: number
  lastVisitDate: string | null
  isLoading?: boolean
}

export function ProfileHeader({
  visitor,
  totalVisits,
  lastVisitDate,
  isLoading = false,
}: ProfileHeaderProps) {
  if (isLoading || !visitor) {
    return <ProfileHeaderSkeleton />
  }

  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 mb-6">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Photo + Name Section */}
        <div className="flex gap-6 items-center flex-1">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {visitor.photo_url ? (
              <img
                src={visitor.photo_url}
                alt={visitor.full_name}
                className="w-24 h-24 rounded-lg object-cover border border-slate-600"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-slate-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-400">
                  {visitor.full_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Name and Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-1">
              {visitor.full_name}
            </h1>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Badge size={16} className="text-blue-400" />
              <span>{visitor.visitor_number}</span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{visitor.company}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 w-full md:w-auto flex-col sm:flex-row">
          {/* Total Visits Badge */}
          <div className="glass-sm p-4 rounded-lg border border-slate-700/50 flex-1 md:flex-none text-center">
            <p className="text-xs text-slate-400 mb-1">Total Visits</p>
            <p className="text-2xl font-bold text-blue-400">{totalVisits}</p>
          </div>

          {/* Last Visit Badge */}
          <div className="glass-sm p-4 rounded-lg border border-slate-700/50 flex-1 md:flex-none text-center">
            <p className="text-xs text-slate-400 mb-1">Last Visit</p>
            {lastVisitDate ? (
              <>
                <p className="text-sm font-bold text-green-400">
                  {format(new Date(lastVisitDate), 'MMM d')}
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(lastVisitDate), 'HH:mm')}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">No visits yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 mb-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        {/* Photo skeleton */}
        <div className="w-24 h-24 rounded-lg bg-slate-700/50 flex-shrink-0" />

        {/* Name and Info skeleton */}
        <div className="flex-1 min-w-0">
          <div className="h-8 bg-slate-700/50 rounded-lg w-3/4 mb-2" />
          <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-2" />
          <div className="h-4 bg-slate-700/50 rounded w-1/3" />
        </div>

        {/* Stats skeleton */}
        <div className="flex gap-4 w-full md:w-auto flex-col sm:flex-row">
          <div className="h-16 bg-slate-700/50 rounded-lg flex-1 md:flex-none min-w-24" />
          <div className="h-16 bg-slate-700/50 rounded-lg flex-1 md:flex-none min-w-24" />
        </div>
      </div>
    </div>
  )
}
