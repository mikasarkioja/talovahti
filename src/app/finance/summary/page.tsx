'use client'
import { useStore } from '@/lib/store'
import { analyzeBudgetAccuracy, calculateVastikeHealth, generateBoardRecommendation } from '@/lib/finance-analytics'
import { VarianceChart } from '@/components/finance/VarianceChart'
import { VastikeOMeter } from '@/components/finance/VastikeOMeter'
import { PieChart, TrendingUp, AlertTriangle, FileText } from 'lucide-react'
import { clsx } from 'clsx'

export default function FinanceSummaryPage() {
  const { budgetLines, finance } = useStore()

  // Analytics
  const variances = analyzeBudgetAccuracy(budgetLines)
  const health = calculateVastikeHealth(finance, budgetLines)
  const recommendation = generateBoardRecommendation(variances, health)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <PieChart className="text-[#002f6c]" />
          Talousanalyysi & Ennuste
        </h1>
        <p className="text-slate-500 mt-1">Reaaliaikainen budjetin seuranta ja vastikeoptimointi.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Vastike Health */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
           <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 w-full text-left">Vastike-O-Meter™</h2>
           <VastikeOMeter health={health} />
           
           <div className="mt-8 w-full p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
             <div className="flex items-start gap-2">
               <TrendingUp size={16} className="mt-0.5 shrink-0" />
               <p>{recommendation}</p>
             </div>
           </div>
        </div>

        {/* Center: Budget Variance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Budjetin Poikkeamat</h2>
           <VarianceChart data={variances} />
        </div>

      </div>

      {/* Impact Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-slate-900">Kustannusvaikutukset</h3>
           <div className="flex gap-2">
              <button className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded">
                 <FileText size={14} /> Lataa Raportti
              </button>
           </div>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Kategoria</th>
              <th className="px-6 py-3 text-right">Toteutunut</th>
              <th className="px-6 py-3 text-right">Budjetti</th>
              <th className="px-6 py-3 text-right">Poikkeama %</th>
              <th className="px-6 py-3 text-right">Vaikutus (€)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variances.map(row => (
              <tr key={row.category} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{row.label}</td>
                <td className="px-6 py-4 text-right">{row.actual.toLocaleString()} €</td>
                <td className="px-6 py-4 text-right text-slate-500">{row.budgeted.toLocaleString()} €</td>
                <td className="px-6 py-4 text-right">
                  <span className={clsx(
                    "px-2 py-1 rounded text-xs font-bold",
                    Math.abs(row.relativeVariance) < 5 ? "bg-slate-100 text-slate-600" :
                    row.relativeVariance > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  )}>
                    {row.relativeVariance > 0 ? '+' : ''}{row.relativeVariance.toFixed(1)}%
                  </span>
                </td>
                <td className={clsx(
                  "px-6 py-4 text-right font-bold",
                  row.absoluteVariance > 0 ? "text-red-600" : row.absoluteVariance < 0 ? "text-green-600" : "text-slate-400"
                )}>
                  {row.absoluteVariance > 0 ? '+' : ''}{row.absoluteVariance.toLocaleString()} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
