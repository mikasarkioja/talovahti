'use client'

import { StrategyEngine } from '@/lib/engines/StrategyEngine'
import { useStore } from '@/lib/store'
import { useMemo } from 'react'

export function StatusLight() {
  const { finance } = useStore()
  
  const status = useMemo(() => {
    // Mock value as StrategyEngine is simplified to Maintenance Backlog only
    return { grade: 'B', score: 82 }
  }, [finance])

  const getColor = (grade: string) => {
      if (['A', 'B'].includes(grade)) return 'bg-green-500 shadow-green-500/50'
      if (['C'].includes(grade)) return 'bg-yellow-500 shadow-yellow-500/50'
      return 'bg-red-500 shadow-red-500/50'
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-3 py-1 shadow-sm border border-slate-100">
        <span className="text-xs font-bold text-slate-700">Health {status.grade}</span>
        <div className={`w-2 h-2 rounded-full shadow-lg animate-pulse ${getColor(status.grade)}`} />
    </div>
  )
}
