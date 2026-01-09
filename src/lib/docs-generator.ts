import { MockRenovation, MockUser, MockFinance } from '@/lib/store'

export type IsannointitodistusData = {
  companyName: string
  businessId: string
  apartmentId: string
  shareCount: number
  shareOfLoans: number
  monthlyVastike: number
  energyGrade: string
  renovations: {
    year: number
    description: string
    type: 'DONE' | 'PLANNED'
  }[]
  generatedAt: string
}

export function generateIsannointitodistus(
  user: MockUser, 
  finance: MockFinance, 
  renovations: MockRenovation[],
  companyName: string = "As Oy Esimerkki",
  businessId: string = "1234567-8"
): IsannointitodistusData {

  // Logic: Combine done and planned, sort by year descending (recent first)
  const relevantRenovations = [
    ...renovations.filter(r => r.status === 'COMPLETED').map(r => ({
      year: r.yearDone || 0,
      description: r.description || r.component,
      type: 'DONE' as const
    })),
    ...renovations.filter(r => r.status === 'PLANNED').map(r => ({
      year: r.plannedYear || 0,
      description: r.description || r.component,
      type: 'PLANNED' as const
    }))
  ].sort((a, b) => b.year - a.year).slice(0, 5) // Top 5 recent/upcoming

  // Mock Energy Grade (usually stored in db)
  const energyGrade = 'C2018'

  // Calculate fees (Hoitovastike + Rahoitusvastike)
  // Mock: 4.5€/m2 hoito + loan share implication
  // Just use a mock total for now based on share count
  const monthlyVastike = (user.shareCount * 4.5) + (user.personalDebtShare ? (user.personalDebtShare * 0.005) : 0)

  return {
    companyName,
    businessId,
    apartmentId: user.apartmentId || 'N/A',
    shareCount: user.shareCount,
    shareOfLoans: user.personalDebtShare || 0,
    monthlyVastike,
    energyGrade,
    renovations: relevantRenovations,
    generatedAt: new Date().toLocaleDateString('fi-FI')
  }
}

export function checkPTSSafety(renovations: MockRenovation[]): { safe: boolean, lastUpdated?: Date } {
  // Mock check: Look for any renovation with updated date or created date within 12 months
  // Since our mock objects don't track update timestamps deeply, we'll assume safe if we have planned items.
  const hasPlanned = renovations.some(r => r.status === 'PLANNED')
  // In real app: check Project or Renovation updatedAt field
  const lastUpdated = new Date() // Mock
  
  return {
    safe: hasPlanned,
    lastUpdated
  }
}
