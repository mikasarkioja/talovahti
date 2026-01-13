import { prisma } from './db'

export type LoanPacket = {
    housingCompany: {
        name: string
        businessId: string
        address: string
        constructionYear: number
        totalShares: number
    }
    project: {
        id: string
        title: string
        description: string
        estimatedCost: number
        energySavings: number
        isGreen: boolean
    }
    financials: {
        investmentGrade: any
        latestStatements: any[]
        repairDebt: number
    }
    governance: {
        minutesSigned: boolean
        boardMembers: number
    }
}

export const bankBridge = {
    async generateLoanPacket(projectId: string): Promise<LoanPacket> {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { housingCompany: true }
        })

        if (!project) throw new Error("Project not found")

        // 1. Investment Grade & Financials
        const ig = await prisma.investmentGrade.findFirst({
            where: { housingCompanyId: project.housingCompanyId },
            orderBy: { createdAt: 'desc' }
        })

        const statements = await prisma.financialStatement.findMany({
            where: { housingCompanyId: project.housingCompanyId },
            orderBy: { year: 'desc' },
            take: 3
        })

        // 2. Mock Minutes Check (In real app, check Meeting model)
        const minutesSigned = true 

        // 3. Share Count
        const apartments = await prisma.apartment.findMany({
            where: { housingCompanyId: project.housingCompanyId }
        })
        const totalShares = apartments.reduce((sum, apt) => sum + apt.shareCount, 0)

        // 4. Energy Efficiency Check
        // Green if explicitly estimated savings > 0 OR type is typically green
        const isGreen = (project.energySavingsEst || 0) > 0 || 
                        ['HEATING', 'WINDOWS', 'FACADE'].includes(project.projectType || '')

        return {
            housingCompany: {
                name: project.housingCompany.name,
                businessId: project.housingCompany.businessId,
                address: project.housingCompany.address,
                constructionYear: project.housingCompany.constructionYear || 0,
                totalShares
            },
            project: {
                id: project.id,
                title: project.title,
                description: `Loan for ${project.type}`,
                estimatedCost: project.estimatedCost || 0,
                energySavings: project.energySavingsEst || 0,
                isGreen
            },
            financials: {
                investmentGrade: ig ? { score: ig.score, grade: ig.grade, pillarScores: ig.pillarScores } : null,
                latestStatements: statements,
                repairDebt: 450 // Mock value from logic engine
            },
            governance: {
                minutesSigned,
                boardMembers: 5 // Mock
            }
        }
    },

    async submitToBankAPI(packet: LoanPacket, bankId: string) {
        // Mock REST Call to Bank API
        console.log(`[BankBridge] Sending packet to ${bankId}...`, JSON.stringify(packet, null, 2))
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000))

        const isGreen = packet.project.isGreen
        const baseMargin = 0.85
        const greenDiscount = isGreen ? 0.20 : 0.0
        
        // Randomize slightly for different banks
        const randomFactor = (Math.random() * 0.15) - 0.05
        const finalMargin = Math.max(0.35, (baseMargin - greenDiscount) + randomFactor)

        return {
            success: true,
            status: 'OFFER_RECEIVED',
            bankName: bankId,
            offerId: `OFFER-${Math.floor(Math.random() * 100000)}`,
            margin: Number(finalMargin.toFixed(2)),
            referenceRate: 'Euribor 12kk',
            repaymentTermYears: 25,
            amountOffered: packet.project.estimatedCost,
            collateralReq: 'Kiinnitys (Mortgage)',
            greenLoan: isGreen
        }
    }
}
