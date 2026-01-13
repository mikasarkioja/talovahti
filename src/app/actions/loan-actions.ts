'use server'

import { prisma } from '@/lib/db'
import { bankBridge } from '@/lib/bank-bridge'
import { revalidatePath } from 'next/cache'

export async function submitLoanApplication(projectId: string, bankNames: string[]) {
    try {
        // 1. Generate Packet
        const packet = await bankBridge.generateLoanPacket(projectId)
        
        // 2. Submit to all selected banks in parallel
        const results = await Promise.all(
            bankNames.map(async (bankName) => {
                const response = await bankBridge.submitToBankAPI(packet, bankName)
                
                // 3. Save Application to DB
                await prisma.loanApplication.create({
                    data: {
                        housingCompanyId: (await prisma.project.findUnique({ where: { id: projectId } }))!.housingCompanyId,
                        projectId: projectId,
                        bankName: bankName,
                        amount: packet.project.estimatedCost,
                        purpose: packet.project.title,
                        status: 'OFFER_RECEIVED',
                        offerMargin: response.margin,
                        repaymentTerm: response.repaymentTermYears,
                        collateralType: response.collateralReq,
                        riskAnalysis: JSON.stringify({ greenLoan: response.greenLoan, score: packet.financials.investmentGrade?.score })
                    }
                })
                return response
            })
        )

        revalidatePath('/admin/finance/loans')
        return { success: true, offers: results }
    } catch (error) {
        console.error("Loan Submission Failed:", error)
        return { success: false, error: 'Failed to submit applications' }
    }
}
