import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatisticsSection } from '../StatisticsSection'

describe('StatisticsSection', () => {
  const mockStatistics = {
    total_visits: 15,
    completed_visits: 13,
    active_visits: 2,
    average_duration_minutes: 45,
  }

  it('displays visit statistics section title', () => {
    render(<StatisticsSection statistics={mockStatistics} />)

    expect(screen.getByText('Visit Statistics')).toBeInTheDocument()
  })

  it('displays total visits card with correct value', () => {
    render(<StatisticsSection statistics={mockStatistics} />)

    expect(screen.getByText('Total Visits')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('displays completed visits card with correct value', () => {
    render(<StatisticsSection statistics={mockStatistics} />)

    expect(screen.getByText('Completed Visits')).toBeInTheDocument()
    expect(screen.getByText('13')).toBeInTheDocument()
  })

  it('displays active visits card with correct value', () => {
    render(<StatisticsSection statistics={mockStatistics} />)

    expect(screen.getByText('Active Visits')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('displays average duration when completed visits exist', () => {
    render(<StatisticsSection statistics={mockStatistics} />)

    expect(screen.getByText('Avg Duration')).toBeInTheDocument()
    expect(screen.getByText('45m')).toBeInTheDocument()
  })

  it('displays dash when no completed visits', () => {
    const statsWithNoCompleted = {
      ...mockStatistics,
      completed_visits: 0,
      average_duration_minutes: null,
    }

    render(<StatisticsSection statistics={statsWithNoCompleted} />)

    const dashElements = screen.queryAllByText('—')
    expect(dashElements.length).toBeGreaterThan(0)
  })

  it('rounds average duration to nearest minute', () => {
    const statsWithDecimal = {
      ...mockStatistics,
      average_duration_minutes: 45.6,
    }

    render(<StatisticsSection statistics={statsWithDecimal} />)

    expect(screen.getByText('46m')).toBeInTheDocument()
  })

  it('displays loading skeleton when isLoading is true', () => {
    const { container } = render(
      <StatisticsSection statistics={mockStatistics} isLoading={true} />
    )

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays loading skeleton when statistics is null', () => {
    const { container } = render(
      <StatisticsSection statistics={null} isLoading={false} />
    )

    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders responsive grid layout', () => {
    const { container } = render(
      <StatisticsSection statistics={mockStatistics} />
    )

    const gridDiv = container.querySelector('.grid')
    expect(gridDiv).toHaveClass('grid-cols-2', 'lg:grid-cols-4')
  })

  it('displays all four stat cards', () => {
    render(<StatisticsSection statistics={mockStatistics} />)

    const labels = [
      'Total Visits',
      'Completed Visits',
      'Active Visits',
      'Avg Duration',
    ]

    labels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })
})
