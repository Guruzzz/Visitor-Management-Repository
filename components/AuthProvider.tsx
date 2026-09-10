'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserRole = 'admin' | 'reception' | 'security'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()          // returns null instead of error when row missing

    if (error) {
      console.error('[AuthProvider] fetchProfile error:', error.message, error.code)
      return null
    }
    return data as Profile | null
  } catch (err) {
    console.error('[AuthProvider] fetchProfile exception:', err)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state on mount — fetch profile BEFORE clearing loading
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
          // Wait for profile before showing the app
          const p = await fetchProfile(currentSession.user.id)
          setProfile(p)
        }
      } catch (error) {
        console.error('[AuthProvider] init error:', error)
      } finally {
        setLoading(false)   // only clear loading AFTER profile fetch
      }
    }
    initializeAuth()
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setSession(session)
          setUser(session.user)
          // Fetch profile BEFORE clearing loading so role is ready on first render
          const p = await fetchProfile(session.user.id)
          setProfile(p)
          setLoading(false)
          if (pathname !== '/dashboard' && !pathname.startsWith('/dashboard/')) {
            router.push('/dashboard')
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          if (pathname !== '/login') {
            router.push('/login')
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session)
          setUser(session.user)
          setLoading(false)
        } else if (event === 'USER_UPDATED' && session) {
          setSession(session)
          setUser(session.user)
          const p = await fetchProfile(session.user.id)
          setProfile(p)
        }
      }
    )
    return () => { subscription?.unsubscribe() }
  }, [router, pathname])

  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('[AuthProvider] signOut error:', error)
      throw error
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role: (profile?.role as UserRole) ?? null,
        loading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
