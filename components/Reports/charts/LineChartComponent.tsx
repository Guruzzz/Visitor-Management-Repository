'use client'

import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts'
import { CHART_COLORS, CHART_THEME } from './chartUtils'

interface LineChartComponentProps {
  /** Data array where each object contains the x-axis key and y-axis key values */
  data: Array<Record<string, unknown>>
  /** Key in the data objects to use for the x-axis */
  xKey: string
  /** Key in the data objects to use for the y-axis (line value) */
  yKey: string
  /** Line and area fill color (defaults to blue-400) */
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
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

/**
 * Recharts line chart wrapper with dark dashboard theme.
 * Renders a responsive smooth line chart (type="monotone") with a gradient
 * fill area beneath the line for visual depth. Uses AreaChart internally
 * so the gradient fills naturally without manual SVG wiring.
 */
export default function LineChartComponent({
  data,
  xKey,
  yKey,
  color = CHART_COLORS.blue,
  height = 280,
}: LineChartComponentProps) {
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

  // Unique gradient id per color to avoid SVG id collisions when multiple charts share a page
  const gradientId = `lineGradient-${color.replace('#', '')}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        {/* Gradient definition for the area fill beneath the line */}
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: CHART_THEME.text, fontSize: 12 }}
          axisLine={{ stroke: CHART_THEME.grid }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: CHART_THEME.text, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<DarkTooltip />} cursor={{ stroke: CHART_THEME.grid, strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: CHART_THEME.tooltip.bg, strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
