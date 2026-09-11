'use client';

import React from 'react';

type MetricColor = 'blue' | 'purple' | 'green' | 'amber' | 'red';

interface MetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  color?: MetricColor;
}

const colorMap: Record<
  MetricColor,
  { border: string; gradient: string; iconBg: string; iconBorder: string; text: string; hover: string }
> = {
  blue: {
    border: 'hover:border-blue-500/30',
    gradient: 'from-blue-500/5 to-purple-500/5',
    iconBg: 'from-blue-500/20 to-blue-600/10',
    iconBorder: 'border-blue-500/20',
    text: 'from-blue-400 to-blue-300',
    hover: 'group-hover:text-blue-300',
  },
  purple: {
    border: 'hover:border-purple-500/30',
    gradient: 'from-purple-500/5 to-pink-500/5',
    iconBg: 'from-purple-500/20 to-purple-600/10',
    iconBorder: 'border-purple-500/20',
    text: 'from-purple-400 to-purple-300',
    hover: 'group-hover:text-purple-300',
  },
  green: {
    border: 'hover:border-green-500/30',
    gradient: 'from-green-500/5 to-emerald-500/5',
    iconBg: 'from-green-500/20 to-green-600/10',
    iconBorder: 'border-green-500/20',
    text: 'from-green-400 to-green-300',
    hover: 'group-hover:text-green-300',
  },
  amber: {
    border: 'hover:border-amber-500/30',
    gradient: 'from-amber-500/5 to-orange-500/5',
    iconBg: 'from-amber-500/20 to-amber-600/10',
    iconBorder: 'border-amber-500/20',
    text: 'from-amber-400 to-amber-300',
    hover: 'group-hover:text-amber-300',
  },
  red: {
    border: 'hover:border-red-500/30',
    gradient: 'from-red-500/5 to-rose-500/5',
    iconBg: 'from-red-500/20 to-red-600/10',
    iconBorder: 'border-red-500/20',
    text: 'from-red-400 to-red-300',
    hover: 'group-hover:text-red-300',
  },
};

export function MetricCard({
  label,
  value,
  sublabel,
  icon,
  color = 'blue',
}: MetricCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`group relative glass p-6 overflow-hidden ${c.border} transition-all duration-300 animate-slide-up`}
    >
      {/* Hover gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      {/* Shimmer on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="animate-shimmer" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        {icon && (
          <div
            className={`shrink-0 p-3 bg-gradient-to-br ${c.iconBg} rounded-xl border ${c.iconBorder} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-slate-400 text-sm font-medium mb-1 truncate">{label}</p>
          <p
            className={`text-3xl font-bold bg-gradient-to-r ${c.text} bg-clip-text text-transparent group-hover:scale-105 transition-transform`}
          >
            {value}
          </p>
          {sublabel && (
            <p className="text-slate-500 text-xs mt-1 truncate">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
