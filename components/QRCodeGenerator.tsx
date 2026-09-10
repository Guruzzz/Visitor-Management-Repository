'use client'

import QRCode from 'qrcode.react'
import { useRef } from 'react'
import { Download } from 'lucide-react'

interface QRCodeGeneratorProps {
  value: string
  title?: string
  visitorName?: string
}

export function QRCodeGenerator({
  value,
  title = 'Visit Pass',
  visitorName,
}: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `visit-pass-${value}.png`
        link.click()
      }
    }
  }

  return (
    <div className="glass p-6 md:p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2">{title}</h2>
        {visitorName && (
          <p className="text-slate-400 text-sm md:text-base">{visitorName}</p>
        )}
      </div>

      <div
        ref={qrRef}
        className="flex justify-center mb-6 p-4 bg-white rounded-lg"
      >
        <QRCode
          value={value}
          size={200}
          level="H"
          includeMargin={true}
          renderAs="canvas"
        />
      </div>

      <div className="text-center mb-6">
        <p className="text-slate-400 text-xs md:text-sm font-mono break-all">
          {value}
        </p>
      </div>

      <button
        onClick={downloadQRCode}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 md:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
      >
        <Download size={18} />
        <span>Download Pass</span>
      </button>
    </div>
  )
}
