'use client'

import { useEffect, useState } from 'react'
import { formatDuration } from '@/lib/utils'

interface DurationDisplayProps {
  status: 'checked_in' | 'checked_out'
  checkInAt: string
  checkOutAt?: string | null
  duration?: number | null
  elapsedSeconds?: number
}

export function DurationDisplay({
  status,
  checkInAt,
  checkOutAt,
  duration,
  elapsedSeconds,
}: DurationDisplayProps) {
  const [elapsedTime, setElapsedTime] = useState<string>('')

  useEffect(() => {
    // For completed visits, use the stored duration
    if (status === 'checked_out' && duration !== undefined && duration !== null) {
      setElapsedTime(formatDuration(duration))
      return
    }

    // For active visits, use provided elapsedSeconds or calculate
    if (status === 'checked_in') {
      if (elapsedSeconds !== undefined) {
        // Convert seconds to minutes for formatDuration
        const minutes = Math.floor(elapsedSeconds / 60)
        setElapsedTime(formatDuration(minutes))
      } else {
        // Fallback: calculate elapsed time locally
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
    }
  }, [status, checkInAt, checkOutAt, duration, elapsedSeconds])

  return <span className="text-sm font-medium text-blue-400">{elapsedTime}</span>
}
