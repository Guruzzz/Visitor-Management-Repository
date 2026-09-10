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
