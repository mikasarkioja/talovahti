'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type KanbanItem = {
    id: string
    title: string
    subtitle?: string
    status: string
    stage: 'INBOX' | 'ASSESSMENT' | 'MARKETPLACE' | 'EXECUTION' | 'VERIFICATION' | 'DONE'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    type: 'TICKET' | 'OBSERVATION' | 'PROJECT'
    date: Date
    meta?: any // Extra data for UI
}

export async function getOpsBoardItems(): Promise<KanbanItem[]> {
    const items: KanbanItem[] = []

    // 1. INBOX (Open Tickets, Not yet escalated)
    const tickets = await prisma.ticket.findMany({
        where: { status: 'OPEN', observationId: null },
        orderBy: { createdAt: 'desc' },
        include: { createdBy: true }
    })

    tickets.forEach(t => items.push({
        id: t.id,
        title: t.title,
        subtitle: t.createdBy.name || 'Unknown',
        status: t.status,
        stage: 'INBOX',
        priority: t.priority as any,
        type: 'TICKET',
        date: t.createdAt
    }))

    // 2. ASSESSMENT (Observations with/without Expert Opinion)
    const observations = await prisma.observation.findMany({
        where: { status: { in: ['OPEN', 'REVIEWED'] } },
        include: { assessment: true, ticket: true }
    })

    observations.forEach(o => {
        // If it has an assessment recommending action, it might be ready for Marketplace
        const hasVerdict = !!o.assessment
        
        // Filter out those already linked to a project (Execution phase)
        // (Assuming we'd link Obs -> Renovation -> Project in a real app, 
        // for now we check if it's "Done" or not)
        
        items.push({
            id: o.id,
            title: o.component,
            subtitle: hasVerdict ? 'Asiantuntija arvioinut' : 'Odottaa arviota',
            status: o.status,
            stage: hasVerdict ? 'MARKETPLACE' : 'ASSESSMENT', 
            priority: 'MEDIUM', // Default
            type: 'OBSERVATION',
            date: o.createdAt,
            meta: { verdict: o.assessment?.technicalVerdict }
        })
    })

    // 3. EXECUTION (Active Projects)
    const projects = await prisma.project.findMany({
        where: { status: { not: 'COMPLETED' } }
    })

    projects.forEach(p => {
        let stage: KanbanItem['stage'] = 'EXECUTION'
        if (p.status === 'TENDERING') stage = 'MARKETPLACE'
        if (p.status === 'WARRANTY') stage = 'VERIFICATION'

        items.push({
            id: p.id,
            title: p.title,
            subtitle: `Status: ${p.status}`,
            status: p.status,
            stage: stage,
            priority: 'HIGH',
            type: 'PROJECT',
            date: p.createdAt
        })
    })

    return items
}

// TRANSITIONS

export async function escalateTicketToObservation(ticketId: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } })
    if (!ticket) return { error: 'Ticket not found' }

    // Create Observation
    const obs = await prisma.observation.create({
        data: {
            component: ticket.title,
            description: ticket.description,
            userId: ticket.createdById,
            housingCompanyId: ticket.housingCompanyId,
            status: 'OPEN'
        }
    })

    // Link
    await prisma.ticket.update({
        where: { id: ticketId },
        data: { observationId: obs.id, status: 'IN_PROGRESS' }
    })

    revalidatePath('/admin/ops')
    return { success: true }
}

export async function submitExpertAssessment(observationId: string, verdict: string) {
    await prisma.expertAssessment.create({
        data: {
            observationId,
            technicalVerdict: verdict,
            severityGrade: 3, // Mock
        }
    })
    
    // Move Obs to reviewed
    await prisma.observation.update({
        where: { id: observationId },
        data: { status: 'REVIEWED' }
    })

    revalidatePath('/admin/ops')
    return { success: true }
}

export async function createProjectFromObservation(observationId: string) {
    const obs = await prisma.observation.findUnique({ where: { id: observationId }, include: { housingCompany: true } })
    if (!obs) return 

    await prisma.project.create({
        data: {
            title: `Korjaus: ${obs.component}`,
            type: 'MAINTENANCE',
            status: 'TENDERING',
            housingCompanyId: obs.housingCompanyId,
            description: obs.description // Note: Schema might not have desc on Project, using title mainly
        }
    })
    
    revalidatePath('/admin/ops')
    return { success: true }
}

export async function completeProject(projectId: string) {
    await prisma.project.update({
        where: { id: projectId },
        data: { status: 'COMPLETED' }
    })
    revalidatePath('/admin/ops')
    return { success: true }
}
