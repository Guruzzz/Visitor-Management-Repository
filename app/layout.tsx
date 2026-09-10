import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ToastProvider } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Visitor Management System',
  description: 'Digital Visitor Management & Premises Monitoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <div className="fixed inset-0 -z-10 h-full w-full bg-gradient-radial from-slate-900 via-slate-950 to-slate-950" />
        <div className="fixed inset-0 -z-10 bg-aurora opacity-20" />
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
