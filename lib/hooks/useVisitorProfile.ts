'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getVisitor, getVisitHistory, calculateStatistics } from '@/lib/visitors'
import { withRetry } from '@/lib/retry'
import type { Visitor, Visit } from '@/lib/visitors'

interface VisitorStatistics {
  total_visits: number
  completed_visits: number
  active_visits: number
  average_duration_minutes: number | null
  top_departments: Array<{ name: string; count: number }>
}

interface UseVisitorProfileReturn {
  visitor: Visitor | null
  statistics: VisitorStatistics | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for fetching and subscribing to visitor profile data with aggregated statistics
 * 
 * **Validates: Requirements 1.1, 4.1, 4.2, 4.3, 4.4, 4.5**
 * 
 * @param visitorId - UUID of the visitor to fetch
 * @returns Object containing visitor data, statistics, loading state, error state, and refetch function
 */
export function useVisitorProfile(visitorId: string): UseVisitorProfileReturn {
  const [visitor, setVisitor] = useState<Visitor | null>(null)
  const [statistics, setStatistics] = useState<VisitorStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data and subscribe to updates
  useEffect(() => {
    let unsubscribeVisitor: (() => void) | null = null
    let unsubscribeVisits: (() => void) | null = null

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch visitor data with retry
        const visitorData = await withRetry(
          () => getVisitor(visitorId),
          { maxAttempts: 3 }
        )

        // Fetch visit history with retry
        const visitHistory = await withRetry(
          () => getVisitHistory(visitorId),
          { maxAttempts: 3 }
        )

        setVisitor(visitorData)

        // Calculate statistics from visit history
        const stats = calculateStatistics(visitHistory || [])
        setStatistics(stats)

        // Subscribe to visitor updates
        unsubscribeVisitor = subscribeToVisitorUpdates(visitorId, (updatedVisitor) => {
          setVisitor(updatedVisitor)
        })

        // Subscribe to visit changes
        unsubscribeVisits = subscribeToVisitorVisits(visitorId, (updatedVisits) => {
          const updatedStats = calculateStatistics(updatedVisits)
          setStatistics(updatedStats)
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load visitor profile'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Cleanup subscriptions on unmount or visitorId change
    return () => {
      unsubscribeVisitor?.()
      unsubscribeVisits?.()
    }
  }, [visitorId])

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const visitorData = await withRetry(
        () => getVisitor(visitorId),
        { maxAttempts: 3 }
      )

      const visitHistory = await withRetry(
        () => getVisitHistory(visitorId),
        { maxAttempts: 3 }
      )

      setVisitor(visitorData)

      const stats = calculateStatistics(visitHistory || [])
      setStatistics(stats)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to refetch visitor profile'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [visitorId])

  return {
    visitor,
    statistics,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Subscribe to visitor record updates
 * @internal
 */
function subscribeToVisitorUpdates(
  visitorId: string,
  callback: (visitor: Visitor) => void
): () => void {
  const channel = supabase
    .channel(`visitor:${visitorId}`)
    .on(
      'postgres_changes' as any,
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'visitors',
        filter: `id=eq.${visitorId}`,
      },
      (payload) => {
        callback(payload.new as Visitor)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

/**
 * Subscribe to visit changes for a specific visitor
 * @internal
 */
function subscribeToVisitorVisits(
  visitorId: string,
  callback: (visits: Visit[]) => void
): () => void {
  const channel = supabase
    .channel(`visits:${visitorId}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'visits',
        filter: `visitor_id=eq.${visitorId}`,
      },
      async () => {
        // Re-fetch visits to get updated data
        const { data, error } = await supabase
          .from('visits')
          .select('*')
          .eq('visitor_id', visitorId)
          .order('check_in_at', { ascending: false })

        if (!error && data) {
          callback(data as Visit[])
        }
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}
