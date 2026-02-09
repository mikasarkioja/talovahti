'use client'
import { TrendingUp, AlertTriangle, PiggyBank, Droplets } from 'lucide-react'
import { useStore } from '@/lib/store'
import { clsx } from 'clsx'

export function BudgetSummary() {
  const { finance } = useStore()
  
  const incomePercent = (finance.monthlyIncome / finance.monthlyTarget) * 100
  
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <TrendingUp className="text-[#002f6c]" size={20} />
        Taloudellinen tila
      </h3>

      <div className="space-y-4">
        {/* Hoitovastike Flow */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Hoitovastikekertymä (kk)</span>
            <span className="font-medium text-slate-900">{(finance.monthlyIncome || 0).toLocaleString()} € / {(finance.monthlyTarget || 0).toLocaleString()} €</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.min(incomePercent || 0, 100)}%` }} 
            />
          </div>
        </div>

        {/* Reserve Fund */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="bg-blue-100 p-2 rounded-full text-blue-600">
            <PiggyBank size={18} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase">Kunnossapitovastike</div>
            <div className="text-lg font-bold text-slate-900">{(finance.reserveFund || 0).toLocaleString()} €</div>
          </div>
        </div>

        {/* Energy Discrepancy */}
        {finance.energyCostDiff > 0 && (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
             <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                <AlertTriangle size={18} />
             </div>
             <div>
               <div className="text-xs text-yellow-700 font-medium uppercase">Budjettipoikkeama</div>
               <div className="text-sm text-yellow-800">
                 Energiakulut +{finance.energyCostDiff} € yli arvion.
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
