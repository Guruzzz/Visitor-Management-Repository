'use client'

import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts'
import { CHART_COLORS, CHART_THEME } from './chartUtils'

interface HistogramBucket {
  /** Label for this bucket, e.g. "0–15 min" */
  bucket: string
  /** Number of items that fall within this bucket */
  count: number
}

interface HistogramComponentProps {
  /** Array of continuous buckets to display */
  data: HistogramBucket[]
  /** Bar fill color (defaults to purple-400) */
  color?: string
  /** Chart height in pixels (defaults to 280) */
  height?: number
}

// Custom tooltip with dark background to match dashboard theme
function DarkTooltip(props: TooltipProps<number, string>) {
  const { active, payload, label } = props as any
  if (!active || !payload || payload.length === 0) return null

  return (
    <div
      style={{
        backgroundColor: CHART_THEME.tooltip.bg,
        border: `1px solid ${CHART_THEME.tooltip.border}`,
        borderRadius: 6,
        padding: '8px 12px',
        color: CHART_THEME.tooltip.text,
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {(payload as any[]).map((entry: any, i: number) => (
        <p key={i} style={{ margin: 0, color: entry.color ?? CHART_THEME.tooltip.text }}>
          Count: {entry.value}
        </p>
      ))}
    </div>
  )
}

/**
 * Recharts BarChart used as a histogram for continuous bucket data.
 * Unlike a standard bar chart, buckets have no gap between them (barCategoryGap=0)
 * to convey a continuous distribution. X-axis labels are rotated for readability.
 */
export default function HistogramComponent({
  data,
  color = CHART_COLORS.purple,
  height = 280,
}: HistogramComponentProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-slate-400 text-sm"
        style={{ height }}
      >
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {/* barCategoryGap={0} removes gaps between bars to simulate a histogram */}
      <BarChart
        data={data}
        barCategoryGap={0}
        margin={{ top: 8, right: 8, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
        <XAxis
          dataKey="bucket"
          tick={{ fill: CHART_THEME.text, fontSize: 11, angle: -30, textAnchor: 'end' }}
          axisLine={{ stroke: CHART_THEME.grid }}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fill: CHART_THEME.text, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
