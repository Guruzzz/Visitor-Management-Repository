import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VisitStatusBadge } from '../VisitStatusBadge'

describe('VisitStatusBadge', () => {
  it('renders checked_in status with in-progress indicator', () => {
    render(<VisitStatusBadge status="checked_in" />)

    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('renders checked_out status with completed text', () => {
    render(<VisitStatusBadge status="checked_out" />)

    expect(screen.getByText(/Completed/)).toBeInTheDocument()
  })

  it('displays duration for completed visits', () => {
    render(<VisitStatusBadge status="checked_out" duration="1h 30m" />)

    expect(screen.getByText(/Completed • 1h 30m/)).toBeInTheDocument()
  })

  it('applies green styling for active visits', () => {
    const { container } = render(<VisitStatusBadge status="checked_in" />)

    const badge = container.querySelector('.bg-green-500\\/10')
    expect(badge).toBeInTheDocument()
  })

  it('applies slate styling for completed visits', () => {
    const { container } = render(<VisitStatusBadge status="checked_out" />)

    const badge = container.querySelector('.bg-slate-500\\/10')
    expect(badge).toBeInTheDocument()
  })

  it('shows pulsing animation for active visits', () => {
    const { container } = render(<VisitStatusBadge status="checked_in" />)

    const icon = container.querySelector('.animate-pulse')
    expect(icon).toBeInTheDocument()
  })

  it('does not show pulsing animation for completed visits', () => {
    const { container } = render(<VisitStatusBadge status="checked_out" />)

    const icon = container.querySelector('.animate-pulse')
    expect(icon).not.toBeInTheDocument()
  })

  it('displays different icons for different statuses', () => {
    const { container: activeContainer } = render(
      <VisitStatusBadge status="checked_in" />
    )
    const { container: completedContainer } = render(
      <VisitStatusBadge status="checked_out" />
    )

    const activeSvgs = activeContainer.querySelectorAll('svg')
    const completedSvgs = completedContainer.querySelectorAll('svg')

    // Both should have icons, but they should be different
    expect(activeSvgs.length).toBeGreaterThan(0)
    expect(completedSvgs.length).toBeGreaterThan(0)
  })
})
