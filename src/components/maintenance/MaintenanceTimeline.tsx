'use client'
import { MockRenovation } from "@/lib/store";
import { calculateRemainingLife } from "@/lib/maintenance-logic";
import { clsx } from 'clsx'
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function MaintenanceTimeline({ history }: { history: MockRenovation[] }) {
  // Sort descending by year done
  const sortedHistory = [...history].sort((a, b) => (b.yearDone || 0) - (a.yearDone || 0))

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <CheckCircle className="text-emerald-600" size={20} />
        Suoritetut korjaukset (Historia)
      </h3>
      
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8 py-2">
        {sortedHistory.map(item => {
          const { remainingYears, percentage, status } = calculateRemainingLife(item)
          
          return (
            <div key={item.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-300"></div>
              
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{item.component}</h4>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-700">{item.yearDone}</div>
                    <div className="text-xs text-slate-400">{item.cost.toLocaleString()} €</div>
                  </div>
                </div>

                {/* Health Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>Tekninen käyttöikä</span>
                    <span className={clsx(
                      status === 'CRITICAL' && "text-red-600 font-bold",
                      status === 'WARNING' && "text-yellow-600 font-bold"
                    )}>
                      {remainingYears}v jäljellä
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={clsx(
                        "h-full rounded-full transition-all duration-1000",
                        status === 'EXCELLENT' && "bg-emerald-500",
                        status === 'GOOD' && "bg-blue-500",
                        status === 'WARNING' && "bg-yellow-500",
                        status === 'CRITICAL' && "bg-red-500 animate-pulse"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
