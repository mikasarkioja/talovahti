'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function syncProjectWorkflow(projectId: string) {
    // 1. Fetch Project
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { scenarios: { where: { isBaseline: false } } } // Get optimized scenario
    })

    if (!project) return { success: false, error: "Project not found" }

    let actionsTaken = []

    // 2. Logic: If Scenario Approved -> Create Draft Loan
    // This assumes we have a way to know if a scenario is "Approved". 
    // For MVP, if a non-baseline scenario exists, we ensure a Draft Loan exists.
    const optimizedScenario = project.scenarios[0]
    if (optimizedScenario) {
        const existingLoan = await prisma.loanApplication.findFirst({
            where: { projectId: project.id }
        })

        if (!existingLoan) {
            await prisma.loanApplication.create({
                data: {
                    housingCompanyId: project.housingCompanyId,
                    projectId: project.id,
                    amount: optimizedScenario.totalLoanAmount,
                    purpose: `Rahoitus: ${project.title}`,
                    status: 'DRAFT',
                    riskAnalysis: JSON.stringify({ source: 'AUTO_SYNC', scenarioId: optimizedScenario.id })
                }
            })
            actionsTaken.push('Created Draft Loan Application')
        }
    }

    // 3. Logic: If Minutes Signed -> Sync Investment Grade
    // (Mocked for now as we don't have full Minutes logic linked to Projects yet)
    
    revalidatePath('/admin')
    return { success: true, actions: actionsTaken }
}
