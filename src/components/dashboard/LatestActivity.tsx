'use client'
import { useStore } from '@/lib/store'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import { Bell, FileText } from 'lucide-react'

export function LatestActivity() {
  const { feed } = useStore()
  
  // Sort by date desc
  const sortedFeed = [...feed].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <Bell className="text-[#002f6c]" size={20} />
        Ajankohtaista
      </h3>
      <div className="space-y-4">
        {sortedFeed.map(item => (
            <div key={item.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`mt-1 min-w-[32px] h-8 rounded-full flex items-center justify-center ${item.type === 'DECISION' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {item.type === 'DECISION' ? <FileText size={14} /> : <Bell size={14} />}
                </div>
                <div>
                    <div className="text-xs text-slate-500 mb-0.5">
                        {format(new Date(item.date), 'd.M.yyyy', { locale: fi })} • {item.type === 'DECISION' ? 'Päätös' : 'Tiedote'}
                    </div>
                    <div className="text-sm font-medium text-slate-900 mb-1">{item.title}</div>
                    <div className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {item.content}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}
