'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { visitorRegistrationSchema } from '@/lib/validations'
import { createVisitor } from '@/lib/visitors'
import { Loader, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/Toast'
import { withRetry } from '@/lib/retry'
import type { VisitorRegistration } from '@/lib/validations'

interface VisitorRegistrationFormProps {
  onSuccess: (visitorId: string, visitorName: string) => void
}

export function VisitorRegistrationForm({
  onSuccess,
}: VisitorRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VisitorRegistration>({
    resolver: zodResolver(visitorRegistrationSchema),
  })

  const onSubmit = async (data: VisitorRegistration) => {
    setIsSubmitting(true)
    setError(undefined)
    setSuccessMessage(undefined)

    addToast({
      type: 'loading',
      message: 'Registering visitor...',
      duration: 0,
    })

    try {
      const visitor = await withRetry(
        () => createVisitor(data),
        {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            console.warn(`Retry attempt ${attempt} for visitor registration:`, error)
          },
        }
      )

      setSuccessMessage(`Visitor ${data.full_name} registered successfully!`)
      reset()

      // Update toast
      addToast({
        type: 'success',
        message: 'Visitor registered successfully!',
        description: `${data.full_name} has been added to the system.`,
      })

      // Call onSuccess callback with the new visitor ID and name
      setTimeout(() => {
        onSuccess(visitor.id, visitor.full_name)
      }, 1500)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to register visitor'
      setError(errorMessage)

      addToast({
        type: 'error',
        message: 'Registration failed',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold mb-6">Register Visitor</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-200 text-sm flex items-center gap-2">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="John Doe"
            {...register('full_name')}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800"
          />
          {errors.full_name && (
            <p className="text-red-400 text-sm mt-1">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            {...register('phone')}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800"
          />
          {errors.phone && (
            <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            National ID / Passport *
          </label>
          <input
            type="text"
            placeholder="ABC123456"
            {...register('national_id')}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800"
          />
          {errors.national_id && (
            <p className="text-red-400 text-sm mt-1">
              {errors.national_id.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Company *
          </label>
          <input
            type="text"
            placeholder="Acme Corp"
            {...register('company')}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800"
          />
          {errors.company && (
            <p className="text-red-400 text-sm mt-1">
              {errors.company.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium py-2 md:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
      >
        {isSubmitting && <Loader size={18} className="animate-spin" />}
        <span>{isSubmitting ? 'Registering...' : 'Register Visitor'}</span>
      </button>
    </form>
  )
}
