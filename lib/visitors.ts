import { supabase } from './supabase'
import { generateVisitorNumber, generateVisitReference } from './utils'
import type { Database } from './database.types'

export type Visitor = Database['public']['Tables']['visitors']['Row']
export type Visit = Database['public']['Tables']['visits']['Row']

export async function createVisitor(visitorData: {
  full_name: string
  phone: string
  national_id: string
  company: string
}): Promise<Visitor> {
  const visitor_number = generateVisitorNumber()

  const insertResult = (supabase.from('visitors') as any)
    .insert([
      {
        visitor_number,
        ...visitorData,
      },
    ])
    .select()
    .single()

  const { data, error } = await insertResult

  if (error) throw error
  return data as Visitor
}

export async function getVisitor(visitorId: string) {
  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .eq('id', visitorId)
    .single()

  if (error) throw error
  return data as Visitor
}

export async function searchVisitors(
  searchType: 'name' | 'phone' | 'id' | 'company' | 'visitor_id',
  query: string
) {
  let queryBuilder = supabase.from('visitors').select('*')

  switch (searchType) {
    case 'name':
      queryBuilder = queryBuilder.ilike('full_name', `%${query}%`)
      break
    case 'phone':
      queryBuilder = queryBuilder.ilike('phone', `%${query}%`)
      break
    case 'id':
      queryBuilder = queryBuilder.ilike('national_id', `%${query}%`)
      break
    case 'company':
      queryBuilder = queryBuilder.ilike('company', `%${query}%`)
      break
    case 'visitor_id':
      queryBuilder = queryBuilder.ilike('visitor_number', `%${query}%`)
      break
  }

  const { data, error } = await queryBuilder.limit(50)

  if (error) throw error
  return data as Visitor[]
}

export async function createVisit(visitorId: string, visitData: {
  person_being_visited: string
  department: string
  purpose: string
}): Promise<Visit> {
  const visit_reference = generateVisitReference()
  const qr_code_identifier = visit_reference

  const insertResult = (supabase.from('visits') as any)
    .insert([
      {
        visitor_id: visitorId,
        visit_reference,
        qr_code_identifier,
        status: 'checked_in',
        ...visitData,
      },
    ])
    .select()
    .single()

  const { data, error } = await insertResult

  if (error) throw error
  return data as Visit
}

export async function getVisit(visitId: string) {
  const { data, error } = await supabase
    .from('visits')
    .select('*, visitors(*)')
    .eq('id', visitId)
    .single()

  if (error) throw error
  return data
}

export async function getVisitByReference(visitReference: string) {
  const { data, error } = await supabase
    .from('visits')
    .select('*, visitors(*)')
    .eq('visit_reference', visitReference)
    .single()

  if (error) throw error
  return data
}

export async function checkOutVisit(visitId: string): Promise<Visit> {
  const now = new Date()

  // @ts-ignore - Supabase type system limitation
  const { data: visitData, error: fetchError } = await supabase
    .from('visits')
    .select('check_in_at')
    .eq('id', visitId)
    .single()

  if (fetchError) throw fetchError

  const checkInTime = new Date((visitData as any).check_in_at)
  const duration = Math.round(
    (now.getTime() - checkInTime.getTime()) / 60000
  )

  const updateResult = (supabase.from('visits') as any)
    .update({
      check_out_at: now.toISOString(),
      duration,
      status: 'checked_out',
      updated_at: now.toISOString(),
    })
    .eq('id', visitId)
    .select()
    .single()

  const { data, error } = await updateResult

  if (error) throw error
  return data as Visit
}

export async function getActiveVisits() {
  const { data, error } = await supabase
    .from('visits')
    .select('*, visitors(*)')
    .eq('status', 'checked_in')
    .order('check_in_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getVisitHistory(visitorId: string) {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('visitor_id', visitorId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data as Visit[]
}

export function subscribeToActiveVisits(
  callback: (visits: any[]) => void
) {
  const channel = supabase
    .channel('active_visits')
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'visits',
      },
      async () => {
        const { data } = await supabase
          .from('visits')
          .select('*, visitors(*)')
          .eq('status', 'checked_in')
          .order('check_in_at', { ascending: false })

        if (data) callback(data)
      }
    )
    .subscribe()

  return channel
}

export async function getDepartments() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

/**
 * Get paginated visit history for a visitor
 * 
 * **Validates: Requirements 2.1, 2.4**
 */
export async function getVisitHistoryPaginated(
  visitorId: string,
  page: number = 0,
  pageSize: number = 10
) {
  const start = page * pageSize
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('visitor_id', visitorId)
    .order('check_in_at', { ascending: false })
    .range(start, start + pageSize - 1)

  if (error) throw error
  return data as Visit[]
}

/**
 * Calculate aggregated statistics from visit history
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 * 
 * @param visits - Array of visits to calculate statistics from
 * @returns Aggregated statistics including totals, averages, and top departments
 */
