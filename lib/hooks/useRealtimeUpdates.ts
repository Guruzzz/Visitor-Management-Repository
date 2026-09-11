'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Visit } from '@/lib/visitors'

interface UseRealtimeUpdatesReturn {
  elapsedTimes: Record<string, number> // visitId -> elapsed seconds
  updateElapsedTimes: (visits: Visit[]) => void
}

/**
 * Hook for real-time elapsed time updates for active visits
 * 
 * **Validates: Requirements 2.6, 5.3**
 * 
 * Updates elapsed time every 60 seconds for all active (checked_in) visits
 * 
 * @param visits - Array of visits to track elapsed time for
 * @returns Object containing elapsed times and update function
 */
export function useRealtimeUpdates(visits: Visit[]): UseRealtimeUpdatesReturn {
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({})

  // Initial calculation of elapsed times
  const calculateElapsedTimes = useCallback(() => {
    const times: Record<string, number> = {}
    const now = Date.now()

    visits.forEach((visit) => {
      if (visit.status === 'checked_in' && visit.check_in_at) {
        const checkInTime = new Date(visit.check_in_at).getTime()
        const elapsedSeconds = Math.floor((now - checkInTime) / 1000)
        times[visit.id] = Math.max(0, elapsedSeconds)
      }
    })

    setElapsedTimes(times)
  }, [visits])

  // Set up interval to update elapsed times every 60 seconds
  useEffect(() => {
    calculateElapsedTimes()

    const interval = setInterval(() => {
      calculateElapsedTimes()
    }, 60000) // 60 second update interval

    return () => clearInterval(interval)
  }, [calculateElapsedTimes])

  const updateElapsedTimes = useCallback((newVisits: Visit[]) => {
    const times: Record<string, number> = {}
    const now = Date.now()

    newVisits.forEach((visit) => {
      if (visit.status === 'checked_in' && visit.check_in_at) {
        const checkInTime = new Date(visit.check_in_at).getTime()
        const elapsedSeconds = Math.floor((now - checkInTime) / 1000)
        times[visit.id] = Math.max(0, elapsedSeconds)
      }
    })

    setElapsedTimes(times)
  }, [])

  return {
    elapsedTimes,
    updateElapsedTimes,
  }
}

/**
 * Calculate elapsed time in seconds for an active visit
 * @internal
 */
export function calculateElapsedSeconds(checkInTime: string): number {
  const checkIn = new Date(checkInTime).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - checkIn) / 1000))
}

/**
 * Convert seconds to human-readable duration format
 * @internal
 */
export function formatElapsedTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}
