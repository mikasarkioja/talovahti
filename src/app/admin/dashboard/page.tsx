import { prisma } from '@/lib/db'
import { WorkflowEngine } from '@/components/orchestrator/WorkflowEngine'
import { BoardCockpit } from '@/components/dashboard/BoardCockpit'

import { StatusGauge } from '@/components/ui/status-gauge'
import { Card } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { LiquidityWidget } from '@/components/dashboard/LiquidityWidget'
import { AccountingProvider } from '@/lib/finance/accounting-provider'

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
    
    // Need to fetch alerts via Apartments if housingCompanyId is used directly
    const activeAlerts = housingCompanyId ? await prisma.leakAlert.findMany({
        where: {
            status: 'ACTIVE',
            apartment: { housingCompanyId }
        },
        include: { apartment: true },
        orderBy: { createdAt: 'desc' },
        take: 5
    }) : []

    // Progress Tracker Metrics
    const apartmentCount = housingCompanyId ? await prisma.apartment.count({ where: { housingCompanyId } }) : 0
    const financeCount = housingCompanyId ? await prisma.financialStatement.count({ where: { housingCompanyId } }) : 0
    
    // Weighted Score
    let onboardingScore = 0
    if (apartmentCount > 0) onboardingScore += 40
    if (financeCount > 0) onboardingScore += 30
    // Mock remaining 30% for 3D/Photos
    
    const meetings = housingCompanyId ? await prisma.meeting.findMany({
        where: { housingCompanyId, status: 'VOTING' }, // Pending signatures usually in VOTING or LOCKED phase
        take: 5
    }) : []

    // Fetch Financials
    const bankData = await AccountingProvider.syncBankBalance(housingCompanyId || 'mock')
    const pendingInvoices = await AccountingProvider.fetchPendingInvoices(housingCompanyId || 'mock')
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0)

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
            
            <LiquidityWidget balance={bankData.balance} upcoming={pendingAmount} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
                <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-slate-400">Digital Twin Completion</h3>
                        <div className="mt-2 text-2xl font-bold text-white">{onboardingScore}%</div>
                        <div className="mt-1 text-xs text-brand-emerald">
                            {onboardingScore < 100 ? 'Data Ingestion Active' : 'Fully Calibrated'}
                        </div>
                    </div>
                    <StatusGauge value={onboardingScore} label="Valmius" />
                </Card>
                
                {onboardingScore < 100 && (
                    <Card className="bg-slate-900 border-slate-800 p-6 col-span-2 flex flex-col justify-center">
                        <h3 className="text-white font-medium mb-2">Seuraavat toimenpiteet</h3>
                        <div className="flex gap-4">
                            {apartmentCount === 0 && (
                                <Link href="/admin/mml-sync" className="text-sm text-brand-emerald hover:underline flex items-center">
                                    1. Tuo Huoneistotiedot (MML) <ArrowRight size={14} className="ml-1" />
                                </Link>
                            )}
                            <Link href="/admin/onboarding/calibration" className="text-sm text-brand-emerald hover:underline flex items-center">
                                2. Kalibroi 3D-malli <ArrowRight size={14} className="ml-1" />
                            </Link>
                            <Link href="/onboarding/resident-survey" className="text-sm text-brand-emerald hover:underline flex items-center">
                                3. Kutsu asukkaat kartoitukseen <ArrowRight size={14} className="ml-1" />
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
            
            <BoardCockpit workflowState={workflowState as any} pulseItems={pulseItems} />
        </div>
    )
}
