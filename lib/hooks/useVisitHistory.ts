'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getVisitHistoryPaginated } from '@/lib/visitors'
import { withRetry } from '@/lib/retry'
import type { Visit } from '@/lib/visitors'

interface UseVisitHistoryReturn {
  visits: Visit[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refetch: () => Promise<void>
}

const PAGE_SIZE = 10

/**
 * Hook for fetching and managing paginated visit history with real-time subscriptions
 * 
 * **Validates: Requirements 2.1, 2.4, 5.2**
 * 
 * @param visitorId - UUID of the visitor
 * @param initialPageSize - Number of visits per page (default: 10)
 * @returns Object containing visits, loading state, error state, pagination controls
 */
export function useVisitHistory(
  visitorId: string,
  initialPageSize: number = PAGE_SIZE
): UseVisitHistoryReturn {
  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // Fetch initial page of visits
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const fetchInitialPage = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setCurrentPage(0)

        // Fetch first page
        const initialVisits = await withRetry(
          () => getVisitHistoryPaginated(visitorId, 0, initialPageSize),
          { maxAttempts: 3 }
        )

        setVisits(initialVisits || [])

        // Check if there are more visits available
        if (initialVisits && initialVisits.length === initialPageSize) {
          // Try to fetch next page to determine if hasMore
          const nextPageVisits = await withRetry(
            () => getVisitHistoryPaginated(visitorId, 1, 1),
            { maxAttempts: 3 }
          )
          setHasMore((nextPageVisits?.length || 0) > 0)
        } else {
          setHasMore(false)
        }

        // Subscribe to new visits for this visitor
        unsubscribe = subscribeToNewVisits(visitorId, (newVisits) => {
          // Prepend new visits to the list
          setVisits((prev) => [...newVisits, ...prev])
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load visit history'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialPage()

    // Cleanup subscription
    return () => {
      unsubscribe?.()
    }
  }, [visitorId, initialPageSize])

  const loadMore = useCallback(async () => {
    try {
      setError(null)
      const nextPage = currentPage + 1

      const moreVisits = await withRetry(
        () => getVisitHistoryPaginated(visitorId, nextPage, initialPageSize),
        { maxAttempts: 3 }
      )

      if (!moreVisits || moreVisits.length === 0) {
        setHasMore(false)
      } else {
        setVisits((prev) => [...prev, ...moreVisits])
        setCurrentPage(nextPage)

        // Check if there's another page after this one
        if (moreVisits.length < initialPageSize) {
          setHasMore(false)
        } else {
          // Try to fetch next page to determine if hasMore
          const checkNextPageVisits = await withRetry(
            () => getVisitHistoryPaginated(visitorId, nextPage + 1, 1),
            { maxAttempts: 3 }
          )
          setHasMore((checkNextPageVisits?.length || 0) > 0)
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load more visits'
      setError(message)
    }
  }, [visitorId, currentPage, initialPageSize])

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      setCurrentPage(0)

      const initialVisits = await withRetry(
        () => getVisitHistoryPaginated(visitorId, 0, initialPageSize),
        { maxAttempts: 3 }
      )

      setVisits(initialVisits || [])

      if (initialVisits && initialVisits.length === initialPageSize) {
        const nextPageVisits = await withRetry(
          () => getVisitHistoryPaginated(visitorId, 1, 1),
          { maxAttempts: 3 }
        )
        setHasMore((nextPageVisits?.length || 0) > 0)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to refetch visit history'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [visitorId, initialPageSize])

  return {
    visits,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  }
}

/**
 * Subscribe to new visits for a specific visitor
 * @internal
 */
function subscribeToNewVisits(
  visitorId: string,
  callback: (visits: Visit[]) => void
): () => void {
  const channel = supabase
    .channel(`visits:new:${visitorId}`)
    .on(
      'postgres_changes' as any,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'visits',
        filter: `visitor_id=eq.${visitorId}`,
      },
      async (payload) => {
        // Fetch the new visit with full data
        const newVisit = payload.new as Visit
        callback([newVisit])
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}
