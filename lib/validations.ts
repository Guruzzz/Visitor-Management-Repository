import { z } from 'zod'

export const visitorRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number').min(10),
  national_id: z.string().min(5, 'National ID must be at least 5 characters').max(50),
  company: z.string().min(2, 'Company name required').max(100),
})

export const visitRegistrationSchema = z.object({
  person_being_visited: z.string().min(2, 'Name must be at least 2 characters').max(100),
  department: z.string().min(1, 'Department required'),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters').max(255),
})

export const searchSchema = z.object({
  query: z.string().min(1, 'Search term required').max(100),
  searchType: z.enum(['name', 'phone', 'id', 'company', 'visitor_id']),
})

export type VisitorRegistration = z.infer<typeof visitorRegistrationSchema>
export type VisitRegistration = z.infer<typeof visitRegistrationSchema>
export type SearchParams = z.infer<typeof searchSchema>
