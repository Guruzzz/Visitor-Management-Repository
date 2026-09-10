'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useRouter } from 'next/navigation'
import { BarChart3, Lock } from 'lucide-react'

export default function ReportsPage() {
  const { role, loading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalVisits: 0,
    averageStayDuration: 0,
    currentlyInside: 0,
  })
  const [topCompanies, setTopCompanies] = useState<{ name: string; count: number }[]>([])
  const [topDepartments, setTopDepartments] = useState<{ name: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Redirect non-admins away
  useEffect(() => {
    if (!loading && role !== null && role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [loading, role, router])

  useEffect(() => {
    if (role !== 'admin') return

    const loadStats = async () => {
      try {
        const { count: visitorCount } = await supabase
          .from('visitors')
          .select('*', { count: 'exact', head: true })

        const { count: visitCount } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })

        const { count: insideCount } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'checked_in')

        const { data: durations } = await supabase
          .from('visits')
          .select('duration')
          .not('duration', 'is', null)
          .eq('status', 'checked_out')

        const avgDuration =
          durations && durations.length > 0
            ? durations.reduce((sum, v) => sum + (v.duration ?? 0), 0) / durations.length
            : 0

        setStats({
          totalVisitors: visitorCount ?? 0,
          totalVisits: visitCount ?? 0,
          averageStayDuration: Math.round(avgDuration),
          currentlyInside: insideCount ?? 0,
        })

        // Top companies
        const { data: companyData } = await supabase.from('visitors').select('company')
        const companyCounts = new Map<string, number>()
        companyData?.forEach((v) => {
          companyCounts.set(v.company, (companyCounts.get(v.company) ?? 0) + 1)
        })
        setTopCompanies(
          Array.from(companyCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        )

        // Top departments
        const { data: deptData } = await supabase.from('visits').select('department')
        const deptCounts = new Map<string, number>()
        deptData?.forEach((v) => {
          deptCounts.set(v.department, (deptCounts.get(v.department) ?? 0) + 1)
        })
        setTopDepartments(
          Array.from(deptCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
        )
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [role])

  // Show access denied while role loads or for non-admins
  if (loading || role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-10 rounded-2xl text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="bg-red-500/20 p-4 rounded-full">
              <Lock size={32} className="text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-50 mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm">
            Reports & Analytics are only available to administrators.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="text-blue-400" size={32} />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Reports & Analytics
          </span>
        </h1>
        <p className="text-slate-400">Visitor management statistics and insights</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-48 bg-slate-700 rounded" />
            <div className="h-4 w-32 bg-slate-700 rounded" />
          </div>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Visitors', value: stats.totalVisitors, color: 'text-slate-50' },
              { label: 'Total Visits', value: stats.totalVisits, color: 'text-slate-50' },
              { label: 'Currently Inside', value: stats.currentlyInside, color: 'text-green-400' },
              { label: 'Avg. Stay (min)', value: stats.averageStayDuration, color: 'text-blue-400' },
            ].map((s) => (
              <div key={s.label} className="glass p-6">
                <p className="text-slate-400 text-xs mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top companies */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold mb-6 text-slate-50">Top Companies</h3>
              {topCompanies.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-sm">No data yet</p>
              ) : (
                <div className="space-y-4">
                  {topCompanies.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-slate-300 text-sm flex-1 truncate">{c.name}</span>
                      <div className="w-28 bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                          style={{ width: `${(c.count / topCompanies[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm w-6 text-right">{c.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top departments */}
            <div className="glass p-6 md:p-8">
              <h3 className="text-lg font-bold mb-6 text-slate-50">Top Departments</h3>
              {topDepartments.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-sm">No data yet</p>
              ) : (
                <div className="space-y-4">
                  {topDepartments.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-slate-300 text-sm flex-1 truncate">{d.name}</span>
                      <div className="w-28 bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${(d.count / topDepartments[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm w-6 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
