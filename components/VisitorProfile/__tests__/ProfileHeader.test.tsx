import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProfileHeader } from '../ProfileHeader'
import type { Visitor } from '@/lib/visitors'

describe('ProfileHeader', () => {
  const mockVisitor: Visitor = {
    id: '1',
    visitor_number: 'VIS-001',
    full_name: 'John Doe',
    phone: '555-1234',
    national_id: 'ID-12345',
    company: 'Acme Corp',
    photo_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  it('renders visitor name and details', () => {
    render(
      <ProfileHeader
        visitor={mockVisitor}
        totalVisits={5}
        lastVisitDate="2024-01-15T10:30:00Z"
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('VIS-001')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('displays total visits badge', () => {
    render(
      <ProfileHeader
        visitor={mockVisitor}
        totalVisits={12}
        lastVisitDate="2024-01-15T10:30:00Z"
      />
    )

    expect(screen.getByText('Total Visits')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('displays last visit date when provided', () => {
    render(
      <ProfileHeader
        visitor={mockVisitor}
        totalVisits={5}
        lastVisitDate="2024-01-15T14:30:00Z"
      />
    )

    expect(screen.getByText('Last Visit')).toBeInTheDocument()
    expect(screen.getByText('Jan 15')).toBeInTheDocument()
    // Time format may vary by timezone, so just check it contains digits
    const timeElements = screen.getAllByText(/\d+:\d+/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('displays "No visits yet" when lastVisitDate is null', () => {
    render(
      <ProfileHeader
        visitor={mockVisitor}
        totalVisits={0}
        lastVisitDate={null}
      />
    )

    expect(screen.getByText('No visits yet')).toBeInTheDocument()
  })

  it('displays loading skeleton when isLoading is true', () => {
    const { container } = render(
      <ProfileHeader
        visitor={mockVisitor}
        totalVisits={5}
        lastVisitDate={null}
        isLoading={true}
      />
    )

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays visitor initials when no photo is provided', () => {
    render(
      <ProfileHeader
        visitor={mockVisitor}
        totalVisits={5}
        lastVisitDate={null}
      />
    )

    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('displays photo image when photo_url is provided', () => {
    const visitorWithPhoto = {
      ...mockVisitor,
      photo_url: 'https://example.com/photo.jpg',
    }

    render(
      <ProfileHeader
        visitor={visitorWithPhoto}
        totalVisits={5}
        lastVisitDate={null}
      />
    )

    const img = screen.getByAltText('John Doe')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('renders responsive layout classes', () => {
    const { container } = render(
      <ProfileHeader
        visitor={mockVisitor}
        totalVisits={5}
        lastVisitDate={null}
      />
    )

    const mainDiv = container.querySelector('.md\\:flex-row')
    expect(mainDiv).toBeInTheDocument()
  })
})
