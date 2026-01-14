import { prisma } from '@/lib/db'
import { BillingCalculator } from './billing-logic'
import { addMonths, startOfMonth } from 'date-fns'

export class FennoaSync {
    static async syncInvoicesToAccounting(housingCompanyId: string) {
        console.log(`[Fennoa] Starting invoice sync for ${housingCompanyId}`)
        
        const apartments = await prisma.apartment.findMany({
            where: { housingCompanyId }
        })

        const nextMonth = startOfMonth(addMonths(new Date(), 1))
        const dueDate = new Date(nextMonth)
        dueDate.setDate(5) // Due 5th of next month

        let count = 0

        for (const apt of apartments) {
            try {
                // 1. Calculate
                const calculation = await BillingCalculator.calculateMonthlyInvoice(apt.id)
                const ref = BillingCalculator.calculateReferenceNumber(housingCompanyId, apt.id)

                // 2. Create Local Record
                await prisma.monthlyFee.create({
                    data: {
                        housingCompanyId,
                        apartmentId: apt.id,
                        referenceNumber: ref,
                        amount: calculation.amount,
                        dueDate: dueDate,
                        period: nextMonth,
                        status: 'PENDING',
                        breakdown: calculation.breakdown
                    }
                })

                // 3. Mock API Push
                // await axios.post('https://api.fennoa.com/v1/invoices', { ... })
                count++
            } catch (e) {
                console.error(`Failed to generate invoice for ${apt.apartmentNumber}`, e)
            }
        }

        console.log(`[Fennoa] Generated ${count} invoices.`)
        return count
    }
}
