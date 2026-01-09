import { BudgetCategory } from '@prisma/client'

export type BudgetLine = {
  id: string
  category: BudgetCategory
  budgetedAmount: number
  actualSpent: number
  year: number
}

// Helper to calculate variance
// Positive variance = Under budget (Good)
// Negative variance = Over budget (Bad)
export function calculateVariance(line: BudgetLine): number {
  return line.budgetedAmount - line.actualSpent
}

// Helper to calculate burn rate (Percentage of budget used)
export function calculateBurnRate(line: BudgetLine): number {
  if (line.budgetedAmount === 0) return 0
  return (line.actualSpent / line.budgetedAmount) * 100
}

// Helper to get Finnish label for category
export function getCategoryLabel(category: BudgetCategory): string {
  const labels: Record<BudgetCategory, string> = {
    HEATING: 'Lämmitys',
    WATER: 'Vesi & Jätevesi',
    ADMIN: 'Hallinto & Isännöinti',
    MAINTENANCE: 'Huolto & Korjaukset',
    CLEANING: 'Siivous'
  }
  return labels[category] || category
}
