'use client'

import React, { ReactNode, ErrorInfo } from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    // Optionally reload the page
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
          <div className="glass p-8 md:p-12 max-w-md w-full rounded-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 p-4 rounded-full">
                <AlertCircle size={40} className="text-red-400" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-50 mb-2">
              Something went wrong
            </h1>

            <p className="text-slate-400 text-sm mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg text-left">
                <p className="text-xs font-mono text-red-300 break-all">
                  {this.state.error.message}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer text-slate-400 hover:text-slate-300 font-medium">
                      Stack trace (dev only)
                    </summary>
                    <pre className="mt-2 overflow-auto text-red-300 font-mono text-xs max-h-48 bg-slate-900/50 p-3 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <RotateCw size={18} />
              <span>Reload Page</span>
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
