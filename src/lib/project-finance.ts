import { prisma } from './db'

export const projectFinance = {
  // Mock Energy Price (e.g., 85€/MWh for District Heating + Transfer)
  ENERGY_PRICE_EUR_PER_MWH: 85.0, 
  INFLATION_RATE: 0.02,
  DISCOUNT_RATE: 0.05,

  async calculateProjectROI(projectId: string) {
    // 1. Fetch Project Data
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { housingCompany: { include: { thermalLeaks: true } } }
    })

    if (!project) throw new Error('Project not found')

    // 2. Aggregate Thermal Leaks (Mocking the relation to project scope)
    // In a real app, we might filter leaks by the project's 'affectedArea' (e.g. ROOF vs WINDOWS)
    // For now, take all leaks if the project is relevant
    const leaks = project.housingCompany.thermalLeaks || []
    
    // Estimate Energy Loss from Leaks (Mock Logic)
    // Assume each severity 1.0 point = 1.5 MWh / year loss
    let totalSeverity = 0
    leaks.forEach(l => totalSeverity += l.severity)
    
    // If project has manual estimate, use it, otherwise derive from leaks
    let annualEnergySavingsMWh = project.energySavingsEst || 0
    if (annualEnergySavingsMWh === 0 && leaks.length > 0) {
        annualEnergySavingsMWh = totalSeverity * 1.5
    }
    
    // Default fallback if no data
    if (annualEnergySavingsMWh === 0) annualEnergySavingsMWh = 20 // 20 MWh default

    const estimatedCost = project.estimatedCost || 100000 // Fallback

    // 3. Calculate Financial Metrics
    
    // Payback Period (Simple)
    const annualSavingsEur = annualEnergySavingsMWh * this.ENERGY_PRICE_EUR_PER_MWH
    const paybackYears = annualSavingsEur > 0 ? estimatedCost / annualSavingsEur : 99

    // 10-Year NPV
    let npv = -estimatedCost
    for (let t = 1; t <= 10; t++) {
        // Future energy price with inflation
        const futurePrice = this.ENERGY_PRICE_EUR_PER_MWH * Math.pow(1 + this.INFLATION_RATE, t)
        const cashFlow = annualEnergySavingsMWh * futurePrice
        npv += cashFlow / Math.pow(1 + this.DISCOUNT_RATE, t)
    }

    return {
        estimatedCost,
        annualSavingsMWh: Math.round(annualEnergySavingsMWh),
        annualSavingsEur: Math.round(annualSavingsEur),
        paybackYears: Number(paybackYears.toFixed(1)),
        npv10Year: Math.round(npv),
        leakCount: leaks.length
    }
  }
}
