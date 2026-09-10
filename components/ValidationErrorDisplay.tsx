'use client'

import React, { useEffect, useRef } from 'react'
import { FieldError } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

interface ValidationErrorDisplayProps {
  error?: FieldError
}

/**
 * Component to display field-level validation errors from React Hook Form
 * Highlights invalid fields and provides helpful error messages
 */
export function ValidationErrorDisplay({
  error,
}: ValidationErrorDisplayProps) {
  if (!error) return null

  return (
    <div className="flex items-start gap-2 mt-2 text-red-400 text-sm">
      <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      <span>{error.message}</span>
    </div>
  )
}

interface FormFieldProps {
  label: string
  error?: FieldError
  required?: boolean
  children: React.ReactNode
  hint?: string
}

/**
 * Wrapper component for form fields with integrated error display
 * Handles visual feedback for validation states
 */
export function FormField({
  label,
  error,
  required,
  children,
  hint,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className={error ? 'ring-1 ring-red-500/50 rounded-lg' : ''}>
        {children}
      </div>

      {hint && !error && (
        <p className="text-xs text-slate-400">{hint}</p>
      )}

      {error && <ValidationErrorDisplay error={error} />}
    </div>
  )
}

interface FormErrorSummaryProps {
  errors: Record<string, FieldError | undefined>
  fieldLabels?: Record<string, string>
}

/**
 * Component to display a summary of all form validation errors
 * Useful for showing overview of what needs to be fixed
 */
export function FormErrorSummary({
  errors,
  fieldLabels = {},
}: FormErrorSummaryProps) {
  const firstErrorFieldRef = useRef<HTMLDivElement>(null)
  const errorEntries = Object.entries(errors).filter(([, error]) => error)

  // Focus on error summary when it appears
  useEffect(() => {
    if (errorEntries.length > 0) {
      firstErrorFieldRef.current?.focus()
    }
  }, [errorEntries])

  if (errorEntries.length === 0) return null

  return (
    <div
      ref={firstErrorFieldRef}
      role="alert"
      tabIndex={-1}
      className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6"
    >
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-200 text-sm mb-2">
            {errorEntries.length} validation {errorEntries.length === 1 ? 'error' : 'errors'}
          </p>
          <ul className="space-y-1">
            {errorEntries.map(([fieldName, error]) => (
              <li key={fieldName} className="text-red-300 text-xs">
                <strong>{fieldLabels[fieldName] || fieldName}:</strong> {error?.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

interface InlineErrorProps {
  message: string
  onDismiss?: () => void
}

/**
 * Simple inline error display component for non-field errors
 */
export function InlineError({ message, onDismiss }: InlineErrorProps) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-6 text-red-200 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-300 hover:text-red-200 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

interface InputErrorBoundaryProps {
  error?: FieldError
  children: React.ReactElement<{
    className?: string
  }>
}

/**
 * Wrapper component that adds visual error styling to input elements
 * Automatically adds red border when field has error
 */
export function InputErrorBoundary({
  error,
  children,
}: InputErrorBoundaryProps) {
  if (!children) return null

  const errorClassName = error
    ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20'
    : ''

  return React.cloneElement(children, {
    className: `${children.props.className || ''} ${errorClassName}`,
  })
}
