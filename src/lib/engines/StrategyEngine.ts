import { MockFinance, MockRenovation, MockObservation, MockTicket } from '@/lib/store'

export class StrategyEngine {
  /**
   * Calculates Energy Intensity (E-Value approximation)
   * @param totalConsumptionKwh Total annual energy consumption
   * @param totalAreaM2 Total heated floor area
   * @returns kWh/m²
   */
  static calculateEnergyIntensity(totalConsumptionKwh: number, totalAreaM2: number): number {
    if (totalAreaM2 === 0) return 0
    return Math.round((totalConsumptionKwh / totalAreaM2) * 10) / 10
  }

  /**
   * Calculates a Maintenance Backlog Score (0-100)
   * 100 = No backlog, perfect condition
   * < 50 = Critical backlog
   */
  static calculateMaintenanceBacklogScore(
    observations: MockObservation[],
    renovations: MockRenovation[],
    tickets: MockTicket[]
  ): number {
    let score = 100

    // 1. Open Observations (-2 per item)
    const openObservations = observations.filter(o => o.status === 'OPEN').length
    score -= openObservations * 2

    // 2. Overdue Renovations (-15 per item)
    const currentYear = new Date().getFullYear()
    const overdueRenovations = renovations.filter(
      r => r.status === 'PLANNED' && r.plannedYear && r.plannedYear < currentYear
    ).length
    score -= overdueRenovations * 15

    // 3. Active Critical Tickets (-10 per item)
    const criticalTickets = tickets.filter(
      t => t.status !== 'CLOSED' && t.status !== 'RESOLVED' && (t.priority === 'CRITICAL' || t.priority === 'HIGH')
    ).length
    score -= criticalTickets * 10

    return Math.max(0, score)
  }

  /**
   * Generates a Financial Health Grade (A-E)
   * Based on fee collection rate and relative indebtedness.
   */
  static calculateFinancialHealthScore(finance: MockFinance): { grade: string; score: number } {
    const { collectionPercentage, companyLoansTotal } = finance
    
    // Simplistic Property Value Est: 2.6M (Hardcoded for mock context)
    const ESTIMATED_PROPERTY_VALUE = 2600000 
    const ltv = (companyLoansTotal / ESTIMATED_PROPERTY_VALUE) * 100

    let baseScore = 0

    // Collection Impact (0-50 pts)
    if (collectionPercentage >= 99) baseScore += 50
    else if (collectionPercentage >= 95) baseScore += 40
    else if (collectionPercentage >= 90) baseScore += 20
    else baseScore += 0

    // LTV Impact (0-50 pts)
    if (ltv < 20) baseScore += 50
    else if (ltv < 40) baseScore += 40
    else if (ltv < 60) baseScore += 20
    else baseScore += 0

    let grade = 'E'
    if (baseScore >= 90) grade = 'A'
    else if (baseScore >= 75) grade = 'B'
    else if (baseScore >= 60) grade = 'C'
    else if (baseScore >= 40) grade = 'D'

    return { grade, score: baseScore }
  }
}
