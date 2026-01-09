import { MockRenovation } from "@/lib/store";

export type HealthStatus = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL'

export function calculateRemainingLife(renov: MockRenovation): {
  remainingYears: number
  percentage: number
  status: HealthStatus
} {
  const currentYear = new Date().getFullYear()
  const yearDone = renov.yearDone || currentYear // fallback if data missing
  const endOfLifeYear = yearDone + renov.expectedLifeSpan
  const remainingYears = endOfLifeYear - currentYear
  
  const percentage = Math.max(0, Math.min(100, (remainingYears / renov.expectedLifeSpan) * 100))
  
  let status: HealthStatus = 'GOOD'
  if (percentage > 75) status = 'EXCELLENT'
  else if (percentage > 40) status = 'GOOD'
  else if (percentage > 15) status = 'WARNING'
  else status = 'CRITICAL'
  
  return { remainingYears, percentage, status }
}

export function estimateFutureCost(currentCost: number, yearsUntil: number): number {
  const INFLATION_RATE = 0.025 // 2.5% annual inflation
  return currentCost * Math.pow(1 + INFLATION_RATE, yearsUntil)
}
