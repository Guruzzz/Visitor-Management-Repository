import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DurationDisplay } from '../DurationDisplay'

describe('DurationDisplay', () => {
  it('displays completed visit duration', () => {
    render(
      <DurationDisplay
        status="checked_out"
        checkInAt="2024-01-15T11:00:00Z"
        checkOutAt="2024-01-15T12:00:00Z"
        duration={60}
      />
    )

    expect(screen.getByText('1h')).toBeInTheDocument()
  })

  it('formats duration in minutes', () => {
    render(
      <DurationDisplay
        status="checked_out"
        checkInAt="2024-01-15T11:45:00Z"
        checkOutAt="2024-01-15T12:00:00Z"
        duration={15}
      />
    )

    expect(screen.getByText('15m')).toBeInTheDocument()
  })

  it('formats duration in hours and minutes', () => {
    render(
      <DurationDisplay
        status="checked_out"
        checkInAt="2024-01-15T10:30:00Z"
        checkOutAt="2024-01-15T12:00:00Z"
        duration={90}
      />
    )

    expect(screen.getByText('1h 30m')).toBeInTheDocument()
  })

  it('uses stored duration for completed visits', () => {
    const { rerender } = render(
      <DurationDisplay
        status="checked_out"
        checkInAt="2024-01-15T11:00:00Z"
        checkOutAt="2024-01-15T12:00:00Z"
        duration={60}
      />
    )

    expect(screen.getByText('1h')).toBeInTheDocument()

    // Even if we change checkOutAt, it should still use the stored duration
    rerender(
      <DurationDisplay
        status="checked_out"
        checkInAt="2024-01-15T11:00:00Z"
        checkOutAt="2024-01-15T11:30:00Z"
        duration={60}
      />
    )

    expect(screen.getByText('1h')).toBeInTheDocument()
  })

  it('renders span element for duration text', () => {
    const { container } = render(
      <DurationDisplay
        status="checked_out"
        checkInAt="2024-01-15T11:00:00Z"
        checkOutAt="2024-01-15T12:00:00Z"
        duration={45}
      />
    )

    const span = container.querySelector('.text-blue-400')
    expect(span).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    const { container } = render(
      <DurationDisplay
        status="checked_out"
        checkInAt="2024-01-15T11:00:00Z"
        checkOutAt="2024-01-15T12:00:00Z"
        duration={30}
      />
    )

    const span = container.querySelector('span')
    expect(span).toHaveClass('text-blue-400', 'font-medium')
  })
})
