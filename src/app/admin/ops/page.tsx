import { getOpsBoardItems } from '@/app/actions/ops-actions'
import { OpsKanbanBoard } from '@/components/ops/OpsKanbanBoard'

export const dynamic = 'force-dynamic'

export default async function OpsPage() {
  const items = await getOpsBoardItems()

  return (
    <div className="p-8 max-w-[100vw] min-h-screen bg-slate-50/50 flex flex-col gap-8">
        <header className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projektinhallinta</h1>
                <p className="text-slate-500 mt-1">Hallitse taloyhtiön kunnossapidon työnkulkua keskitetysti.</p>
            </div>
        </header>
        
        <div className="flex-1 -mx-8 px-8 overflow-hidden">
            <OpsKanbanBoard items={items} />
        </div>
    </div>
  )
}
