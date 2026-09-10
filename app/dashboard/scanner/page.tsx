'use client'

import { useState } from 'react'
import { QRScanner } from '@/components/QRScanner'
import { QrCode, Check } from 'lucide-react'
import { getVisitByReference, checkOutVisit } from '@/lib/visitors'

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedVisit, setScannedVisit] = useState<any>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState<string>()

  const handleScan = async (code: string) => {
    setIsScanning(false)
    try {
      const visit = await getVisitByReference(code)
      setScannedVisit(visit)
    } catch (error) {
      setCheckoutMessage('Visit not found')
      setTimeout(() => setCheckoutMessage(undefined), 3000)
    }
  }

  const handleCheckOut = async () => {
    if (!scannedVisit) return

    setIsCheckingOut(true)
    try {
      await checkOutVisit(scannedVisit.id)
      setCheckoutMessage('Checked out successfully!')
      setTimeout(() => {
        setScannedVisit(null)
        setCheckoutMessage(undefined)
      }, 2000)
    } catch (error) {
      setCheckoutMessage('Check-out failed. Try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <QrCode className="text-blue-400" size={32} />
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            QR Scanner
          </span>
        </h1>
        <p className="text-slate-400">
          Scan visitor passes for check-in/check-out
        </p>
      </div>

      {isScanning && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}

      <div className="max-w-2xl">
        {!scannedVisit ? (
          <button
            onClick={() => setIsScanning(true)}
            className="w-full glass p-12 md:p-16 rounded-2xl border-2 border-dashed border-blue-500/30 hover:border-blue-500/50 transition-all duration-200 flex flex-col items-center justify-center gap-4 text-center"
          >
            <QrCode size={48} className="text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-slate-50 mb-2">
                Tap to Start Scanning
              </h2>
              <p className="text-slate-400">
                Point your camera at a visitor QR code
              </p>
            </div>
          </button>
        ) : (
          <div className="glass p-8 md:p-12">
            <div className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
              <p className="text-green-400 font-medium mb-2">✓ Pass Scanned</p>
              <p className="text-slate-300 text-sm">
                {scannedVisit.visit_reference}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <p className="text-sm text-slate-400 mb-2">Visitor</p>
                <p className="text-2xl font-bold text-slate-50">
                  {scannedVisit.visitors.full_name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Company</p>
                  <p className="font-semibold text-slate-50">
                    {scannedVisit.visitors.company}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Department</p>
                  <p className="font-semibold text-slate-50">
                    {scannedVisit.department}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">
                    Person Being Visited
                  </p>
                  <p className="font-semibold text-slate-50">
                    {scannedVisit.person_being_visited}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Status</p>
                  <p className="font-semibold text-green-400">
                    {scannedVisit.status}
                  </p>
                </div>
              </div>
            </div>

            {checkoutMessage && (
              <div
                className={`p-4 rounded-lg mb-6 text-center font-medium ${
                  checkoutMessage.includes('successfully')
                    ? 'bg-green-500/10 border border-green-500/30 text-green-200'
                    : 'bg-red-500/10 border border-red-500/30 text-red-200'
                }`}
              >
                {checkoutMessage}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setScannedVisit(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Scan Another
              </button>

              {scannedVisit.status === 'checked_in' && (
                <button
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Check size={20} />
                  {isCheckingOut ? 'Checking Out...' : 'Check Out'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