export function calculateStatistics(visits: Visit[]) {
  const total = visits.length
  const completed = visits.filter((v) => v.status === 'checked_out').length
  const active = visits.filter((v) => v.status === 'checked_in').length

  // Calculate average duration for completed visits only
  let avgDuration: number | null = null
  if (completed > 0) {
    const totalDuration = visits
      .filter((v) => v.status === 'checked_out' && v.duration)
      .reduce((sum, v) => sum + (v.duration || 0), 0)
    avgDuration = Math.round(totalDuration / completed)
  }

  // Calculate top 3 departments by frequency
  const deptMap = new Map<string, number>()
  visits
    .filter((v) => v.status === 'checked_out')
    .forEach((v) => {
      deptMap.set(v.department, (deptMap.get(v.department) || 0) + 1)
    })

  const topDepartments = Array.from(deptMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return {
    total_visits: total,
    completed_visits: completed,
    active_visits: active,
    average_duration_minutes: avgDuration,
    top_departments: topDepartments,
  }
}

/**
 * Get complete visitor profile with statistics
 * 
 * **Validates: Requirements 1.1, 4.1**
 */
export async function getVisitorProfile(visitorId: string) {
  const visitor = await getVisitor(visitorId)
  const visitHistory = await getVisitHistory(visitorId)
  const statistics = calculateStatistics(visitHistory)

  return { visitor, statistics, visitHistory }
}

/**
 * Subscribe to real-time updates for a specific visitor's visits
 * Triggers callback on INSERT and UPDATE events
 * 
 * **Validates: Requirements 5.1, 5.2**
 * 
 * @param visitorId - UUID of the visitor
 * @param callback - Function to call when visits change
 * @returns Unsubscribe function
 */
export function subscribeToVisitorVisitChanges(
  visitorId: string,
  callback: (event: 'INSERT' | 'UPDATE', visit: Visit) => void
): () => void {
  const channel = supabase
    .channel(`visits:changes:${visitorId}`)
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'visits',
        filter: `visitor_id=eq.${visitorId}`,
      },
      (payload: any) => {
        const event = payload.eventType as 'INSERT' | 'UPDATE'
        const visit = payload.new as Visit
        callback(event, visit)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

/**
 * Subscribe to visitor profile data changes
 * 
 * **Validates: Requirements 5.1**
 * 
 * @param visitorId - UUID of the visitor
 * @param callback - Function to call when visitor changes
 * @returns Unsubscribe function
 */
export function subscribeToVisitorChanges(
  visitorId: string,
  callback: (visitor: Visitor) => void
): () => void {
  const channel = supabase
    .channel(`visitor:changes:${visitorId}`)
    .on(
      'postgres_changes' as any,
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'visitors',
        filter: `id=eq.${visitorId}`,
      },
      (payload: any) => {
        callback(payload.new as Visitor)
      }
    )
    .subscribe()

  return () => {
    channel.unsubscribe()
  }
}

/**
 * Subscribe to all visit changes (INSERT and UPDATE) across the entire visits table
 *
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.5**
 *
 * @param callback - Called with event type, full visit (with visitor data), and previous visit state
 * @returns Supabase channel — pass to `supabase.removeChannel()` to unsubscribe
 */
export function subscribeToVisitsChanges(
  callback: (event: { type: 'INSERT' | 'UPDATE'; visit: any; oldVisit?: any }) => void
) {
  const channel = supabase
    .channel('analytics_visits_changes')
    .on(
      'postgres_changes' as any,
      { event: '*', schema: 'public', table: 'visits' },
      async (payload: any) => {
        const eventType = payload.eventType as 'INSERT' | 'UPDATE'
        const visitId = payload.new?.id
        if (!visitId) return

        // Fetch full visit with joined visitor data
        const { data } = await (supabase
          .from('visits')
          .select('*, visitors(*)')
          .eq('id', visitId)
          .single() as any)

        if (data) {
          callback({ type: eventType, visit: data, oldVisit: payload.old })
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * A visit record with its associated visitor data joined
 */
export type VisitWithVisitor = Visit & {
  visitors: Visitor
}

/**
 * Fetch all visits within a date range, joined with visitor data.
 * Supports optional filtering by departments and/or companies.
 *
 * **Validates: Requirements 2.5, 8.5, 9.5, 10.5**
 *
 * @param dateFrom - Start of date range (inclusive), matched against check_in_at
 * @param dateTo   - End of date range (inclusive), matched against check_in_at
 * @param options  - Optional filters: departments (by name) and companies (visitor company)
 * @returns Array of visits with nested visitor data
 */
export async function getAnalyticsVisits(
  dateFrom: Date,
  dateTo: Date,
  options?: {
    departments?: string[]
    companies?: string[]
  }
): Promise<VisitWithVisitor[]> {
  // @ts-ignore - Supabase type system limitation with joined queries
  let query = (supabase.from('visits') as any)
    .select('*, visitors(*)')
    .gte('check_in_at', dateFrom.toISOString())
    .lte('check_in_at', dateTo.toISOString())
    .order('check_in_at', { ascending: false })

  // Filter by departments if specified
  if (options?.departments && options.departments.length > 0) {
    query = query.in('department', options.departments)
  }

  const { data, error } = await query

  if (error) throw error

  let results = data as VisitWithVisitor[]

  // Filter by company in-memory (company lives on the visitor record)
  if (options?.companies && options.companies.length > 0) {
    const companySet = new Set(options.companies)
    results = results.filter(
      (v) => v.visitors && companySet.has(v.visitors.company)
    )
  }

  return results
}
