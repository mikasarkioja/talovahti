'use client'
import { MockSolutionOption } from '@/lib/store'
import { BarChart, TrendingUp } from 'lucide-react'

export function OptionComparison({ options }: { options: MockSolutionOption[] }) {
  if (!options || options.length === 0) return null

  // Find max values for visualization scaling
  const maxCost = Math.max(...options.map(o => o.estimatedCost))
  const maxLife = Math.max(...options.map(o => o.lifeSpanExtension))

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-4">
      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
        <BarChart size={16} className="text-purple-600" />
        Vertailu: Kustannus vs. Hyöty
      </h3>
      
      <div className="space-y-6">
        {options.map(opt => {
          const costPerYear = opt.lifeSpanExtension > 0 ? opt.estimatedCost / opt.lifeSpanExtension : 0
          
          return (
            <div key={opt.id} className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-800">{opt.title}</span>
                <span className="text-slate-500">{Math.round(costPerYear).toLocaleString()} € / vuosi</span>
              </div>
              
              {/* Bars */}
              <div className="grid grid-cols-2 gap-4">
                {/* Cost Bar */}
                <div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div 
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${(opt.estimatedCost / maxCost) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">Hinta: {opt.estimatedCost.toLocaleString()} €</div>
                </div>
                
                {/* Life Span Bar */}
                <div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(opt.lifeSpanExtension / maxLife) * 100}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">Elinkaari: +{opt.lifeSpanExtension} v</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
