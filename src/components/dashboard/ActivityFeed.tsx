'use client'
import { useStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { fi } from 'date-fns/locale'
import { Wrench, Lightbulb, Vote, MessageSquare, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

// Activity Type Definition
type ActivityItem = {
  id: string
  type: 'MAINTENANCE_TICKET' | 'NEW_INITIATIVE' | 'VOTE_CAST'
  title: string
  description: string
  date: Date
  details?: string
  priority?: string
  initiativeId?: string
}

interface ActivityFeedProps {
  limit?: number
  compact?: boolean
}

export function ActivityFeed({ limit, compact }: ActivityFeedProps) {
  const { tickets, initiatives, currentUser } = useStore()
  const isBoard = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER'

  // Normalize Data
  const activities: ActivityItem[] = [
    ...tickets.map(t => ({
      id: t.id,
      type: 'MAINTENANCE_TICKET' as const,
      title: isBoard ? `Uusi vikailmoitus: ${t.title}` : 'Uusi vikailmoitus tehty',
      description: isBoard ? `Asunto ${t.apartmentId || 'Yleiset'}: ${t.description}` : 'Huoltoyhtiö on vastaanottanut ilmoituksen.',
      date: t.createdAt || new Date(),
      details: t.apartmentId || undefined,
      priority: t.priority
    })),
    ...initiatives.map(i => ({
      id: i.id,
      type: 'NEW_INITIATIVE' as const,
      title: `Uusi aloite: ${i.title}`,
      description: i.description,
      date: i.createdAt || new Date(),
      initiativeId: i.id
    })),
    // Mocking recent votes based on initiative votes array
    ...initiatives.flatMap(i => i.votes.map(v => ({
      id: `${i.id}-${v.userId}`,
      type: 'VOTE_CAST' as const,
      title: `Äänestys aktiivinen: ${i.title}`,
      description: 'Uusia ääniä annettu.',
      date: new Date(), // Mock date, normally from vote timestamp
      initiativeId: i.id
    })))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit || 10)

  const handleJoinDiscussion = (id: string) => {
    // In a real app, this would route to the discussion view or open a modal
    console.log("Join discussion:", id)
    alert("Keskustelu avautuu (Demo)")
  }

  return (
    <div className={clsx("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full", compact && "border-0 shadow-none rounded-none bg-transparent")}>
      {!compact && (
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900">Tapahtumavirta</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Reaaliaikainen</span>
        </div>
      )}
      
      <div className={clsx("divide-y divide-slate-100 overflow-y-auto", !compact && "max-h-[600px]")}>
        {activities.map((item) => {
          const isTicket = item.type === 'MAINTENANCE_TICKET'
          const isInitiative = item.type === 'NEW_INITIATIVE'
          const isVote = item.type === 'VOTE_CAST'

          return (
            <div key={item.id} className={clsx(
              "p-4 hover:bg-slate-50 transition-colors flex gap-4",
              compact && "p-3 bg-transparent",
              !compact && isInitiative && "bg-blue-50/30 hover:bg-blue-50/50",
              !compact && isTicket && "bg-amber-50/30 hover:bg-amber-50/50"
            )}>
              {/* Icon Column */}
              <div className="flex-shrink-0 mt-1">
                {isTicket && (
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Wrench size={16} />
                  </div>
                )}
                {isInitiative && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Lightbulb size={16} />
                  </div>
                )}
                {isVote && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Vote size={16} />
                  </div>
                )}
              </div>

              {/* Content Column */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-slate-500">
                    {formatDistanceToNow(item.date, { addSuffix: true, locale: fi })}
                  </span>
                  {item.priority === 'HIGH' && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase tracking-wide">
                      <AlertCircle size={10} /> Kiireellinen
                    </span>
                  )}
                </div>
                
                <h4 className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{item.title}</h4>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Actions */}
                {!compact && isInitiative && (
                   <div className="mt-3 flex gap-2">
                     <button 
                       onClick={() => item.initiativeId && handleJoinDiscussion(item.initiativeId)}
                       className="text-xs font-medium bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center gap-1.5 shadow-sm"
                     >
                       <MessageSquare size={14} /> Osallistu keskusteluun
                     </button>
                   </div>
                )}
              </div>
            </div>
          )
        })}
        
        {activities.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
                Ei viimeaikaista toimintaa.
            </div>
        )}
      </div>
    </div>
  )
}
