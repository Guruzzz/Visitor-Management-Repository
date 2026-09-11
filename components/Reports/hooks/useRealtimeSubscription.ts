'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { subscribeToVisitsChanges } from '@/lib/visitors'

/**
 * Connection status for the real-time Supabase subscription.
 * - 'connecting'   : Subscribe call in progress
 * - 'connected'    : Channel subscribed successfully
 * - 'disconnected' : Hook is disabled or channel was torn down cleanly
 * - 'error'        : Subscribe threw or the channel reported an error
 */
type SubscriptionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

/**
 * Establishes and manages a Supabase real-time subscription to the visits table.
 *
 * **Validates: Requirements 12.1, 12.2, 12.5, 13.3, 13.4**
 *
 * @param onVisitChange - Callback invoked for every INSERT / UPDATE event on visits
 * @param enabled       - When false the subscription is never established (default: true)
 * @returns `{ status, error }` reflecting the current connection state
 */
export function useRealtimeSubscription(
  onVisitChange: (event: {
    type: 'INSERT' | 'UPDATE'
    visit: any
    oldVisit?: any
  }) => void,
  enabled: boolean = true
) {
  const [status, setStatus] = useState<SubscriptionStatus>(
    enabled ? 'connecting' : 'disconnected'
  )
  const [error, setError] = useState<string | null>(null)

  // Keep a ref to the active Supabase channel so we can remove it on cleanup
  const channelRef = useRef<any>(null)

  // Keep a ref to the pending reconnect timer so we can cancel it on cleanup
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Stable reference to the caller's callback — always calls the latest version
  // without needing to be listed as a dependency of the subscription effect.
  const callbackRef = useRef(onVisitChange)
  useEffect(() => {
    callbackRef.current = onVisitChange
  })

  const connect = useCallback(() => {
    // Guard: don't double-subscribe
    if (channelRef.current) return

    setStatus('connecting')
    setError(null)

    try {
      const channel = subscribeToVisitsChanges((event) => {
        callbackRef.current(event)
      })

      channelRef.current = channel

      // subscribeToVisitsChanges returns a Supabase channel. The channel's
      // subscribe() call is synchronous-ish — if it didn't throw, treat it as
      // connected. Error events come via the channel state listener below.
      channel.on('system', { event: 'disconnect' }, () => {
        setStatus('disconnected')
      })

      setStatus('connected')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Subscription failed'
      setError(message)
      setStatus('error')

      // Schedule a reconnect attempt in 5 seconds
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null
        channelRef.current = null
        connect()
      }, 5000)
    }
  }, []) // stable — no deps change identity

  const disconnect = useCallback(() => {
    // Cancel any pending reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    // Remove the Supabase channel if one is active
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    setStatus('disconnected')
  }, [])

  useEffect(() => {
    if (!enabled) {
      disconnect()
      return
    }

    connect()

    return () => {
      disconnect()
    }
    // We intentionally only re-run when `enabled` changes. `connect` and
    // `disconnect` are stable (useCallback with no deps), so including them
    // would only cause lint warnings without behavioral difference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return { status, error }
}
