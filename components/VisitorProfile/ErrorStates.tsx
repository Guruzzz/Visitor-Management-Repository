import { AlertCircle, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorStateProps {
  error: string
  onRetry?: () => void
  showRetry?: boolean
}

/**
 * Error state display component for visitor profile page
 * 
 * **Validates: Requirements 3.4, 7.4**
 */
export function ErrorState({ error, onRetry, showRetry = true }: ErrorStateProps) {
  const is404 = error.toLowerCase().includes('not found')

  return (
    <div className="glass p-8 rounded-lg border border-red-500/30 bg-red-500/10">
      <div className="flex items-start gap-4">
        <AlertCircle size={24} className="text-red-400 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-red-300 mb-2">
            {is404 ? 'Visitor Not Found' : 'Error Loading Profile'}
          </h2>
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 flex-wrap">
            {showRetry && onRetry && !is404 && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Retry
              </button>
            )}
            <Link
              href="/dashboard/visitors"
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/10 transition-colors font-medium"
            >
              <Home size={18} />
              Return to Visitors
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Generic error display for page-level errors
 */
export function PageErrorState({
  title = 'Error',
  message,
  onRetry,
  showRetry = true,
}: {
  title?: string
  message: string
  onRetry?: () => void
  showRetry?: boolean
}) {
  return (
    <div className="glass p-8 rounded-lg border border-red-500/30 bg-red-500/10 text-center">
      <AlertCircle size={32} className="mx-auto mb-4 text-red-400" />
      <h2 className="text-lg font-semibold text-red-300 mb-2">{title}</h2>
      <p className="text-sm text-red-400 mb-6">{message}</p>
      <div className="flex gap-3 justify-center flex-wrap">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Retry
          </button>
        )}
        <Link
          href="/dashboard/visitors"
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-500/50 text-red-300 rounded-lg hover:bg-red-500/10 transition-colors font-medium"
        >
          <Home size={18} />
          Return to Visitors
        </Link>
      </div>
    </div>
  )
}

/**
 * Error state when visitor is not found (404)
 */
export function VisitorNotFoundError() {
  return (
    <div className="glass p-8 rounded-lg border border-red-500/30 bg-red-500/10 text-center">
      <AlertCircle size={32} className="mx-auto mb-4 text-red-400" />
      <h2 className="text-lg font-semibold text-red-300 mb-2">Visitor Not Found</h2>
      <p className="text-sm text-red-400 mb-6">
        The visitor you are looking for does not exist or has been removed.
      </p>
      <Link
        href="/dashboard/visitors"
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
      >
        <Home size={18} />
        Return to Visitors
      </Link>
    </div>
  )
}

/**
 * Error state for section-level errors (e.g., history loading error)
 */
export function SectionErrorState({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <div className="glass p-6 rounded-lg border border-red-500/20 bg-red-500/5">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-300 mb-1">{title}</h3>
          <p className="text-sm text-red-400 mb-3">{message}</p>
          <button
            onClick={onRetry}
            className="text-sm px-3 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
