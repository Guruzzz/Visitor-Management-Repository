import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateVisitorNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `VIS-${timestamp}-${random}`
}

export function generateVisitReference(): string {
  const date = new Date()
  const dateStr = date
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '')
  const timeStr = date
    .toISOString()
    .split('T')[1]
    .split(':')
    .join('')
    .slice(0, 6)
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `VISIT-${dateStr}-${timeStr}-${random}`
}

export function calculateDurationMinutes(
  checkInAt: Date,
  checkOutAt: Date
): number {
  const diff = checkOutAt.getTime() - checkInAt.getTime()
  return Math.round(diff / 60000)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 255)
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^[\d\s\-\+\(\)]{10,}$/.test(phone.replace(/\s/g, ''))
}

export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}
