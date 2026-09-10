'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
      setIsLoading(false)
    }

    checkSession()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-slate-700 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass p-8 md:p-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-2">
              Visitor Management
            </h1>
            <p className="text-slate-400">
              Digital premises monitoring system
            </p>
          </div>

          <div className="[&_label]:!text-slate-300 [&_label]:!font-medium [&_label]:!text-sm">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#3b82f6',
                      brandAccent: '#1e40af',
                      brandButtonText: 'white',
                      defaultButtonBackground: '#1f2937',
                      defaultButtonBackgroundHover: '#374151',
                      defaultButtonBorder: '#4b5563',
                      defaultButtonText: '#f1f5f9',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  input:
                    '!bg-slate-800 !border-slate-700 !text-slate-50 !rounded-lg focus:!border-blue-500 focus:!shadow-blue-500/20',
                  button:
                    '!rounded-lg !font-medium !py-2 !text-sm !transition-all !duration-200 hover:!shadow-lg hover:!shadow-blue-500/20',
                  anchor: '!text-blue-400 hover:!text-blue-300',
                },
              }}
              providers={[]}
              view="sign_in"
              theme="dark"
            />
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700/50 text-center">
            <p className="text-slate-400 text-sm">
              @Salto Developers 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
