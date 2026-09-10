/**
 * Utility for implementing retry logic with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: Error) => void
  shouldRetry?: (error: any) => boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  onRetry: () => {},
  shouldRetry: (error) => {
    // Retry on network errors and 5xx server errors
    // Don't retry on 4xx client errors (except 408, 429)
    if (error.response?.status) {
      const status = error.response.status
      return status >= 500 || status === 408 || status === 429
    }
    // Retry on network errors
    return error instanceof TypeError || error.message.includes('NetworkError')
  },
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise resolving to function result
 * @throws Error if all retry attempts fail
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   () => fetch('/api/data'),
 *   { maxAttempts: 3 }
 * )
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if we should retry
      if (attempt === config.maxAttempts || !config.shouldRetry(error)) {
        throw lastError
      }

      // Calculate exponential backoff delay
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelayMs,
      )

      // Add jitter (random variation) to prevent thundering herd
      const jitterMs = Math.random() * delayMs * 0.1
      const totalDelayMs = delayMs + jitterMs

      config.onRetry(attempt, lastError)

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, totalDelayMs))
    }
  }

  throw lastError || new Error('Unknown error during retry')
}

/**
 * Check if an error is a 401 Unauthorized error (token expired)
 */
export function isAuthError(error: any): boolean {
  return error?.response?.status === 401 || error?.status === 401
}

/**
 * Wrap an async function with automatic token refresh on 401
 *
 * @param fn - Async function that may receive a 401
 * @param onTokenRefresh - Callback to refresh the auth token
 * @returns Promise resolving to function result with retry on 401
 *
 * @example
 * ```ts
 * const result = await withAuthRefresh(
 *   () => fetch('/api/protected'),
 *   () => supabase.auth.refreshSession()
 * )
 * ```
 */
export async function withAuthRefresh<T>(
  fn: () => Promise<T>,
  onTokenRefresh: () => Promise<void>,
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (isAuthError(error)) {
      // Token might be expired, try to refresh
      try {
        await onTokenRefresh()
        // Retry the original request
        return await fn()
      } catch (refreshError) {
        // If token refresh fails, throw the original error
        throw error
      }
    }
    throw error
  }
}

/**
 * Create a retry wrapper for a specific API call pattern
 *
 * @example
 * ```ts
 * const fetchUserWithRetry = createRetry(
 *   (userId: string) => supabase.from('users').select().eq('id', userId)
 * )
 * const user = await fetchUserWithRetry('123')
 * ```
 */
export function createRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options?: RetryOptions,
) {
  return (...args: T) => withRetry(() => fn(...args), options)
}
