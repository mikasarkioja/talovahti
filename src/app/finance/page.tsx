'use client'
import { Wallet, PiggyBank, FileText, TrendingUp, AlertTriangle, Zap, Sun } from 'lucide-react'
import { useStore } from '@/lib/store'
import { BudgetMirror } from '@/components/finance/BudgetMirror'
import { BudgetLine } from '@/lib/finance'
import { InvestmentROIChart } from '@/components/finance/InvestmentROIChart'
import { InvestmentScenario } from '@/lib/energy-logic'
import { useState } from 'react'
import { clsx } from 'clsx'

export default function FinancePage() {
  const { finance, currentUser } = useStore()

  // Mock Budget Lines
  const budgetLines: BudgetLine[] = [
    { id: '1', category: 'HEATING', budgetedAmount: 45000, actualSpent: 47250, year: 2026 },
    { id: '2', category: 'WATER', budgetedAmount: 12000, actualSpent: 5800, year: 2026 },
    { id: '3', category: 'MAINTENANCE', budgetedAmount: 15000, actualSpent: 12100, year: 2026 },
    { id: '4', category: 'CLEANING', budgetedAmount: 8000, actualSpent: 3800, year: 2026 },
    { id: '5', category: 'ADMIN', budgetedAmount: 18000, actualSpent: 9000, year: 2026 },
  ]

  // Mock Scenarios
  const scenarios: InvestmentScenario[] = [
    {
      id: 'scen-1',
      title: 'Maalämpö (GSHP)',
      type: 'GSHP',
      initialCost: 150000,
      annualSavings: 18000,
      lifespan: 25,
      energySavedKwh: 120000
    },
    {
      id: 'scen-2',
      title: 'Aurinkopaneelit',
      type: 'SOLAR',
      initialCost: 25000,
      annualSavings: 3500,
      lifespan: 25,
      energySavedKwh: 25000
    }
  ]

  const [activeScenario, setActiveScenario] = useState<InvestmentScenario>(scenarios[0])
  const isBoard = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER'

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-[#002f6c]" />
            Talous & Budjetti
          </h1>
          <p className="text-slate-500 mt-1">Seuraa vastikkeita, lainoja ja budjetin toteumaa reaaliajassa.</p>
        </div>
        {isBoard && (
          <button className="bg-[#002f6c] hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            Muokkaa budjettia
          </button>
        )}
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Operational Finance */}
        <div className="space-y-8">
           <BudgetMirror items={budgetLines} />
           
           <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Kassavarat</div>
                <div className="text-2xl font-bold text-slate-900">{finance.reserveFund.toLocaleString()} €</div>
             </div>
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 uppercase font-bold mb-1">Lainat Yhteensä</div>
                <div className="text-2xl font-bold text-slate-900">{finance.companyLoansTotal.toLocaleString()} €</div>
             </div>
           </div>
        </div>

        {/* Right Column: Strategic Investment */}
        <div className="space-y-6">
           <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             {/* Scenario Tabs */}
             <div className="flex border-b border-slate-100 bg-slate-50">
               {scenarios.map(scen => (
                 <button
                   key={scen.id}
                   onClick={() => setActiveScenario(scen)}
                   className={clsx(
                     "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                     activeScenario.id === scen.id 
                       ? "bg-white text-blue-600 border-t-2 border-blue-600" 
                       : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                   )}
                 >
                   {scen.type === 'GSHP' ? <Zap size={16} /> : <Sun size={16} />}
                   {scen.title}
                 </button>
               ))}
             </div>
             <InvestmentROIChart scenario={activeScenario} />
           </div>

           {/* Vastike Impact - "What does this mean for me?" */}
           <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <h3 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <TrendingUp size={18} />
                Vaikutus vastikkeeseen
              </h3>
              <p className="text-sm text-emerald-800 mb-4">
                Investoinnin maksamisen jälkeen (v. {2026 + 9}) hoitovastike putoaa arviolta:
              </p>
              <div className="text-3xl font-bold text-emerald-700">
                -0,85 € / m² / kk
              </div>
              <p className="text-xs text-emerald-600 mt-1 opacity-80">
                (Keskimääräinen säästö 60m² asunnolle: ~50€/kk)
              </p>
           </div>
        </div>

      </div>
    </div>
  )
}
