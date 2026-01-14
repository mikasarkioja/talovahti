import { getOpsBoardItems } from '@/app/actions/ops-actions'
import { OpsKanbanBoard } from '@/components/ops/OpsKanbanBoard'

export const dynamic = 'force-dynamic'

export default async function OpsPage() {
  const items = await getOpsBoardItems()

  return (
    <div className="p-6 max-w-[100vw] min-h-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col">
        <div className="mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Projektinhallinta (OpsBoard)</h1>
                <p className="text-slate-400">Vikailmoitukset • Kuntoarvio • Kilpailutus • Toteutus</p>
            </div>
        </div>
        
        <div className="flex-1">
            <OpsKanbanBoard items={items} />
        </div>
    </div>
  )
}
