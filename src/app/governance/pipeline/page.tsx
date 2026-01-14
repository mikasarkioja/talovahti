'use client'
import { KanbanBoard } from "@/components/governance/KanbanBoard"
import { useStore } from "@/lib/store"
import { Plus } from "lucide-react"

export default function PipelinePage() {
  const { currentUser, addInitiative } = useStore()
  
  const handleAdd = () => {
    // Quick prompt for demo, replace with real modal in prod
    const title = prompt("Aloitteen otsikko:")
    if (!title) return
    const desc = prompt("Kuvaus:") || ""
    
    addInitiative({
      id: `init-${Date.now()}`,
      title,
      description: desc,
      status: 'OPEN_FOR_SUPPORT',
      authorId: currentUser?.id || 'anon',
      votes: [],
      createdAt: new Date()
    })
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Päätösputki (Consensus Pipeline)</h1>
          <p className="text-slate-500">Seuraa ja hallinnoi päätöksentekoprosessia neuvottelusta päätökseen.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
        >
          <Plus size={18} />
          Uusi aloite
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  )
}
