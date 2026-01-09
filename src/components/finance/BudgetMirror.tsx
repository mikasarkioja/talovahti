'use client'
import { BudgetCategory } from '@prisma/client'
import { calculateBurnRate, getCategoryLabel, BudgetLine } from '@/lib/finance'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { clsx } from 'clsx'

// Mock Tooltip component since we haven't fully set up shadcn/ui yet
// Creating a simple hover capable wrapper
const SimpleTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => (
  <div className="group relative flex items-center">
    {children}
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10 shadow-lg text-center">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
)

export function BudgetMirror({ items }: { items: BudgetLine[] }) {
  
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-900">Talousarvion toteuma (Real-time)</h3>
        <span className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          Päivitetty tänään
        </span>
      </div>

      <div className="space-y-6">
        {items.map(item => {
          const burnRate = calculateBurnRate(item)
          const isOverBudget = burnRate > 100
          const isWarning = burnRate > 90 && burnRate <= 100
          
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{getCategoryLabel(item.category)}</span>
                  {isOverBudget && (
                    <SimpleTooltip content="Kulut ovat ylittäneet budjetin. Tarkista huoltokirjaukset.">
                      <AlertCircle size={14} className="text-red-500 cursor-help" />
                    </SimpleTooltip>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-600">
                  <span className={clsx(
                    "font-bold",
                    isOverBudget ? "text-red-600" : isWarning ? "text-yellow-600" : "text-slate-900"
                  )}>
                    {item.actualSpent.toLocaleString()} €
                  </span>
                  <span className="text-slate-400"> / {item.budgetedAmount.toLocaleString()} €</span>
                </div>
              </div>

              {/* Progress Bar Container (The Budget) */}
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
                {/* Reference Line for 100% */}
                <div className="absolute right-0 top-0 bottom-0 w-px bg-slate-300 z-10" title="Budjettiraja"></div>
                
                {/* Fill (Actuals) */}
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    isOverBudget ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(burnRate, 100)}%` }}
                />
              </div>

              {/* Context / Insight Text */}
              {isOverBudget && (
                <div className="text-xs text-red-600 flex gap-1 items-start bg-red-50 p-2 rounded">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Huomio: Ylitys johtuu tammikuun pakkasjakson korkeasta lämmitystarpeesta.
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <p>
            Talous on kokonaisuutena tasapainossa. Lämmityskulut ovat vain <span className="font-semibold text-slate-900">5%</span> yli kausivaihtelun.
          </p>
        </div>
      </div>
    </div>
  )
}
