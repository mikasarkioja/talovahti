'use client'
import { MockRenovation } from "@/lib/store";
import { Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { estimateFutureCost } from "@/lib/maintenance-logic";

export function PTSPlan({ planned }: { planned: MockRenovation[] }) {
  const currentYear = new Date().getFullYear()
  // Sort by planned year asc
  const sortedPlan = [...planned].sort((a, b) => (a.plannedYear || 0) - (b.plannedYear || 0))

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <Calendar className="text-blue-600" size={20} />
        Kunnossapitosuunnitelma (PTS 5v)
      </h3>

      <div className="space-y-4">
        {sortedPlan.map(item => {
          const yearsUntil = (item.plannedYear || currentYear) - currentYear
          const estimatedCost = estimateFutureCost(item.cost, yearsUntil)
          
          return (
            <div key={item.id} className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
              <div className="bg-blue-50/50 p-4 border-b border-blue-50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded text-sm">
                     {item.plannedYear}
                   </div>
                   <h4 className="font-bold text-slate-900">{item.component}</h4>
                 </div>
                 <div className="text-sm font-medium text-slate-500">
                   Arvio: ~{(Math.round(estimatedCost / 1000) * 1000).toLocaleString()} €
                 </div>
              </div>
              <div className="p-4">
                 <p className="text-sm text-slate-600 mb-3">{item.description}</p>
                 
                 <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
                   <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                   <span>
                     <strong>Hallituksen huomio:</strong> Hankesuunnittelu aloitettava viimeistään { (item.plannedYear || 0) - 1 }.
                   </span>
                 </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
