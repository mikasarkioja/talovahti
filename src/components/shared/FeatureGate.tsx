'use client'
import { useStore } from '@/lib/store'
import { Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'

type FeatureGateProps = {
  featureKey: string
  children: React.ReactNode
  fallbackTitle?: string
  fallbackDescription?: string
}

export function FeatureGate({ featureKey, children, fallbackTitle, fallbackDescription }: FeatureGateProps) {
  const { featureAccess } = useStore()
  
  const feature = featureAccess.find(f => f.key === featureKey)
  const isEnabled = feature?.isEnabled

  if (isEnabled) {
    return <>{children}</>
  }

  // Locked UI
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
      {/* Blurry Background Content Placeholder */}
      <div className="absolute inset-0 opacity-10 pointer-events-none blur-sm" aria-hidden="true">
        {children}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="bg-white p-3 rounded-full shadow-sm mb-4">
           <Lock className="text-slate-400" size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {fallbackTitle || feature?.name || 'Ominaisuus lukittu'}
        </h3>
        <p className="text-slate-600 mb-6">
          {fallbackDescription || feature?.description || 'Tämä ominaisuus vaatii lisenssin päivityksen.'}
        </p>
        
        <Link 
          href="/admin/marketplace"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Sparkles size={16} /> Avaa käyttöösi nyt
        </Link>
        <div className="mt-3 text-xs text-slate-400">
           Hinta: {feature?.price.toFixed(2)} € / kk
        </div>
      </div>
    </div>
  )
}
