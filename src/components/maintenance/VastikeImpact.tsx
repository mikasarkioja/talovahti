'use client'
import { useState } from 'react'
import { calculateVastikeImpact } from '@/lib/pts-logic'
import { Coins, Banknote } from 'lucide-react'

// Mock Switch inline if needed
const Switch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (c: boolean) => void }) => (
  <button 
    onClick={() => onCheckedChange(!checked)}
    className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
  >
    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-5' : 'left-1'}`} />
  </button>
)

export function VastikeImpact({ cost, shares = 1000, userShares = 80 }: { cost: number, shares?: number, userShares?: number }) {
  const [isLoan, setIsLoan] = useState(true)
  
  // Calculate impact per share
  const impactPerShare = calculateVastikeImpact(cost, shares, isLoan)
  
  // Calculate user's personal impact
  const userImpact = impactPerShare * userShares

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-2">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
          {isLoan ? <Banknote size={14} /> : <Coins size={14} />}
          Rahoitusvaikutus
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span className={!isLoan ? 'font-bold' : 'text-slate-500'}>Käteinen</span>
          <Switch checked={isLoan} onCheckedChange={setIsLoan} />
          <span className={isLoan ? 'font-bold' : 'text-slate-500'}>Laina (20v)</span>
        </div>
      </div>

      <div className="flex justify-between items-baseline">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            +{userImpact.toFixed(2)} € <span className="text-sm font-normal text-slate-500">/ kk</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Arvioitu nousu sinun vastikkeeseesi ({userShares} osaketta).
          </p>
        </div>
        <div className="text-right">
           <div className="text-xs text-slate-400">Yhtiövastike</div>
           <div className="font-mono text-sm text-slate-600">+{impactPerShare.toFixed(2)} € / osake</div>
        </div>
      </div>
    </div>
  )
}
