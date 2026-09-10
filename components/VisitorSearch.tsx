'use client'

import { useState, useEffect } from 'react'
import { searchVisitors, getVisitHistory } from '@/lib/visitors'
import { Search, Loader, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { Visitor, Visit } from '@/lib/visitors'

interface VisitorSearchProps {
  onVisitorSelect?: (visitorId: string) => void
}

const RESULTS_PER_PAGE = 25

export function VisitorSearch({ onVisitorSelect }: VisitorSearchProps) {
  const [searchType, setSearchType] = useState<
    'name' | 'phone' | 'id' | 'company' | 'visitor_id'
  >('name')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Visitor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)
  const [visitHistory, setVisitHistory] = useState<Visit[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Search visitors
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      setError('Please enter a search query')
      setResults([])
      return
    }

    setIsLoading(true)
    setError(null)
    setCurrentPage(1)
    setSelectedVisitor(null)

    try {
      const data = await searchVisitors(searchType, query)
      if (data.length === 0) {
        setError(`No visitors found matching "${query}"`)
      }
      setResults(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to search visitors'
      )
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load visit history when visitor is selected
  useEffect(() => {
    if (!selectedVisitor) return

    const loadHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const history = await getVisitHistory(selectedVisitor.id)
        setVisitHistory(history)
      } catch (err) {
        console.error('Failed to load visit history:', err)
        setVisitHistory([])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [selectedVisitor])

  // Pagination
  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE)
  const startIdx = (currentPage - 1) * RESULTS_PER_PAGE
  const endIdx = startIdx + RESULTS_PER_PAGE
  const paginatedResults = results.slice(startIdx, endIdx)

  if (selectedVisitor) {
    return (
      <VisitorDetailView
        visitor={selectedVisitor}
        visitHistory={visitHistory}
        isLoadingHistory={isLoadingHistory}
        onBack={() => {
          setSelectedVisitor(null)
          setVisitHistory([])
        }}
        onCheckIn={() => {
          if (onVisitorSelect) {
            onVisitorSelect(selectedVisitor.id)
          }
        }}
      />
    )
  }

  return (
    <div className="glass p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Search Visitors</h2>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search By
            </label>
            <select
              value={searchType}
              onChange={(e) =>
                setSearchType(
                  e.target.value as
                    | 'name'
                    | 'phone'
                    | 'id'
                    | 'company'
                    | 'visitor_id'
                )
              }
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 focus:border-blue-500 focus:bg-slate-800"
            >
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="id">National ID</option>
              <option value="company">Company</option>
              <option value="visitor_id">Visitor ID</option>
            </select>
          </div>

          {/* Query Input */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Query
            </label>
            <input
              type="text"
              placeholder="Enter search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800"
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="mb-4 text-sm text-slate-400">
            Found {results.length} visitor{results.length !== 1 ? 's' : ''}
          </div>

          <div className="space-y-3 mb-6">
            {paginatedResults.map((visitor) => (
              <div
                key={visitor.id}
                onClick={() => setSelectedVisitor(visitor)}
                className="glass-sm p-4 hover:bg-white/10 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-50">
                      {visitor.full_name}
                    </h3>
                    <p className="text-sm text-slate-400">{visitor.company}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                      <span>{visitor.phone}</span>
                      <span>{visitor.visitor_number}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-400">
                      {format(new Date(visitor.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && results.length === 0 && !error && (
        <div className="text-center py-12 text-slate-400">
          <Search size={48} className="mx-auto mb-4 opacity-50" />
          <p>Enter a search query to find visitors</p>
        </div>
      )}
    </div>
  )
}

// Visitor Detail View Component
interface VisitorDetailViewProps {
  visitor: Visitor
  visitHistory: Visit[]
  isLoadingHistory: boolean
  onBack: () => void
  onCheckIn: () => void
}

function VisitorDetailView({
  visitor,
  visitHistory,
  isLoadingHistory,
  onBack,
  onCheckIn,
}: VisitorDetailViewProps) {
  const lastVisit = visitHistory[0]
  const totalVisits = visitHistory.length

  return (
    <div className="glass p-6 md:p-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ChevronLeft size={18} />
        Back to Search
      </button>

      {/* Visitor Info Card */}
      <div className="glass-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">{visitor.full_name}</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Visitor ID</p>
                <p className="text-slate-50 font-mono">{visitor.visitor_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Company</p>
                <p className="text-slate-50">{visitor.company}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Phone</p>
                <p className="text-slate-50">{visitor.phone}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">National ID</p>
                <p className="text-slate-50 font-mono">{visitor.national_id}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-slate-800/50 rounded-lg p-6 mb-4">
              <p className="text-sm text-slate-400 mb-2">Total Visits</p>
              <p className="text-3xl font-bold text-blue-400">{totalVisits}</p>
            </div>
            {lastVisit && (
              <div className="bg-slate-800/50 rounded-lg p-6">
                <p className="text-sm text-slate-400 mb-2">Last Visit</p>
                <p className="text-slate-50">
                  {format(new Date(lastVisit.check_in_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Check-in Button */}
        <button
          onClick={onCheckIn}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
        >
          Check In Visitor
        </button>
      </div>

      {/* Visit History */}
      <div className="glass-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Visit History</h3>

        {isLoadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader size={24} className="animate-spin text-slate-400" />
          </div>
        ) : visitHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No visit history available</p>
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
                    className="border-b border-slate-700/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {format(new Date(visit.check_in_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3">{visit.person_being_visited}</td>
                    <td className="px-4 py-3">{visit.department}</td>
                    <td className="px-4 py-3 text-xs">
                      {format(new Date(visit.check_in_at), 'HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {visit.check_out_at
                        ? format(new Date(visit.check_out_at), 'HH:mm')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {visit.duration
                        ? `${Math.floor(visit.duration / 60)}h ${visit.duration % 60}m`
                        : '—'}
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
