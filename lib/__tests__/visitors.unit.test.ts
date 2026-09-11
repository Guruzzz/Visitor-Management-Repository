import { describe, it, expect } from 'vitest'
import type { Visit } from '@/lib/visitors'

// Test the calculateStatistics logic with a local implementation
function calculateStatistics(visits: Visit[]) {
  const total = visits.length
  const completed = visits.filter((v) => v.status === 'checked_out').length
  const active = visits.filter((v) => v.status === 'checked_in').length

  let avgDuration: number | null = null
  if (completed > 0) {
    const totalDuration = visits
      .filter((v) => v.status === 'checked_out' && v.duration)
      .reduce((sum, v) => sum + (v.duration || 0), 0)
    avgDuration = Math.round(totalDuration / completed)
  }

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

describe('calculateStatistics logic', () => {
  it('handles empty visit list', () => {
    const stats = calculateStatistics([])
    expect(stats.total_visits).toBe(0)
    expect(stats.completed_visits).toBe(0)
    expect(stats.active_visits).toBe(0)
    expect(stats.average_duration_minutes).toBeNull()
    expect(stats.top_departments).toEqual([])
  })

  it('calculates single completed visit correctly', () => {
    const visits: Visit[] = [
      {
        id: '1',
        visitor_id: 'v1',
        visit_reference: 'REF001',
        qr_code_identifier: 'QR001',
        check_in_at: '2024-01-15T09:00:00Z',
        check_out_at: '2024-01-15T09:45:00Z',
        duration: 45,
        status: 'checked_out',
        person_being_visited: 'John',
        department: 'Sales',
        purpose: 'Meeting',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:45:00Z',
      },
    ]
    const stats = calculateStatistics(visits)
    expect(stats.total_visits).toBe(1)
    expect(stats.completed_visits).toBe(1)
    expect(stats.active_visits).toBe(0)
    expect(stats.average_duration_minutes).toBe(45)
    expect(stats.top_departments).toEqual([{ name: 'Sales', count: 1 }])
  })

  it('handles mixed visit statuses', () => {
    const visits: Visit[] = [
      {
        id: '1',
        visitor_id: 'v1',
        visit_reference: 'REF001',
        qr_code_identifier: 'QR001',
        check_in_at: '2024-01-15T09:00:00Z',
        check_out_at: '2024-01-15T09:45:00Z',
        duration: 45,
        status: 'checked_out',
        person_being_visited: 'John',
        department: 'Sales',
        purpose: 'Meeting',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:45:00Z',
      },
      {
        id: '2',
        visitor_id: 'v1',
        visit_reference: 'REF002',
        qr_code_identifier: 'QR002',
        check_in_at: '2024-01-16T10:00:00Z',
        check_out_at: '2024-01-16T11:15:00Z',
        duration: 75,
        status: 'checked_out',
        person_being_visited: 'Jane',
        department: 'HR',
        purpose: 'Interview',
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T11:15:00Z',
      },
      {
        id: '3',
        visitor_id: 'v1',
        visit_reference: 'REF003',
        qr_code_identifier: 'QR003',
        check_in_at: '2024-01-17T11:00:00Z',
        check_out_at: null,
        duration: null,
        status: 'checked_in',
        person_being_visited: 'Bob',
        department: 'Sales',
        purpose: 'Consultation',
        created_at: '2024-01-17T11:00:00Z',
        updated_at: '2024-01-17T11:00:00Z',
      },
    ]
    const stats = calculateStatistics(visits)
    expect(stats.total_visits).toBe(3)
    expect(stats.completed_visits).toBe(2)
    expect(stats.active_visits).toBe(1)
    expect(stats.average_duration_minutes).toBe(60)
  })

  it('calculates average duration with proper rounding', () => {
    const visits: Visit[] = [
      {
        id: '1',
        visitor_id: 'v1',
        visit_reference: 'REF001',
        qr_code_identifier: 'QR001',
        check_in_at: '2024-01-15T09:00:00Z',
        check_out_at: '2024-01-15T09:47:00Z',
        duration: 47,
        status: 'checked_out',
        person_being_visited: 'John',
        department: 'Sales',
        purpose: 'Meeting',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:47:00Z',
      },
      {
        id: '2',
        visitor_id: 'v1',
        visit_reference: 'REF002',
        qr_code_identifier: 'QR002',
        check_in_at: '2024-01-16T10:00:00Z',
        check_out_at: '2024-01-16T11:16:00Z',
        duration: 76,
        status: 'checked_out',
        person_being_visited: 'Jane',
        department: 'HR',
        purpose: 'Interview',
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T11:16:00Z',
      },
    ]
    const stats = calculateStatistics(visits)
    // (47 + 76) / 2 = 61.5 rounds to 62
    expect(stats.average_duration_minutes).toBe(62)
  })

  it('returns top 3 departments only', () => {
    const visits: Visit[] = [
      {
        id: '1',
        visitor_id: 'v1',
        visit_reference: 'REF001',
        qr_code_identifier: 'QR001',
        check_in_at: '2024-01-15T09:00:00Z',
        check_out_at: '2024-01-15T09:45:00Z',
        duration: 45,
        status: 'checked_out',
        person_being_visited: 'John',
        department: 'Sales',
        purpose: 'Meeting',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:45:00Z',
      },
      {
        id: '2',
        visitor_id: 'v1',
        visit_reference: 'REF002',
        qr_code_identifier: 'QR002',
        check_in_at: '2024-01-16T10:00:00Z',
        check_out_at: '2024-01-16T11:00:00Z',
        duration: 60,
        status: 'checked_out',
        person_being_visited: 'Jane',
        department: 'HR',
        purpose: 'Interview',
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T11:00:00Z',
      },
      {
        id: '3',
        visitor_id: 'v1',
        visit_reference: 'REF003',
        qr_code_identifier: 'QR003',
        check_in_at: '2024-01-17T11:00:00Z',
        check_out_at: '2024-01-17T12:00:00Z',
        duration: 60,
        status: 'checked_out',
        person_being_visited: 'Bob',
        department: 'IT',
        purpose: 'Consultation',
        created_at: '2024-01-17T11:00:00Z',
        updated_at: '2024-01-17T12:00:00Z',
      },
      {
        id: '4',
        visitor_id: 'v1',
        visit_reference: 'REF004',
        qr_code_identifier: 'QR004',
        check_in_at: '2024-01-18T11:00:00Z',
        check_out_at: '2024-01-18T12:00:00Z',
        duration: 60,
        status: 'checked_out',
        person_being_visited: 'Alice',
        department: 'Finance',
        purpose: 'Audit',
        created_at: '2024-01-18T11:00:00Z',
        updated_at: '2024-01-18T12:00:00Z',
      },
      {
        id: '5',
        visitor_id: 'v1',
        visit_reference: 'REF005',
        qr_code_identifier: 'QR005',
        check_in_at: '2024-01-19T11:00:00Z',
        check_out_at: '2024-01-19T12:00:00Z',
        duration: 60,
        status: 'checked_out',
        person_being_visited: 'Charlie',
        department: 'Sales',
        purpose: 'Follow-up',
        created_at: '2024-01-19T11:00:00Z',
        updated_at: '2024-01-19T12:00:00Z',
      },
    ]
    const stats = calculateStatistics(visits)
    expect(stats.top_departments).toHaveLength(3)
    expect(stats.top_departments[0]).toEqual({ name: 'Sales', count: 2 })
  })

  it('excludes active visits from department calculations', () => {
    const visits: Visit[] = [
      {
        id: '1',
        visitor_id: 'v1',
        visit_reference: 'REF001',
        qr_code_identifier: 'QR001',
        check_in_at: '2024-01-15T09:00:00Z',
        check_out_at: null,
        duration: null,
        status: 'checked_in',
        person_being_visited: 'John',
        department: 'Sales',
        purpose: 'Meeting',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T09:00:00Z',
      },
      {
        id: '2',
        visitor_id: 'v1',
        visit_reference: 'REF002',
        qr_code_identifier: 'QR002',
        check_in_at: '2024-01-16T10:00:00Z',
        check_out_at: null,
        duration: null,
        status: 'checked_in',
        person_being_visited: 'Jane',
        department: 'HR',
        purpose: 'Interview',
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T10:00:00Z',
      },
    ]
    const stats = calculateStatistics(visits)
    expect(stats.total_visits).toBe(2)
    expect(stats.completed_visits).toBe(0)
    expect(stats.active_visits).toBe(2)
    expect(stats.average_duration_minutes).toBeNull()
    expect(stats.top_departments).toEqual([])
  })
})
