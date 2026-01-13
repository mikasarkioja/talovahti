import { prisma } from '@/lib/db'
import { LoanBrokerageUI } from '@/components/finance/LoanBrokerageUI'

export const dynamic = 'force-dynamic'

export default async function LoansPage() {
  const projects = await prisma.project.findMany({
    where: { 
        status: { in: ['ROI_ANALYSIS', 'TENDERING', 'TECH_LEAD'] } 
    },
    orderBy: { createdAt: 'desc' }
  })

  const applications = await prisma.loanApplication.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-950 min-h-screen text-slate-100">
      <LoanBrokerageUI projects={projects} applications={applications} />
    </div>
  )
}
