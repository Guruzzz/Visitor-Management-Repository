'use client'

import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/utils'

interface DurationDisplayProps {
  status: 'checked_in' | 'checked_out'
  checkInAt: string
  checkOutAt?: string | null
  duration?: number | null
}

export function DurationDisplay({
  status,
  checkInAt,
  checkOutAt,
  duration,
}: DurationDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState<string>('')

  useEffect(() => {
    // For completed visits, use the stored duration
    if (status === 'checked_out' && duration !== undefined && duration !== null) {
      setElapsedTime(formatDuration(duration))
      return
    }

    // For active visits, calculate elapsed time
    if (status === 'checked_in') {
      const calculateElapsed = () => {
        const now = new Date()
        const checkIn = new Date(checkInAt)
        const minutes = Math.round(
          (now.getTime() - checkIn.getTime()) / 60000
        )
        setElapsedTime(formatDuration(Math.max(0, minutes)))
      }

      calculateElapsed()
      const interval = setInterval(calculateElapsed, 60000) // Update every 60 seconds

      return () => clearInterval(interval)
    }
  }, [status, checkInAt, checkOutAt, duration])

  return <span className="text-sm font-medium text-blue-400">{elapsedTime}</span>
}
