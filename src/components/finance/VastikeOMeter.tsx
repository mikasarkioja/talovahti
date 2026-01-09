'use client'
import { VastikeHealth } from '@/lib/finance-analytics'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { clsx } from 'clsx'

export function VastikeOMeter({ health }: { health: VastikeHealth }) {
  // Gauge Position (-100 to 100 range normalization for simple CSS rotation)
  // Low = -50 deg, Optimal = 0 deg, High = +50 deg
  let rotation = 0
  if (health.status === 'LOW') rotation = -45
  if (health.status === 'HIGH') rotation = 45

  return (
    <div className="flex flex-col items-center relative">
      <div className="relative w-48 h-24 overflow-hidden mb-4">
        {/* Gauge Background */}
        <div className="absolute w-40 h-40 rounded-full border-[12px] border-slate-100 top-4 left-4 box-border border-b-0 border-l-0 border-r-0 rotate-[225deg]" />
        
        {/* Zones (Simplified visual representation) */}
        <div className="absolute top-4 left-4 w-40 h-40 rounded-full border-[12px] border-transparent border-t-red-400 rotate-[-45deg] opacity-20" />
        <div className="absolute top-4 left-4 w-40 h-40 rounded-full border-[12px] border-transparent border-t-green-500 rotate-[0deg] opacity-20" />
        <div className="absolute top-4 left-4 w-40 h-40 rounded-full border-[12px] border-transparent border-t-amber-400 rotate-[45deg] opacity-20" />

        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-800 origin-bottom transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
           <div className="w-3 h-3 bg-slate-900 rounded-full absolute -bottom-1.5 -left-1 ring-2 ring-white"></div>
        </div>
      </div>

      <h3 className={clsx(
        "text-xl font-bold mb-1 flex items-center gap-2",
        health.status === 'LOW' ? "text-red-600" :
        health.status === 'OPTIMAL' ? "text-green-600" : "text-amber-600"
      )}>
        {health.status === 'LOW' && <TrendingUp />}
        {health.status === 'OPTIMAL' && <CheckCircleIcon />}
        {health.status === 'HIGH' && <TrendingDown />}
        {health.status === 'LOW' ? 'Liian Matala' : health.status === 'OPTIMAL' ? 'Optimaalinen' : 'Liian Korkea'}
      </h3>
      
      <p className="text-sm text-slate-500 text-center max-w-xs mb-4">
        {health.recommendation}
      </p>

      {health.requiredChange !== 0 && (
        <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium">
           Suositus: <span className="font-bold text-slate-900">{health.requiredChange > 0 ? '+' : ''}{health.requiredChange.toFixed(2)} €/m²</span>
        </div>
      )}
    </div>
  )
}

function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    )
}
