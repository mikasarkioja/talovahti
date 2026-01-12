import { prisma } from './db'
import { MeterType } from '@prisma/client'

export type BillingResult = {
  consumption: number
  actualCost: number
  paidAdvance: number
  balance: number
}

export type TasausReport = {
  apartmentId: string
  periodStart: Date
  periodEnd: Date
  details: Partial<Record<MeterType, BillingResult>>
  summary: {
    totalActualCost: number
    totalPaidAdvance: number
    totalBalance: number
  }
}

export const billingEngine = {
  async calculateTasaus(
    apartmentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TasausReport> {
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
      include: { meters: true }
    })

    if (!apartment) throw new Error('Apartment not found')

    // Estimate months for advance calculation
    const durationMs = endDate.getTime() - startDate.getTime()
    const months = Math.max(1, Math.round(durationMs / (1000 * 60 * 60 * 24 * 30.44)))

    const getPrice = async (type: MeterType) => {
      const price = await prisma.utilityPrice.findFirst({
        where: {
          housingCompanyId: apartment.housingCompanyId,
          type,
          validFrom: { lte: endDate }
        },
        orderBy: { validFrom: 'desc' }
      })
      return price ? Number(price.pricePerUnit) : 0
    }

    const consumptionByType: Record<MeterType, number> = {
      WATER_HOT: 0,
      WATER_COLD: 0,
      ELECTRICITY: 0
    }

    for (const meter of apartment.meters) {
      const startReading = await prisma.reading.findFirst({
        where: { meterId: meter.id, date: { lte: startDate } },
        orderBy: { date: 'desc' }
      })

      const endReading = await prisma.reading.findFirst({
        where: { meterId: meter.id, date: { lte: endDate } },
        orderBy: { date: 'desc' }
      })

      if (startReading && endReading) {
        consumptionByType[meter.type] += (Number(endReading.value) - Number(startReading.value))
      }
    }

    const prices = {
      WATER_HOT: await getPrice('WATER_HOT'),
      WATER_COLD: await getPrice('WATER_COLD'),
      ELECTRICITY: await getPrice('ELECTRICITY')
    }

    const costs = {
      WATER_HOT: consumptionByType.WATER_HOT * prices.WATER_HOT,
      WATER_COLD: consumptionByType.WATER_COLD * prices.WATER_COLD,
      ELECTRICITY: consumptionByType.ELECTRICITY * prices.ELECTRICITY
    }

    const advances = {
      WATER: Number(apartment.waterFeeAdvance || 0) * months,
      ELECTRICITY: Number(apartment.elecFeeAdvance || 0) * months
    }

    // Distribute water advance proportionally to cost? Or just split 50/50?
    // Let's just track it at top level for Water. 
    // But we need to return BillingResult per type.
    // I'll assign 0 advance to hot/cold individual lines and handle balance in a combined way or 
    // simpler: Assume water advance covers both.
    
    // Let's allocate water advance based on cost ratio
    const totalWaterCost = costs.WATER_HOT + costs.WATER_COLD
    const hotRatio = totalWaterCost > 0 ? costs.WATER_HOT / totalWaterCost : 0
    const coldRatio = totalWaterCost > 0 ? costs.WATER_COLD / totalWaterCost : 0

    const details: Partial<Record<MeterType, BillingResult>> = {
      WATER_HOT: {
        consumption: consumptionByType.WATER_HOT,
        actualCost: costs.WATER_HOT,
        paidAdvance: advances.WATER * hotRatio,
        balance: costs.WATER_HOT - (advances.WATER * hotRatio)
      },
      WATER_COLD: {
        consumption: consumptionByType.WATER_COLD,
        actualCost: costs.WATER_COLD,
        paidAdvance: advances.WATER * coldRatio,
        balance: costs.WATER_COLD - (advances.WATER * coldRatio)
      },
      ELECTRICITY: {
        consumption: consumptionByType.ELECTRICITY,
        actualCost: costs.ELECTRICITY,
        paidAdvance: advances.ELECTRICITY,
        balance: costs.ELECTRICITY - advances.ELECTRICITY
      }
    }

    const totalActualCost = costs.WATER_HOT + costs.WATER_COLD + costs.ELECTRICITY
    const totalPaidAdvance = advances.WATER + advances.ELECTRICITY
    const totalBalance = totalActualCost - totalPaidAdvance

    return {
      apartmentId,
      periodStart: startDate,
      periodEnd: endDate,
      details,
      summary: {
        totalActualCost,
        totalPaidAdvance,
        totalBalance
      }
    }
  }
}
