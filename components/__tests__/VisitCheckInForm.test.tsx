import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/test-utils'
import { VisitCheckInForm } from '../VisitCheckInForm'

// Mock the API functions
vi.mock('@/lib/visitors', () => ({
  createVisit: vi.fn(),
  getDepartments: vi.fn(),
}))

import { createVisit, getDepartments } from '@/lib/visitors'

describe('VisitCheckInForm', () => {
  const mockOnSuccess = vi.fn()
  const mockVisitorId = 'visitor-123'
  const mockVisitorName = 'Jane Doe'

  beforeEach(() => {
    mockOnSuccess.mockClear()
    vi.clearAllMocks()
    
    vi.mocked(getDepartments).mockResolvedValue([
      { id: 'dept-1', name: 'Engineering', description: null },
      { id: 'dept-2', name: 'Sales', description: null },
    ] as any)
  })

  it('should render the check-in form with visitor name', async () => {
    render(
      <VisitCheckInForm
        visitorId={mockVisitorId}
        visitorName={mockVisitorName}
        onSuccess={mockOnSuccess}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Check-In Visitor' })).toBeInTheDocument()
      expect(screen.getByText(mockVisitorName)).toBeInTheDocument()
    })
  })

  it('should load and display departments', async () => {
    render(
      <VisitCheckInForm
        visitorId={mockVisitorId}
        visitorName={mockVisitorName}
        onSuccess={mockOnSuccess}
      />
    )
    
    await waitFor(() => {
      const deptSelect = screen.getByRole('combobox') as HTMLSelectElement
      const options = Array.from(deptSelect.options).map(o => o.value)
      expect(options).toContain('Engineering')
      expect(options).toContain('Sales')
    })
  })

  it('should show validation errors for empty required fields', async () => {
    render(
      <VisitCheckInForm
        visitorId={mockVisitorId}
        visitorName={mockVisitorName}
        onSuccess={mockOnSuccess}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Check-In Visitor')).toBeInTheDocument()
    })

    const submitButton = screen.getByRole('button', { name: /Check In Visitor/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const mockVisit = {
      id: 'visit-123',
      visitor_id: mockVisitorId,
      visit_reference: 'VISIT-12345',
      qr_code_identifier: 'QR-12345',
      person_being_visited: 'John Manager',
      department: 'Engineering',
      purpose: 'Team meeting',
      check_in_at: new Date().toISOString(),
      check_out_at: null,
      duration: null,
      status: 'checked_in',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(createVisit).mockResolvedValue(mockVisit as any)

    render(
      <VisitCheckInForm
        visitorId={mockVisitorId}
        visitorName={mockVisitorName}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument()
    })

    const personInput = screen.getByPlaceholderText('John Manager') as HTMLInputElement
    const deptSelects = screen.getAllByRole('combobox')
    const deptSelect = deptSelects[0] as HTMLSelectElement
    const purposeInput = screen.getByPlaceholderText('Meeting, delivery, maintenance, etc.') as HTMLTextAreaElement

    fireEvent.change(personInput, { target: { value: 'John Manager' } })
    fireEvent.change(deptSelect, { target: { value: 'Engineering' } })
    fireEvent.change(purposeInput, { target: { value: 'Team meeting and planning' } })

    const submitButton = screen.getByRole('button', { name: /Check In Visitor/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(createVisit).toHaveBeenCalledWith(mockVisitorId, {
        person_being_visited: 'John Manager',
        department: 'Engineering',
        purpose: 'Team meeting and planning',
      })
    })
  })
})
