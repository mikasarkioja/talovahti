'use client'
import { PieChart, TrendingUp, PiggyBank, CreditCard, Leaf } from 'lucide-react'
import { useStore } from '@/lib/store'
import { clsx } from 'clsx'

export function EconomicOverview() {
  const { finance, currentUser } = useStore()
  
  const isBoard = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER'

  // Calculations for doughnut chart visual (CSS conic-gradient)
  // Green segment: collected/paid
  const percentage = isBoard 
    ? finance.collectionPercentage 
    : 100 // Resident view usually doesn't show a generic doughnut unless we map it to something else, sticking to prompt requirements
  
  // Doughnut style
  const doughnutStyle = {
    background: `conic-gradient(#22c55e ${percentage}%, #e2e8f0 0)`
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-6">
        <PieChart className="text-[#002f6c]" size={20} />
        Talousnäkymä
      </h3>

      <div className="flex flex-col gap-6">
        
        {/* Main Metric Visual */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-inner" style={doughnutStyle}>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="font-bold text-slate-800 text-sm">
                {isBoard ? `${percentage}%` : 'Tila'}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">
              {isBoard ? 'Vastikekertymä' : 'Yhtiölainaosuus'}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {isBoard 
                ? `${finance.collectionPercentage}%` 
                : `${currentUser?.personalDebtShare?.toLocaleString()} €`
              }
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isBoard 
                ? 'Tämän kuun vastikkeista kerätty.' 
                : 'Jäljellä oleva osuutesi yhtiön veloista.'}
            </p>
          </div>
        </div>

        {/* Smart Insight */}
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex gap-3">
          <div className="bg-emerald-100 p-2 rounded-full h-fit text-emerald-600">
            <Leaf size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase mb-1">Älykäs Säästö</div>
            <p className="text-sm text-emerald-800 leading-snug">
              Tekoälyohjattu lämmitys on vähentänyt kuluja <strong>{finance.energySavingsPct}%</strong> tällä kvartaalilla.
            </p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2 text-slate-500 mb-1">
               <TrendingUp size={14} />
               <span className="text-xs font-medium">Hoitovastike</span>
             </div>
             <div className="font-semibold text-slate-900">
               {(finance.monthlyIncome || 0).toLocaleString()} €/kk
             </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2 text-slate-500 mb-1">
               <PiggyBank size={14} />
               <span className="text-xs font-medium">Kassavarat</span>
             </div>
             <div className="font-semibold text-slate-900">
               {(finance.reserveFund || 0).toLocaleString()} €
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
