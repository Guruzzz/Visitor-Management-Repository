'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function Home() {
  const router = useRouter()
  const { session, loading } = useAuth()

  useEffect(() => {
    if (loading) return // Don't redirect while loading

    if (session) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not authenticated, redirect to login
      router.push('/login')
    }
  }, [session, loading, router])

  // Show loading state while checking authentication
  return (
    <div className="flex h-screen items-center justify-center bg-slate-950">
      <div className="text-center">
        <div className="mb-4 inline-flex h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-slate-50" />
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
