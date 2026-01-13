import { prisma } from './db'

export const investmentLogic = {
    async calculateRepairDebt(housingCompanyId: string) {
        // 1. Fetch benchmarks and renovations
        const benchmarks = await prisma.costBenchmark.findMany()
        const renovations = await prisma.renovation.findMany({ where: { housingCompanyId } })
        
        // Mock Building Data (Should come from DB/MML)
        const buildingM2 = 2500 
        const builtYear = 1968 
        const currentYear = new Date().getFullYear()

        let totalDebt = 0
        let totalReplacementValue = 0

        benchmarks.forEach(bm => {
            const renovation = renovations.find(r => r.component.toUpperCase().includes(bm.category))
            const lastDone = renovation ? (renovation.yearDone || renovation.plannedYear || builtYear) : builtYear
            
            const age = currentYear - lastDone
            const life = bm.expectedLifeYears
            const replacementCost = bm.unitPriceM2 * buildingM2
            
            totalReplacementValue += replacementCost

            // Straight-line debt calculation
            // If age > life, debt is full replacement cost
            if (age >= life) {
                totalDebt += replacementCost
            } else {
                totalDebt += replacementCost * (age / life)
            }
        })

        return {
            totalDebt: Math.round(totalDebt),
            debtPerM2: Math.round(totalDebt / buildingM2),
            technicalCondition: 100 - (totalDebt / totalReplacementValue * 100)
        }
    },

    async generateIGScore(housingCompanyId: string) {
        const debt = await this.calculateRepairDebt(housingCompanyId)
        
        // Mock other pillars
        const financeScore = 85 // Reserves, liquidity
        const energyScore = 60 // E-class
        const governanceScore = 90 // Active board, good documents

        // Weighted Score (40/30/15/15)
        // Repair Debt Score: 100 is good (0 debt), 0 is bad (full debt)
        const repairScore = debt.technicalCondition
        
        const totalScore = (
            (repairScore * 0.4) +
            (financeScore * 0.3) +
            (energyScore * 0.15) +
            (governanceScore * 0.15)
        )

        let grade = 'E'
        if (totalScore >= 90) grade = 'A'
        else if (totalScore >= 80) grade = 'B'
        else if (totalScore >= 70) grade = 'C'
        else if (totalScore >= 60) grade = 'D'

        return {
            score: Math.round(totalScore),
            grade,
            pillars: {
                repairs: Math.round(repairScore),
                finance: financeScore,
                energy: energyScore,
                governance: governanceScore
            },
            recommendation: repairScore < 70 ? 
                `Repair Debt is high (${debt.debtPerM2} €/m²). Prioritize LVIS renovation.` :
                "Condition is good. Focus on Energy ROI."
        }
    }
}
