import * as React from "react"
import { cn } from "@/lib/utils"

interface StatusGaugeProps {
  value: number // 0-100
  label: string
  size?: number
  className?: string
}

export function StatusGauge({ value, label, size = 120, className }: StatusGaugeProps) {
  // Semi-circle logic
  const radius = 40
  const circumference = Math.PI * radius
  const progress = Math.min(Math.max(value, 0), 100)
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Color logic
  const getColor = (val: number) => {
    if (val < 50) return "#ef4444" // Red
    if (val < 80) return "#fbbf24" // Amber
    return "#10b981" // Emerald
  }

  const color = getColor(progress)

  return (
    <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size / 1.5 }}>
      <svg width={size} height={size} viewBox="0 0 100 50" className="overflow-visible">
        {/* Track */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <div className="text-2xl font-bold text-text-obsidian leading-none">{value}%</div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</div>
      </div>
    </div>
  )
}
