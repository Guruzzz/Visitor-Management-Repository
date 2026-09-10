'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { X, Loader } from 'lucide-react'

interface QRScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onError, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isScanning, setIsScanning] = useState(true)
  const [cameraError, setCameraError] = useState<string>()

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
            scanQRCode()
          }
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to access camera. Please check permissions.'
        setCameraError(message)
        onError?.(message)
        setIsScanning(false)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [onError])

  const scanQRCode = () => {
    if (
      videoRef.current &&
      canvasRef.current &&
      videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
    ) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight

        context.drawImage(videoRef.current, 0, 0)
        const imageData = context.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        )
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          setIsScanning(false)
          onScan(code.data)
          return
        }
      }
    }

    animationRef.current = requestAnimationFrame(scanQRCode)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl overflow-hidden max-w-md w-full glass">
        <div className="relative aspect-square bg-slate-950 overflow-hidden">
          {cameraError ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div>
                <p className="text-slate-400 mb-4">{cameraError}</p>
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-transparent to-blue-500/20">
                  <div className="w-48 h-48 border-2 border-blue-400 rounded-lg mb-6 animate-pulse" />
                  <div className="flex items-center gap-2 text-slate-300">
                    <Loader size={20} className="animate-spin" />
                    <span className="text-sm font-medium">
                      Scanning QR Code
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6">
          <p className="text-slate-400 text-sm text-center mb-4">
            {cameraError
              ? 'Camera access denied'
              : 'Point your camera at a QR code'}
          </p>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            <X size={18} />
            <span>Close Scanner</span>
          </button>
        </div>
      </div>
    </div>
  )
}
