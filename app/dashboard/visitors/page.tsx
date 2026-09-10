'use client'

import { useState } from 'react'
import { VisitorRegistrationForm } from '@/components/VisitorRegistrationForm'
import { VisitCheckInForm } from '@/components/VisitCheckInForm'
import { QRCodeGenerator } from '@/components/QRCodeGenerator'
import { Users, Plus } from 'lucide-react'

export default function VisitorsPage() {
  const [view, setView] = useState<
    'register' | 'checkin' | 'pass' | 'history'
  >('register')
  const [selectedVisitorId, setSelectedVisitorId] = useState<string>()
  const [selectedVisitorName, setSelectedVisitorName] = useState<string>()
  const [qrCode, setQrCode] = useState<string>()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Users className="text-blue-400" size={32} />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Visitor Management
          </span>
        </h1>
        <p className="text-slate-400">
          Register visitors and manage check-ins
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            id: 'register',
            label: 'Register Visitor',
            icon: Plus,
            color: 'blue',
          },
          {
            id: 'checkin',
            label: 'Check-In',
            icon: Plus,
            color: 'green',
          },
          {
            id: 'pass',
            label: 'Digital Pass',
            icon: Plus,
            color: 'purple',
          },
          {
            id: 'history',
            label: 'History',
            icon: Plus,
            color: 'slate',
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setView(tab.id as typeof view)
              setSelectedVisitorId(undefined)
              setSelectedVisitorName(undefined)
              setQrCode(undefined)
            }}
            className={`p-4 rounded-lg font-medium transition-all duration-200 ${
              view === tab.id
                ? `bg-${tab.color}-600 text-white`
                : 'glass text-slate-300 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        {view === 'register' && (
          <VisitorRegistrationForm
            onSuccess={(visitorId, visitorName) => {
              setSelectedVisitorId(visitorId)
              setSelectedVisitorName(visitorName)
              setView('checkin')
            }}
          />
        )}

        {view === 'checkin' && selectedVisitorId && (
          <VisitCheckInForm
            visitorId={selectedVisitorId}
            visitorName={selectedVisitorName || 'Visitor'}
            onSuccess={(_, visitReference) => {
              setQrCode(visitReference)
              setView('pass')
            }}
          />
        )}

        {view === 'pass' && qrCode && (
          <QRCodeGenerator
            value={qrCode}
            title="Digital Visitor Pass"
            visitorName={selectedVisitorName}
          />
        )}

        {view === 'history' && (
          <div className="glass p-6 md:p-8 text-center">
            <p className="text-slate-400">
              Visitor history coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
