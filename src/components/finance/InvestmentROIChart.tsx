'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { InvestmentScenario, calculateInvestmentPath } from '@/lib/energy-logic'
import { useState, useMemo } from 'react'
import { Zap, Sun, Wind, Leaf } from 'lucide-react'

// Mock Switch if shadcn not installed
const Switch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (c: boolean) => void }) => (
  <button 
    onClick={() => onCheckedChange(!checked)}
    className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-green-600' : 'bg-slate-300'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-5' : 'left-1'}`} />
  </button>
)

export function InvestmentROIChart({ scenario }: { scenario: InvestmentScenario }) {
  const [showBaseline, setShowBaseline] = useState(true)

  const data = useMemo(() => {
    const investmentPath = calculateInvestmentPath(scenario)
    // Baseline: Cumulative Cash Flow is 0 (We spend what we spend, no investment, no savings)
    // To make it interesting as per prompt "Rising costs line", we might need to invert the chart to "Cumulative Cost" 
    // OR just keep it as "Net Benefit".
    // "Net Benefit" of Baseline is 0 relative to itself.
    // If we want to show "Rising costs of District Heating", we need absolute costs.
    // Let's stick to "Cumulative Cash Flow" (Investment View).
    // Baseline = 0.
    
    return investmentPath.map(pt => ({
      year: pt.year,
      invest: pt.cumulativeCashFlow,
      baseline: 0 // Reference line
    }))
  }, [scenario])

  const paybackYear = data.find(d => d.invest >= 0)?.year

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Zap className="text-yellow-500" size={20} />
            Investoinnin kannattavuus
          </h3>
          <p className="text-sm text-slate-500">Kassavirta (Säästöt - Investointi) 25v ajalle.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">{paybackYear} vuotta</div>
          <div className="text-xs text-slate-400 uppercase font-bold">Takaisinmaksuaika</div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k€`} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(val: any) => [`${Number(val).toLocaleString()} €`, 'Kassavirta']}
              labelFormatter={(label) => `Vuosi ${label}`}
            />
            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="invest" 
              stroke="#059669" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6 }} 
              name={scenario.title}
            />
            {showBaseline && (
              <Line 
                type="monotone" 
                dataKey="baseline" 
                stroke="#94a3b8" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
                dot={false} 
                name="Nykyinen (Vertailu)"
              />
            )}
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
           <div className="bg-white p-2 rounded-full text-emerald-600 shadow-sm">
             <Leaf size={18} />
           </div>
           <div>
             <div className="text-xs text-slate-500 font-bold uppercase">Säästöt vuodessa</div>
             <div className="font-bold text-slate-900">{scenario.annualSavings.toLocaleString()} €</div>
           </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
           <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
             <Wind size={18} />
           </div>
           <div>
             <div className="text-xs text-slate-500 font-bold uppercase">Energiaomavaraisuus</div>
             <div className="font-bold text-slate-900">{(scenario.energySavedKwh / 1000).toFixed(0)} MWh</div>
           </div>
        </div>
      </div>
    </div>
  )
}
