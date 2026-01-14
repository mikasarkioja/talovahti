import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export class BillingCalculator {
    static async calculateMonthlyInvoice(apartmentId: string) {
        const apartment = await prisma.apartment.findUnique({
            where: { id: apartmentId },
            include: { housingCompany: true }
        })

        if (!apartment) throw new Error("Apartment not found")
        const company = apartment.housingCompany

        // Calculations
        const shareCount = apartment.shareCount
        const hoitovastike = new Prisma.Decimal(shareCount).mul(company.maintenanceFeePerShare)
        const rahoitusvastike = new Prisma.Decimal(shareCount).mul(company.financeFeePerShare)
        const waterFee = apartment.waterFeeAdvance || new Prisma.Decimal(0)
        
        // Total
        const total = hoitovastike.add(rahoitusvastike).add(waterFee)

        return {
            amount: total,
            breakdown: {
                hoitovastike: hoitovastike.toNumber(),
                rahoitusvastike: rahoitusvastike.toNumber(),
                vesimaksu: waterFee.toNumber()
            },
            housingCompanyId: company.id
        }
    }

    static calculateReferenceNumber(companyId: string, apartmentId: string): string {
        // Simplified Reference Number Generation
        // In real app, use the company's base reference + apartment specific suffix + check digit
        // Mock: 1000 + Apartment Number (parsed) + Date
        // Since we don't have integer apartment number easily parsable, we hash or mock.
        return `1000${Date.now().toString().slice(-6)}` 
    }
}
