'use client'

import { Building, TrendingUp } from 'lucide-react'

interface TopDepartment {
  name: string
  count: number
}

interface TopDepartmentsSectionProps {
  departments: TopDepartment[]
  isLoading?: boolean
}

export function TopDepartmentsSection({
  departments,
  isLoading = false,
}: TopDepartmentsSectionProps) {
  if (isLoading || departments.length === 0) {
    return null
  }

  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} className="text-purple-400" />
        <h2 className="text-xl font-bold text-slate-50">
          Top Departments Visited
        </h2>
      </div>

      <div className="space-y-3">
        {departments.map((dept, index) => (
          <div key={dept.name} className="flex items-center gap-4">
            {/* Rank Badge */}
            <div className="flex-shrink-0">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                  ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                      : index === 1
                        ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                        : 'bg-gradient-to-br from-orange-600 to-red-700'
                  }
                `}
              >
                {index + 1}
              </div>
            </div>

            {/* Department Name and Count */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Building size={16} className="text-slate-400 flex-shrink-0" />
                <p className="text-slate-50 font-medium truncate">
                  {dept.name}
                </p>
              </div>
              <p className="text-sm text-slate-500">
                {dept.count} visit{dept.count !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Visit Count Bar */}
            <div className="flex-shrink-0 w-12">
              <div className="bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400 w-full'
                      : `bg-gradient-to-r from-purple-400 to-blue-400 w-${
                          Math.max(20, (dept.count / departments[0].count) * 100)
                        }%`
                  }`}
                  style={{
                    width: `${(dept.count / departments[0].count) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TopDepartmentsSectionSkeleton() {
  return (
    <div className="glass p-6 md:p-8 rounded-lg border border-slate-700 animate-pulse">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 bg-slate-700/50 rounded" />
        <div className="h-6 bg-slate-700/50 rounded w-1/3" />
      </div>

      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-8 h-8 bg-slate-700/50 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-700/50 rounded w-1/4" />
            </div>
            <div className="flex-shrink-0 w-12 h-2 bg-slate-700/50 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
