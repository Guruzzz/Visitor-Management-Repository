'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { visitRegistrationSchema } from '@/lib/validations'
import { createVisit, getDepartments } from '@/lib/visitors'
import { Loader, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { withRetry } from '@/lib/retry'
import type { VisitRegistration } from '@/lib/validations'

interface VisitCheckInFormProps {
  visitorId: string
  visitorName: string
  onSuccess: (visitId: string, visitReference: string) => void
}

export function VisitCheckInForm({
  visitorId,
  visitorName,
  onSuccess,
}: VisitCheckInFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string; description: string | null }>
  >([])
  const { addToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VisitRegistration>({
    resolver: zodResolver(visitRegistrationSchema),
  })

  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error)
  }, [])

  const onSubmit = async (data: VisitRegistration) => {
    setIsSubmitting(true)
    setError(undefined)
    setSuccessMessage(undefined)

    addToast({
      type: 'loading',
      message: 'Checking in visitor...',
      duration: 0,
    })

    try {
      const visit = await withRetry(
        () => createVisit(visitorId, data),
        {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            console.warn(`Retry attempt ${attempt} for check-in:`, error)
          },
        }
      )

      setSuccessMessage(`Check-in successful! Visit reference: ${visit.visit_reference}`)
      reset()

      addToast({
        type: 'success',
        message: 'Check-in completed!',
        description: `Visit reference: ${visit.visit_reference}`,
      })

      // Call onSuccess callback with the new visit ID and reference
      setTimeout(() => {
        onSuccess(visit.id, visit.visit_reference)
      }, 1500)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to check in visitor'
      setError(errorMessage)

      addToast({
        type: 'error',
        message: 'Check-in failed',
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="glass p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold mb-2">Check-In Visitor</h2>
      <p className="text-slate-400 text-sm md:text-base mb-6">{visitorName}</p>

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
            Person Being Visited *
          </label>
          <input
            type="text"
            placeholder="John Manager"
            {...register('person_being_visited')}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800"
          />
          {errors.person_being_visited && (
            <p className="text-red-400 text-sm mt-1">
              {errors.person_being_visited.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Department *
          </label>
          <select
            {...register('department')}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 focus:border-blue-500 focus:bg-slate-800"
          >
            <option value="">Select a department...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-red-400 text-sm mt-1">
              {errors.department.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Purpose of Visit *
          </label>
          <textarea
            placeholder="Meeting, delivery, maintenance, etc."
            {...register('purpose')}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-50 placeholder-slate-400 focus:border-blue-500 focus:bg-slate-800 resize-none"
          />
          {errors.purpose && (
            <p className="text-red-400 text-sm mt-1">
              {errors.purpose.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-medium py-2 md:py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
      >
        {isSubmitting && <Loader size={18} className="animate-spin" />}
        <span>{isSubmitting ? 'Checking In...' : 'Check In Visitor'}</span>
      </button>
    </form>
  )
}
