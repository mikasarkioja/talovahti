import { prisma } from '@/lib/db'
import { WorkflowEngine } from '@/components/orchestrator/WorkflowEngine'
import { BoardCockpit } from '@/components/dashboard/BoardCockpit'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    // 1. Fetch Key Data
    // We assume there's one active main project for the dashboard focus, or the latest one.
    const activeProject = await prisma.project.findFirst({
        where: { status: { not: 'COMPLETED' } },
        orderBy: { createdAt: 'desc' },
        include: { loanApplications: true, contract: true }
    })

    const housingCompanyId = activeProject?.housingCompanyId

    // If no active project, we might need a fallback or different view. 
    // For now, let's assume one exists or handle null gracefully.
    
    // Fetch related data
    const ig = housingCompanyId ? await prisma.investmentGrade.findFirst({
        where: { housingCompanyId },
        orderBy: { createdAt: 'desc' }
    }) : null

    const alerts = housingCompanyId ? await prisma.leakAlert.findMany({
        where: { status: 'ACTIVE' } // Removed housingCompanyId because LeakAlert relates to Apartment
    }) : []
    
    // Need to fetch alerts via Apartments if housingCompanyId is used directly
    // Let's correct the query below

    const activeAlerts = housingCompanyId ? await prisma.leakAlert.findMany({
        where: {
            status: 'ACTIVE',
            apartment: { housingCompanyId }
        },
        include: { apartment: true },
        orderBy: { createdAt: 'desc' },
        take: 5
    }) : []

    const meetings = housingCompanyId ? await prisma.meeting.findMany({
        where: { housingCompanyId, status: 'VOTING' }, // Pending signatures usually in VOTING or LOCKED phase
        take: 5
    }) : []

    const updates = housingCompanyId ? await prisma.buildingUpdate.findMany({
        where: { project: { housingCompanyId } },
        orderBy: { createdAt: 'desc' },
        take: 5
    }) : []

    // 2. Run Engine
    const workflowState = activeProject ? WorkflowEngine.analyze(
        activeProject, 
        ig, 
        activeAlerts, 
        meetings
    ) : {
        currentPhase: 'SCAN',
        healthScore: 100,
        nextActions: [{
            id: 'init-proj',
            title: 'Aloita Uusi Hanke',
            description: 'Ei aktiivisia hankkeita. Luo uusi kunnossapito- tai energiahanke.',
            type: 'ROUTINE',
            phase: 'SCAN',
            actionUrl: '/admin/projects/new',
            isReady: true
        }],
        metrics: {
            investmentGrade: ig?.grade || 'N/A',
            complianceStatus: 'OK',
            activeAlerts: activeAlerts.length
        }
    }

    // 3. Pulse Items
    const pulseItems = [
        ...activeAlerts.map(a => ({
            id: a.id,
            type: 'ALERT',
            source: 'LEAK',
            message: `Vuoto havaittu: ${a.apartment.apartmentNumber}`,
            timestamp: 'Juuri nyt'
        })),
        ...updates.map(u => ({
            id: u.id,
            type: 'INFO',
            source: 'CONSTRUCTION',
            message: u.title,
            timestamp: 'Tänään'
        }))
    ]

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-950 text-slate-100">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Hallituksen Työpöytä</h1>
            <p className="text-slate-400 mb-8">Taloyhtiön tilannekuva ja tehtävälista.</p>
            
            <BoardCockpit workflowState={workflowState as any} pulseItems={pulseItems} />
        </div>
    )
}
