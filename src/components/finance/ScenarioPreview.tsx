'use client'
import { ScenarioSummary } from '@/lib/scenario-logic'
import { clsx } from 'clsx'
import { TrendingUp, AlertTriangle, CheckCircle, Leaf } from 'lucide-react'

export function ScenarioPreview({ scenarios }: { scenarios: ScenarioSummary[] }) {
  return (
    <div className="space-y-4">
      {scenarios.map(scen => {
        const isRec = scen.type === 'PROGRESSIVE'
        const isRisk = scen.type === 'REACTIVE'
        
        return (
          <div 
            key={scen.type} 
            className={clsx(
              "p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer",
              isRec ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-200",
              isRisk && "hover:border-red-300"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={clsx("font-bold", isRec ? "text-emerald-900" : "text-slate-900")}>
                    {scen.label}
                  </h4>
                  {scen.badges.map(b => (
                    <span key={b} className={clsx(
                      "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                      b === 'Suositeltu' ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-500"
                    )}>
                      {b}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-600 mt-1">{scen.description}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{scen.monthlyVastike2026.toFixed(2)} €/m²</div>
                <div className="text-xs text-slate-400">Vastike 2026</div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100/50">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold">20v Kustannus</span>
                <span className="font-mono text-sm font-medium">{scen.totalCost20y.toLocaleString()} €/m²</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Vastike 2046</span>
                <span className={clsx("font-mono text-sm font-medium", isRec && "text-emerald-600")}>
                  {scen.monthlyVastike2046.toFixed(2)} €/m²
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">Kestävyys</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div 
                      key={i} 
                      className={clsx(
                        "w-2 h-2 rounded-full",
                        i * 20 <= scen.sustainabilityScore ? "bg-green-500" : "bg-slate-200"
                      )} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
