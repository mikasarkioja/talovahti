import { InvestmentType } from '@prisma/client'

export type InvestmentScenario = {
  id: string
  title: string
  type: InvestmentType
  initialCost: number
  annualSavings: number
  lifespan: number
  energySavedKwh: number
}

type YearlyData = {
  year: number
  cumulativeCashFlow: number
}

export function calculateInvestmentPath(scenario: InvestmentScenario, inflationRate = 0.03): YearlyData[] {
  const data: YearlyData[] = []
  let cumulative = -scenario.initialCost
  let currentSavings = scenario.annualSavings

  for (let year = 0; year <= scenario.lifespan; year++) {
    if (year === 0) {
      data.push({ year, cumulativeCashFlow: cumulative })
      continue
    }

    // Adjust savings for energy price inflation
    currentSavings = currentSavings * (1 + inflationRate)
    
    cumulative += currentSavings
    data.push({ year, cumulativeCashFlow: Math.round(cumulative) })
  }

  return data
}

export function calculateBaselinePath(years: number, annualCost: number, inflationRate = 0.03): YearlyData[] {
  const data: YearlyData[] = []
  let cumulative = 0
  let currentCost = annualCost

  for (let year = 0; year <= years; year++) {
    if (year === 0) {
      data.push({ year, cumulativeCashFlow: 0 })
      continue
    }
    
    // Baseline "cost" is negative savings relative to doing nothing? 
    // Usually baseline is 0 in ROI charts, or we compare Total Cost of Ownership (TCO).
    // Prompt says: "Stay on District Heating" (Rising costs line).
    // If Y-Axis is "Cumulative Savings", then baseline is 0. 
    // But prompt says "Rising costs line". This implies we plot Total Cumulative Cost (negative values).
    
    // Prompt: Y-Axis: Cumulative Euros (Savings minus Initial Cost).
    // Scenario A: Stay on District Heating.
    
    // Let's interpret: 
    // Investment Line: Starts at -Cost, climbs up with savings.
    // Baseline Line: Starts at 0, stays at 0 (Reference)? Or plots avoided cost?
    
    // Better interpretation for clarity:
    // Plot "Total Cumulative Spend".
    // Baseline: 0 -> -Cost (Slope = Annual Energy Bill)
    // Investment: -Initial -> -(Annual Bill - Savings)
    
    // OR Prompt says: "Cumulative Cash Flow (Savings minus Initial Cost)".
    // In this model:
    // Investment starts at -Cost. Adds Savings each year. Breakeven when crosses 0.
    // Baseline (Do nothing): Savings = 0. Cost = 0. Line is flat at 0.
    
    // Prompt says: "Scenario A: Stay on District Heating (Rising costs line)."
    // This contradicts "Savings minus Initial Cost".
    // "Rising costs line" suggests plotting TCO.
    // Let's implement TCO comparison instead as it's more intuitive for "Rising costs".
    // Y-Axis: Cumulative Cost (Negative).
    
    currentCost = currentCost * (1 + inflationRate)
    cumulative -= currentCost
    data.push({ year, cumulativeCashFlow: Math.round(cumulative) })
  }
  return data
}

// Helper to get formatted currency
export const formatEUR = (val: number) => new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
