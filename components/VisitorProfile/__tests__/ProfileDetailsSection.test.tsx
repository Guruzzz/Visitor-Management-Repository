import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileDetailsSection } from '../ProfileDetailsSection'
import type { Visitor } from '@/lib/visitors'

describe('ProfileDetailsSection', () => {
  const mockVisitor: Visitor = {
    id: '1',
    visitor_number: 'VIS-001',
    full_name: 'John Doe',
    phone: '+1-555-123-4567',
    national_id: 'ID-987654321',
    company: 'Acme Corp',
    photo_url: null,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
  }

  it('displays contact information section', () => {
    render(<ProfileDetailsSection visitor={mockVisitor} />)

    expect(screen.getByText('Contact Information')).toBeInTheDocument()
  })

  it('displays phone number', () => {
    render(<ProfileDetailsSection visitor={mockVisitor} />)

    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument()
  })

  it('displays national ID', () => {
    render(<ProfileDetailsSection visitor={mockVisitor} />)

    expect(screen.getByText('National ID')).toBeInTheDocument()
    expect(screen.getByText('ID-987654321')).toBeInTheDocument()
  })

  it('displays company name', () => {
    render(<ProfileDetailsSection visitor={mockVisitor} />)

    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('displays visitor number', () => {
    render(<ProfileDetailsSection visitor={mockVisitor} />)

    expect(screen.getByText('Visitor Number')).toBeInTheDocument()
    expect(screen.getByText('VIS-001')).toBeInTheDocument()
  })

  it('displays registration date', () => {
    render(<ProfileDetailsSection visitor={mockVisitor} />)

    expect(screen.getByText('Registered On')).toBeInTheDocument()
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument()
    // Time format may vary by timezone, so just check it contains digits
    const timeElements = screen.getAllByText(/\d+:\d+/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('displays loading skeleton when isLoading is true', () => {
    const { container } = render(
      <ProfileDetailsSection visitor={mockVisitor} isLoading={true} />
    )

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays loading skeleton when visitor is null', () => {
    const { container } = render(
      <ProfileDetailsSection visitor={null} isLoading={false} />
    )

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders all information items', () => {
    render(<ProfileDetailsSection visitor={mockVisitor} />)

    const labels = [
      'Phone Number',
      'National ID',
      'Company',
      'Visitor Number',
      'Registered On',
    ]

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })
})
