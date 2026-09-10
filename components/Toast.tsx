'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9)
    const duration = toast.duration ?? 5000

    setToasts((prev) => [...prev, { ...toast, id }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const iconMap = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    info: <Info size={20} className="text-blue-400" />,
    loading: (
      <div className="animate-spin">
        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
      </div>
    ),
  }

  const bgMap = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    info: 'bg-blue-500/10 border-blue-500/30',
    loading: 'bg-blue-500/10 border-blue-500/30',
  }

  const textMap = {
    success: 'text-green-200',
    error: 'text-red-200',
    info: 'text-blue-200',
    loading: 'text-blue-200',
  }

  return (
    <div
      className={`glass p-4 border rounded-lg pointer-events-auto transform transition-all duration-300 ${bgMap[toast.type]} ${textMap[toast.type]}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{toast.message}</p>
          {toast.description && (
            <p className="text-xs opacity-90 mt-1">{toast.description}</p>
          )}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-semibold hover:opacity-100 opacity-80 transition-opacity underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
