import { MockBudgetLine, MockFinance } from '@/lib/store'
import { BudgetCategory } from '@prisma/client'
import { getCategoryLabel } from '@/lib/finance'

export type BudgetVariance = {
  category: BudgetCategory
  label: string
  budgeted: number
  actual: number
  absoluteVariance: number // Actual - Budgeted (Positive = Over budget)
  relativeVariance: number // %
  impactScore: number // absoluteVariance * weight (simplified: just abs variance here as weight is implicit in magnitude)
  status: 'OVER' | 'UNDER' | 'ON_TRACK'
}

export type VastikeHealth = {
  liquidityRatio: number
  optimalVastike: number // €/m2
  currentVastike: number // €/m2
  status: 'LOW' | 'OPTIMAL' | 'HIGH'
  recommendation: string
  requiredChange: number // €/m2
  totalAnnualCosts: number
  safetyMargin: number
}

// Mock Total Area for calculations
const TOTAL_SQM = 2500 

export function analyzeBudgetAccuracy(lines: MockBudgetLine[]): BudgetVariance[] {
  return lines.map(line => {
    const variance = line.actualSpent - line.budgetedAmount
    const relVariance = line.budgetedAmount > 0 ? (variance / line.budgetedAmount) * 100 : 0
    
    return {
      category: line.category,
      label: getCategoryLabel(line.category),
      budgeted: line.budgetedAmount,
      actual: line.actualSpent,
      absoluteVariance: variance,
      relativeVariance: relVariance,
      impactScore: Math.abs(variance), // Prioritize big misses regardless of direction
      status: (variance > 500 ? 'OVER' : variance < -500 ? 'UNDER' : 'ON_TRACK') as 'OVER' | 'UNDER' | 'ON_TRACK'
    }
  }).sort((a, b) => b.impactScore - a.impactScore)
}

export function calculateVastikeHealth(finance: MockFinance, lines: MockBudgetLine[]): VastikeHealth {
  const totalAnnualCosts = lines.reduce((sum, line) => sum + line.actualSpent, 0)
  const monthlyBurnRate = totalAnnualCosts / 12
  
  // Liquidity Ratio: Cash / Monthly Burn
  const liquidityRatio = monthlyBurnRate > 0 ? finance.reserveFund / monthlyBurnRate : 0
  
  // Optimal Vastike Calculation
  // (Total Costs + 10% Margin) / SQM / 12
  const safetyMargin = totalAnnualCosts * 0.10
  const optimalAnnualTotal = totalAnnualCosts + safetyMargin
  const optimalVastike = optimalAnnualTotal / TOTAL_SQM / 12
  
  // Current Vastike (Derived from monthly income / sqm)
  const currentVastike = finance.monthlyIncome / TOTAL_SQM // Assuming monthlyIncome is mostly vastike
  
  const diff = currentVastike - optimalVastike
  
  let status: 'LOW' | 'OPTIMAL' | 'HIGH' = 'OPTIMAL'
  if (diff < -0.2) status = 'LOW'
  if (diff > 0.5) status = 'HIGH'
  
  let recommendation = ''
  if (status === 'LOW') recommendation = `Vastike on liian matala. Puskuri jää alle tavoitteen.`
  else if (status === 'HIGH') recommendation = `Vastike on korkea. Ylijäämä voidaan siirtää korjausrahastoon.`
  else recommendation = `Vastike on sopivalla tasolla.`

  return {
    liquidityRatio,
    optimalVastike,
    currentVastike,
    status,
    recommendation,
    requiredChange: -diff, // If diff is negative (low), required change is positive
    totalAnnualCosts,
    safetyMargin
  }
}

export function generateBoardRecommendation(variances: BudgetVariance[], health: VastikeHealth): string {
  const topOver = variances.find(v => v.absoluteVariance > 0)
  const topUnder = variances.find(v => v.absoluteVariance < 0)
  
  let text = `Vuoden ${new Date().getFullYear()} talousarvio on `
  
  const totalVariance = variances.reduce((sum, v) => sum + v.absoluteVariance, 0)
  if (totalVariance > 1000) text += `ylittynyt yhteensä ${totalVariance.toLocaleString()} euroa. `
  else if (totalVariance < -1000) text += `alittunut yhteensä ${Math.abs(totalVariance).toLocaleString()} euroa. `
  else text += `toteutunut suunnitellusti. `
  
  if (topOver && topOver.absoluteVariance > 1000) {
    text += `Suurin kustannuspaine tuli kategoriasta ${topOver.label} (+${topOver.absoluteVariance.toLocaleString()} €). `
  }
  
  if (health.status === 'LOW') {
    text += `Nykyinen vastiketaso (${health.currentVastike.toFixed(2)} €/m²) ei kata nousseita kustannuksia pitkällä aikavälillä. `
    text += `Hallitus suosittelee vastikkeen korottamista tasolle ${health.optimalVastike.toFixed(2)} €/m² (+${health.requiredChange.toFixed(2)} €).`
  } else if (health.status === 'HIGH') {
    text += `Yhtiön maksuvalmius on erinomainen. Ylijäämä suositellaan siirrettäväksi PTS-rahastoon.`
  } else {
    text += `Vastiketaso on tasapainossa, eikä muutoksille ole tarvetta.`
  }
  
  return text
}
