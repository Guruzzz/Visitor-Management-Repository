import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock retry utility
vi.mock('@/lib/retry', () => ({
  withRetry: (fn: () => any) => fn(),
  withAuthRefresh: (fn: () => any) => fn(),
  isAuthError: vi.fn(),
  createRetry: (fn: any) => fn,
}))
