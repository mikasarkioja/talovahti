'use client'
import { useStore } from '@/lib/store'
import { GovernanceStatus } from '@prisma/client'
import { clsx } from 'clsx'
import { MessageSquare } from 'lucide-react'

const STAGES: GovernanceStatus[] = ['OPEN_FOR_SUPPORT', 'QUALIFIED', 'VOTING', 'APPROVED']

const LABELS: Partial<Record<GovernanceStatus, string>> = {
  OPEN_FOR_SUPPORT: 'Neuvottelu (Kannatus)',
  QUALIFIED: 'Esityslistalla',
  VOTING: 'Äänestys',
  APPROVED: 'Päätetty (Hyväksytty)',
  REJECTED: 'Hylätty',
  DRAFT: 'Luonnos'
}

export function KanbanBoard() {
  const { initiatives, currentUser, updateInitiativeStatus } = useStore()
  
  const canMove = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER'

  const handleDragStart = (e: React.DragEvent, id: string) => {
     if (!canMove) return
     e.dataTransfer.setData('initiativeId', id)
  }

  const handleDrop = (e: React.DragEvent, status: GovernanceStatus) => {
    e.preventDefault()
    if (!canMove) return
    const id = e.dataTransfer.getData('initiativeId')
    if (id) updateInitiativeStatus(id, status)
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (canMove) e.preventDefault()
  }

  const openDiscussion = (id: string) => {
    console.log(`Open discussion for initiative ${id}`)
    // Mock implementation
    alert('Keskustelupaneeli aukeaa tästä (Demo)')
  }

  return (
    <div className="flex gap-4 overflow-x-auto h-[600px] min-w-[1000px] pb-4">
      {STAGES.map(stage => (
        <div 
          key={stage} 
          className="flex-1 min-w-[280px] bg-slate-100 rounded-xl border border-slate-200 flex flex-col"
          onDrop={(e) => handleDrop(e, stage)}
          onDragOver={handleDragOver}
        >
           {/* Header */}
           <div className="p-4 border-b border-slate-200 bg-white rounded-t-xl flex justify-between items-center">
             <h3 className="font-semibold text-slate-700">{LABELS[stage] || stage}</h3>
             <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
               {initiatives.filter(i => i.status === stage).length}
             </span>
           </div>
           
           {/* Items */}
           <div className="p-3 flex-1 space-y-3 overflow-y-auto">
             {initiatives.filter(i => i.status === stage).map(init => (
               <div 
                 key={init.id}
                 draggable={canMove}
                 onDragStart={(e) => handleDragStart(e, init.id)}
                 className={clsx(
                   "bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative flex flex-col gap-3",
                   canMove ? "cursor-grab active:cursor-grabbing" : "cursor-default"
                 )}
               >
                 <div>
                   <div className="text-sm font-medium mb-1 text-slate-900">{init.title}</div>
                   <div className="text-xs text-slate-500 line-clamp-3">{init.description}</div>
                 </div>
                 
                 <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openDiscussion(init.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Avaa keskustelu"
                      >
                        <MessageSquare size={16} />
                      </button>
                   </div>
                   
                   <div className="text-xs text-slate-400 font-medium">
                     {stage === 'VOTING' ? (
                       <span className="text-blue-600">Äänestys käynnissä</span>
                     ) : (
                       <span>{init.status}</span>
                     )}
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      ))}
    </div>
  )
}
