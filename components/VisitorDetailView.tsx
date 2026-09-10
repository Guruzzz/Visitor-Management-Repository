'use client'

import { useEffect, useState } from 'react'
import { getVisitor, getVisitHistory } from '@/lib/visitors'
import { format } from 'date-fns'
import { ChevronLeft, Loader, Phone, Building2, FileText, Calendar } from 'lucide-react'
import type { Visitor, Visit } from '@/lib/visitors'

interface VisitorDetailViewProps {
  visitorId: string
  onBack?: () => void
  onCheckIn?: () => void
}

export function VisitorDetailView({
  visitorId,
  onBack,
  onCheckIn,
}: VisitorDetailViewProps) {
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [visitHistory, setVisitHistory] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [visitorData, historyData] = await Promise.all([
          getVisitor(visitorId),
          getVisitHistory(visitorId),
        ])
        setVisitor(visitorData)
        setVisitHistory(historyData)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load visitor details'
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [visitorId])

  if (isLoading) {
    return (
      <div className="glass p-6 md:p-8 flex justify-center items-center min-h-96">
        <div className="text-center">
          <Loader size={32} className="animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading visitor details...</p>
        </div>
      </div>
    )
  }

  if (error || !visitor) {
    return (
      <div className="glass p-6 md:p-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200">
          {error || 'Visitor not found'}
        </div>
      </div>
    )
  }

  const lastVisit = visitHistory[0]
  const totalVisits = visitHistory.length

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ChevronLeft size={18} />
          Back
        </button>
      )}

      {/* Visitor Info Card */}
      <div className="glass p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Info */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6 text-slate-50">
              {visitor.full_name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Company</p>
                  <p className="text-slate-50 font-medium">{visitor.company}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-slate-50 font-medium">{visitor.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">National ID</p>
                  <p className="text-slate-50 font-mono font-medium">
                    {visitor.national_id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-400">Visitor ID</p>
                  <p className="text-slate-50 font-mono font-medium">
                    {visitor.visitor_number}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="glass-sm p-6 text-center">
              <p className="text-sm text-slate-400 mb-2">Total Visits</p>
              <p className="text-4xl font-bold text-blue-400">{totalVisits}</p>
            </div>

            {lastVisit && (
              <div className="glass-sm p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Last Visit</p>
                <p className="text-slate-50 font-medium">
                  {format(new Date(lastVisit.check_in_at), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {format(new Date(lastVisit.check_in_at), 'HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {onCheckIn && (
          <button
            onClick={onCheckIn}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
          >
            Check In Visitor
          </button>
        )}
      </div>

      {/* Visit History */}
      <div className="glass p-6 md:p-8">
        <h3 className="text-2xl font-bold mb-6">Visit History</h3>

        {visitHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No visit history available for this visitor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">
                    Person Visited
                  </th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">
                    Department
                  </th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">
                    Purpose
                  </th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">
                    Check-in
                  </th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">
                    Check-out
                  </th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {visitHistory.map((visit) => (
                  <tr
                    key={visit.id}
                    className="border-b border-slate-700/50 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-slate-300">
                      {format(new Date(visit.check_in_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {visit.person_being_visited}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {visit.department}
                    </td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-xs">
                      {visit.purpose}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {format(new Date(visit.check_in_at), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {visit.check_out_at
                        ? format(new Date(visit.check_out_at), 'HH:mm')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-medium">
                      {visit.status === 'checked_out' && visit.duration ? (
                        <>
                          {Math.floor(visit.duration / 60)}h{' '}
                          {visit.duration % 60}m
                        </>
                      ) : visit.status === 'checked_in' ? (
                        <span className="text-green-400">In progress</span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
