import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@/test/test-utils'
import { VisitorRegistrationForm } from '../VisitorRegistrationForm'

// Mock the API function
vi.mock('@/lib/visitors', () => ({
  createVisitor: vi.fn(),
}))

import { createVisitor } from '@/lib/visitors'

describe('VisitorRegistrationForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    mockOnSuccess.mockClear()
    vi.clearAllMocks()
  })

  it('should render the registration form with all fields', () => {
    render(<VisitorRegistrationForm onSuccess={mockOnSuccess} />)
    
    expect(screen.getByRole('heading', { name: 'Register Visitor' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('ABC123456')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Acme Corp')).toBeInTheDocument()
  })

  it('should show validation errors for empty required fields', async () => {
    render(<VisitorRegistrationForm onSuccess={mockOnSuccess} />)
    
    const submitButton = screen.getByRole('button', { name: /Register Visitor/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const mockVisitor = {
      id: 'visitor-123',
      visitor_number: 'VIS-20240115-00001',
      full_name: 'John Doe',
      phone: '+1 (555) 000-0000',
      national_id: 'ABC123456',
      company: 'Acme Corp',
      photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(createVisitor).mockResolvedValue(mockVisitor as any)

    render(<VisitorRegistrationForm onSuccess={mockOnSuccess} />)

    const fullNameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000') as HTMLInputElement
    const idInput = screen.getByPlaceholderText('ABC123456') as HTMLInputElement
    const companyInput = screen.getByPlaceholderText('Acme Corp') as HTMLInputElement

    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } })
    fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } })
    fireEvent.change(idInput, { target: { value: 'ID123456789' } })
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } })

    const submitButton = screen.getByRole('button', { name: /Register Visitor/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(createVisitor).toHaveBeenCalledWith({
        full_name: 'Jane Doe',
        phone: '+1 (555) 123-4567',
        national_id: 'ID123456789',
        company: 'Tech Corp',
      })
    })
  })

  it('should show success message after successful registration', async () => {
    const mockVisitor = {
      id: 'visitor-123',
      visitor_number: 'VIS-20240115-00001',
      full_name: 'Jane Doe',
      phone: '+1 (555) 000-0000',
      national_id: 'ABC123456',
      company: 'Acme Corp',
      photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(createVisitor).mockResolvedValue(mockVisitor as any)

    render(<VisitorRegistrationForm onSuccess={mockOnSuccess} />)

    const fullNameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000') as HTMLInputElement
    const idInput = screen.getByPlaceholderText('ABC123456') as HTMLInputElement
    const companyInput = screen.getByPlaceholderText('Acme Corp') as HTMLInputElement

    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } })
    fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } })
    fireEvent.change(idInput, { target: { value: 'ID123456789' } })
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } })

    const submitButton = screen.getByRole('button', { name: /Register Visitor/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Jane Doe registered successfully/)).toBeInTheDocument()
    })
  })

  it('should display error message on submission failure', async () => {
    const errorMessage = 'Failed to register visitor'

    vi.mocked(createVisitor).mockRejectedValue(new Error(errorMessage))

    render(<VisitorRegistrationForm onSuccess={mockOnSuccess} />)

    const fullNameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000') as HTMLInputElement
    const idInput = screen.getByPlaceholderText('ABC123456') as HTMLInputElement
    const companyInput = screen.getByPlaceholderText('Acme Corp') as HTMLInputElement

    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } })
    fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } })
    fireEvent.change(idInput, { target: { value: 'ID123456789' } })
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } })

    const submitButton = screen.getByRole('button', { name: /Register Visitor/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      // Error message should be displayed in the in-page error box
      const elements = screen.queryAllByText(errorMessage)
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('should clear form after successful registration', async () => {
    const mockVisitor = {
      id: 'visitor-123',
      visitor_number: 'VIS-20240115-00001',
      full_name: 'John Doe',
      phone: '+1 (555) 000-0000',
      national_id: 'ABC123456',
      company: 'Acme Corp',
      photo_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    vi.mocked(createVisitor).mockResolvedValue(mockVisitor as any)

    render(<VisitorRegistrationForm onSuccess={mockOnSuccess} />)

    const fullNameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
    const phoneInput = screen.getByPlaceholderText('+1 (555) 000-0000') as HTMLInputElement
    const idInput = screen.getByPlaceholderText('ABC123456') as HTMLInputElement
    const companyInput = screen.getByPlaceholderText('Acme Corp') as HTMLInputElement

    fireEvent.change(fullNameInput, { target: { value: 'Jane Doe' } })
    fireEvent.change(phoneInput, { target: { value: '+1 (555) 123-4567' } })
    fireEvent.change(idInput, { target: { value: 'ID123456789' } })
    fireEvent.change(companyInput, { target: { value: 'Tech Corp' } })

    const submitButton = screen.getByRole('button', { name: /Register Visitor/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(fullNameInput.value).toBe('')
      expect(phoneInput.value).toBe('')
    })
  })
})
