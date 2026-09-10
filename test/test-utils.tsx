import React, { ReactNode } from 'react'
import { render as rtlRender } from '@testing-library/react'
import { ToastProvider } from '@/components/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface RenderOptions {
  withToast?: boolean
  withErrorBoundary?: boolean
  [key: string]: any
}

function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ErrorBoundary>
  )
}

function render(ui: React.ReactElement, { withToast = true, withErrorBoundary = false, ...renderOptions }: RenderOptions = {}) {
  if (!withToast && !withErrorBoundary) {
    return rtlRender(ui, { ...renderOptions })
  }

  if (withToast && !withErrorBoundary) {
    return rtlRender(ui, {
      wrapper: ToastProvider,
      ...renderOptions,
    })
  }

  return rtlRender(ui, {
    wrapper: AllTheProviders,
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { render }
