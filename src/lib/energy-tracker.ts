import { prisma } from './db'
import { BudgetCategory } from '@prisma/client'

export const energyTracker = {
  // Mock Nord Pool API
  async getCurrentElectricityPrice(): Promise<number> {
    // Return cents/kWh (e.g., 15.5 c/kWh)
    // Randomize slightly around 15 cents
    return 15.0 + Math.random() * 5
  },

  async calculateSessionCost(resourceId: string, durationMinutes: number): Promise<number> {
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } })
    if (!resource) return 0

    const powerKw = resource.powerRatingKw || 6.0 // Default 6kW if missing
    const hours = durationMinutes / 60
    const priceCentsPerKwh = await this.getCurrentElectricityPrice()
    const priceEuroPerKwh = priceCentsPerKwh / 100

    const totalCost = powerKw * hours * priceEuroPerKwh
    return Number(totalCost.toFixed(2)) // Round to 2 decimals
  },

  async recordConsumption(housingCompanyId: string, cost: number, kwh: number) {
    console.log(`[ENERGY] Recording consumption: ${kwh.toFixed(2)} kWh, Cost: ${cost.toFixed(2)}€`)

    // Update Budget Line (Utility Fund)
    // Assuming 'HEATING' category covers sauna electricity for now, or could be 'MAINTENANCE'
    const currentYear = new Date().getFullYear()
    
    // Find or create budget line for this year
    const line = await prisma.budgetLineItem.findFirst({
        where: {
            housingCompanyId,
            year: currentYear,
            category: 'HEATING' 
        }
    })

    if (line) {
        await prisma.budgetLineItem.update({
            where: { id: line.id },
            data: {
                actualSpent: { increment: cost }
            }
        })
    }
  }
}
