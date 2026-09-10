'use client'

import { format } from 'date-fns'
import { Phone, FileText, Building, Calendar, Hash } from 'lucide-react'
import type { Visitor } from '@/lib/visitors'

interface ProfileDetailsSectionProps {
  visitor: Visitor | null
  isLoading?: boolean
}

export function ProfileDetailsSection({
  visitor,
  isLoading = false,
}: ProfileDetailsSectionProps) {
  if (isLoading || !visitor) {
    return <ProfileDetailsSectionSkeleton />
  }

  const registrationDate = new Date(visitor.created_at)

  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700">
      <h2 className="text-xl font-bold text-slate-50 mb-6">
        Contact Information
      </h2>

      <div className="space-y-6">
        {/* Phone */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
            <Phone size={18} className="text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">Phone Number</p>
            <p className="text-slate-50 font-medium break-all">{visitor.phone}</p>
          </div>
        </div>

        {/* National ID */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
            <FileText size={18} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">National ID</p>
            <p className="text-slate-50 font-medium break-all">
              {visitor.national_id}
            </p>
          </div>
        </div>

        {/* Company */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-500/10 rounded-lg flex-shrink-0">
            <Building size={18} className="text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">Company</p>
            <p className="text-slate-50 font-medium break-all">
              {visitor.company}
            </p>
          </div>
        </div>

        {/* Visitor Number */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
            <Hash size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">Visitor Number</p>
            <p className="text-slate-50 font-medium">
              {visitor.visitor_number}
            </p>
          </div>
        </div>

        {/* Registration Date */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg flex-shrink-0">
            <Calendar size={18} className="text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mb-1">Registered On</p>
            <p className="text-slate-50 font-medium">
              {format(registrationDate, 'MMMM d, yyyy')}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {format(registrationDate, 'HH:mm')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileDetailsSectionSkeleton() {
  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
      <div className="h-6 bg-slate-700/50 rounded w-1/3 mb-6" />
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="w-9 h-9 bg-slate-700/50 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-3 bg-slate-700/50 rounded w-1/4 mb-2" />
              <div className="h-4 bg-slate-700/50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
