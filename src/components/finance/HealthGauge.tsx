"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthGaugeProps {
  score: string; // 'A' | 'B' | 'C' | 'D' | 'E'
  utilization: number; // e.g. 95 (percent)
}

export function HealthGauge({ score, utilization }: HealthGaugeProps) {
  // Clamp utilization for the gauge visual (0-100 normally, but can go higher)
  // We'll map 0-150% to the gauge arc? Or just 0-100?
  // User says "visualize the utilization percentage".
  // Typically gauges go 0-100. If > 100, full?
  // Let's assume 0-120 range for the visual arc to show overage.
  const percentage = Math.min(Math.max(utilization, 0), 120);
  const circumference = 2 * Math.PI * 40; // r=40
  const offset = circumference - (percentage / 120) * circumference;

  // Dynamic Coloring
  const getColor = (s: string) => {
    if (["A", "B"].includes(s)) return "text-emerald-500";
    if (s === "C") return "text-amber-500";
    return "text-rose-600";
  };

  const colorClass = getColor(score);

  return (
    <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
      {/* Background Circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-100"
        />
        {/* Animated Gauge Arc */}
        <motion.circle
          cx="50%"
          cy="50%"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference} // Start empty
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn("stroke-current", colorClass)}
          strokeLinecap="round"
        />
      </svg>

      {/* Centerpiece Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl md:text-5xl font-extrabold", colorClass)}>
          {score}
        </span>
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Kunto
        </span>
      </div>
    </div>
  );
}
