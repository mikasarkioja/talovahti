import { MockRenovation, MockAssessment } from "@/lib/store";

export type ProjectPriority = {
  score: number
  label: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW'
  color: string
}

export function calculatePriorityScore(renovation: MockRenovation, assessments: MockAssessment[] = []): ProjectPriority {
  // 1. Technical Urgency (40%)
  // Find highest severity grade related to this renovation
  // In our mock, we assume assessments are linked (though schema link is optional, we simulate logic)
  // For demo, we might not have direct link in store yet, so we use a placeholder or assume data passed in is relevant.
  // Let's assume we pass relevant assessments.
  
  const maxSeverity = assessments.length > 0 
    ? Math.max(...assessments.map(a => a.severityGrade)) 
    : 1 // Default if no assessments

  // 2. Risk of Delay (30%)
  // Simulated: If component is "Vesikatto" or "Putkisto", risk is high (secondary damage)
  const criticalComponents = ['Vesikatto', 'Putkisto', 'Viemärit', 'Salaojat']
  const riskScore = criticalComponents.some(c => renovation.component.includes(c)) ? 100 : 50

  // 3. Energy ROI (15%)
  // Simulated: Renovation type
  const energyComponents = ['Lämmitys', 'Ikkunat', 'Julkisivu', 'LTO', 'Maalämpö']
  const roiScore = energyComponents.some(c => renovation.component.includes(c)) ? 100 : 20

  // 4. Resident Nuisance (15%)
  // Simulated: High nuisance = lower score? Or higher priority to get it over with?
  // Usually, technical priority drives it. Let's say high nuisance = high urgency to coordinate well.
  const nuisanceScore = 50 

  // Calculation
  // Severity (1-4) -> Normalized to 0-100: (Grade/4)*100
  const technicalScore = (maxSeverity / 4) * 100
  
  const totalScore = (technicalScore * 0.4) + (riskScore * 0.3) + (roiScore * 0.15) + (nuisanceScore * 0.15)

  // Override: Critical Severity = IMMEDIATE
  if (maxSeverity === 4) {
    return { score: 100, label: 'IMMEDIATE', color: 'text-red-600 bg-red-50 border-red-200' }
  }

  if (totalScore >= 80) return { score: totalScore, label: 'HIGH', color: 'text-orange-600 bg-orange-50 border-orange-200' }
  if (totalScore >= 50) return { score: totalScore, label: 'MEDIUM', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
  return { score: totalScore, label: 'LOW', color: 'text-green-600 bg-green-50 border-green-200' }
}

export function calculateVastikeImpact(cost: number, totalShares: number, isLoan: boolean, loanTermYears: number = 20, interestRate: number = 0.04) {
  // Cost per share (total project cost / shares)
  const costPerShare = cost / totalShares

  if (!isLoan) {
    // Cash: Often collected as "Extra Vastike" over e.g. 6 months or 1-time
    // Let's assume impact is presented as "Total One-off" or "Monthly increase for 1 year"
    // For comparison, let's normalize to a monthly cost for a 1-year collection period?
    // Or just return the raw capital needed.
    // Prompt says: "Monthly fee would increase by X".
    // For cash projects, usually 1-3 extra monthly vastikes are collected.
    // Let's return the "Monthly equivalent if collected over 12 months" for feasibility comparison.
    return costPerShare / 12
  }

  // Loan Annuity Calculation
  // Monthly Rate
  const r = interestRate / 12
  const n = loanTermYears * 12
  
  // PMT = P * (r(1+r)^n) / ((1+r)^n - 1)
  const monthlyPaymentPerShare = costPerShare * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  
  return monthlyPaymentPerShare
}
