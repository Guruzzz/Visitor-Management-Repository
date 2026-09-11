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
  LabelList,
  TooltipProps,
} from 'recharts'
import { CHART_COLORS, CHART_THEME } from './chartUtils'

interface BarChartComponentProps {
  /** Data array where each object contains the x-axis key and y-axis key values */
  data: Array<Record<string, unknown>>
  /** Key in the data objects to use for the x-axis */
  xKey: string
  /** Key in the data objects to use for the y-axis (bar height) */
  yKey: string
  /** Bar fill color (defaults to blue-400) */
  color?: string
  /** Chart height in pixels (defaults to 280) */
  height?: number
  /** When true, renders a LabelList above each bar showing the value */
  label?: boolean
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
 * Recharts BarChart wrapper with dark dashboard theme.
 * Renders a responsive vertical bar chart with optional per-bar value labels.
 */
export default function BarChartComponent({
  data,
  xKey,
  yKey,
  color = CHART_COLORS.blue,
  height = 280,
  label = false,
}: BarChartComponentProps) {
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
      <BarChart data={data} margin={{ top: label ? 20 : 8, right: 8, left: 0, bottom: 8 }}>
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
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]}>
          {label && (
            <LabelList
              dataKey={yKey}
              position="top"
              style={{ fill: CHART_THEME.text, fontSize: 11 }}
            />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
