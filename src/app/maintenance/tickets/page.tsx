'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Plus, PenTool } from 'lucide-react'
import { clsx } from 'clsx'

export default function TicketsPage() {
  const { tickets, currentUser, addTicket, addObservation } = useStore()
  const [isCreating, setIsCreating] = useState(false)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return
    
    const timestamp = Date.now()
    const obsId = `obs-${timestamp}`
    const ticketId = `ticket-${timestamp}`

    // 1. Create Observation for Expert View (Tehtäväjono)
    // This ensures the issue appears in the property manager's assessment queue
    addObservation({
      id: obsId,
      component: title, // Use title as the component/subject
      description: description,
      status: 'OPEN',
      location: currentUser?.apartmentId || 'Yleiset tilat',
      userId: currentUser?.id || 'unknown',
      createdAt: new Date()
    })

    // 2. Create Ticket for Resident View
    addTicket({
      id: ticketId,
      title,
      description,
      status: 'OPEN',
      priority: 'MEDIUM',
      type: 'MAINTENANCE',
      apartmentId: currentUser?.apartmentId || null,
      createdAt: new Date(),
      observationId: obsId // Link to observation
    })

    setIsCreating(false)
    setTitle('')
    setDescription('')
  }

  // Filter tickets: Board sees all, Resident sees own
  const visibleTickets = !currentUser || (currentUser.role === 'BOARD' || currentUser.role === 'MANAGER')
    ? tickets
    : tickets.filter(t => t.apartmentId === currentUser.apartmentId)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <PenTool className="text-blue-600" />
            Vikailmoitukset
          </h1>
          <p className="text-slate-500 mt-1">Hallinnoi huoltopyyntöjä ja ilmoita vioista.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus size={18} />
          Uusi ilmoitus
        </button>
      </div>

      {isCreating && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="font-semibold text-lg mb-4">Uusi vikailmoitus</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Otsikko</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Esim. Vuotava hana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kuvaus</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Tarkempi kuvaus ongelmasta..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-900"
              >
                Peruuta
              </button>
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Lähetä ilmoitus
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {visibleTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            Ei vikailmoituksia.
          </div>
        ) : (
          visibleTickets.map(ticket => (
            <div key={ticket.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg text-slate-900">{ticket.title}</h3>
                  <span className={clsx(
                    "text-xs px-2 py-0.5 rounded-full border font-medium",
                    ticket.status === 'OPEN' && "bg-red-50 text-red-700 border-red-200",
                    ticket.status === 'IN_PROGRESS' && "bg-yellow-50 text-yellow-700 border-yellow-200",
                    ticket.status === 'RESOLVED' && "bg-green-50 text-green-700 border-green-200",
                    ticket.status === 'CLOSED' && "bg-slate-100 text-slate-600 border-slate-200"
                  )}>
                    {ticket.status}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {ticket.type}
                  </span>
                </div>
                <p className="text-slate-600">{ticket.description}</p>
                <div className="text-sm text-slate-400 flex items-center gap-4 pt-1">
                  <span>Asunto: {ticket.apartmentId || 'Yleiset tilat'}</span>
                  <span>Prioriteetti: {ticket.priority}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
