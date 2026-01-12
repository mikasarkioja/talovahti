import { prisma } from './db'

export const energyMath = {
  // 1. Calculate Sector Health (0-100)
  async calculateSectorHealth(housingCompanyId: string) {
    const leaks = await prisma.thermalLeak.findMany({
      where: { housingCompanyId }
    })

    // Group by Sector
    const sectors: Record<string, number> = {}
    
    leaks.forEach(leak => {
        const sector = leak.sector || 'Unknown'
        if (!sectors[sector]) sectors[sector] = 0
        sectors[sector] += 1
    })

    // Calculate Health per Sector
    // Base 100. Each leak removes 10 points. 3 leaks = 70 (Warning). 5 leaks = 50 (Critical).
    const sectorHealth: Record<string, { health: number, status: string, leakCount: number }> = {}

    for (const [sector, count] of Object.entries(sectors)) {
        let health = Math.max(0, 100 - (count * 10))
        let status = 'EFFICIENT' // Deep Blue

        if (count >= 3) status = 'WARNING' // Neon Orange
        if (count >= 5) status = 'CRITICAL' // Pulsing Red

        sectorHealth[sector] = { health, status, leakCount: count }
    }

    return sectorHealth
  },

  // 2. Calculate ROI / Savings
  async calculateEstimatedSavings(housingCompanyId: string) {
    const leaks = await prisma.thermalLeak.findMany({
      where: { housingCompanyId }
    })

    let totalSeverity = 0
    leaks.forEach(l => totalSeverity += l.severity)

    // Assumptions
    const KWH_LOSS_PER_SEVERITY_POINT = 500 // kWh per year
    const PRICE_PER_KWH = 0.15 // EUR

    const annualSavingsKwh = totalSeverity * KWH_LOSS_PER_SEVERITY_POINT
    const annualSavingsEur = annualSavingsKwh * PRICE_PER_KWH

    return {
        annualSavingsEur: Math.round(annualSavingsEur),
        annualSavingsKwh: Math.round(annualSavingsKwh),
        leakCount: leaks.length
    }
  }
}
