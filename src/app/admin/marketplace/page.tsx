'use client'
import { useStore } from '@/lib/store'
import { Check, Package, Sparkles, CreditCard, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'

export default function MarketplacePage() {
  const { featureAccess, subscription, setSubscriptionPlan, toggleFeature } = useStore()
  
  const handleUpgrade = (plan: 'PRO' | 'PREMIUM') => {
    if (confirm(`Vahvista päivitys tasolle: ${plan}?`)) {
        setSubscriptionPlan(plan)
    }
  }

  const handleToggleFeature = (key: string, enabled: boolean) => {
      // In real app, this would trigger checkout flow if enabling
      if (!enabled) {
          if (confirm('Haluatko varmasti poistaa ominaisuuden käytöstä?')) {
             toggleFeature(key, false)
          }
      } else {
          // Simulate purchase
          if (confirm(`Osta lisäosa hintaan ${featureAccess.find(f => f.key === key)?.price} €/kk?`)) {
             toggleFeature(key, true)
          }
      }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Laajenna Taloyhtiö OS:n mahdollisuuksia</h1>
        <p className="text-lg text-slate-500">
          Valitse tarpeisiinne sopiva palvelutaso tai täydennä kokonaisuutta älykkäillä lisäosilla.
        </p>
      </header>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* BASIC */}
         <div className={clsx("p-8 rounded-2xl border-2 flex flex-col", subscription.plan === 'BASIC' ? "border-slate-900 bg-slate-50" : "border-slate-100 bg-white")}>
            <div className="mb-4">
                <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded">PERUS</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic</h3>
            <div className="text-4xl font-bold text-slate-900 mb-6">0 € <span className="text-base font-normal text-slate-500">/ kk</span></div>
            <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Digitaalinen kaksonen</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Hallituksen työkalu</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Perusviestintä</li>
            </ul>
            <button disabled className="w-full py-3 rounded-lg font-bold bg-slate-200 text-slate-500 cursor-not-allowed">
                Nykyinen Taso
            </button>
         </div>

         {/* PRO */}
         <div className={clsx("p-8 rounded-2xl border-2 flex flex-col relative", subscription.plan === 'PRO' ? "border-blue-600 bg-blue-50" : "border-slate-100 bg-white")}>
            {subscription.plan === 'PRO' && <div className="absolute top-4 right-4 text-blue-600"><ShieldCheck size={24} /></div>}
            <div className="mb-4">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">SUOSITELTU</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
            <div className="text-4xl font-bold text-slate-900 mb-6">49 € <span className="text-base font-normal text-slate-500">/ kk</span></div>
            <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Kaikki Basic-ominaisuudet</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Isännöintityökalut</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> MML Integraatio</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Rajoittamaton tallennustila</li>
            </ul>
            <button 
                onClick={() => handleUpgrade('PRO')}
                disabled={subscription.plan === 'PRO'}
                className={clsx("w-full py-3 rounded-lg font-bold transition-colors", 
                    subscription.plan === 'PRO' ? "bg-blue-200 text-blue-700 cursor-default" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                )}
            >
                {subscription.plan === 'PRO' ? 'Käytössä' : 'Päivitä Pro-tasoon'}
            </button>
         </div>

         {/* PREMIUM */}
         <div className={clsx("p-8 rounded-2xl border-2 flex flex-col", subscription.plan === 'PREMIUM' ? "border-purple-600 bg-purple-50" : "border-slate-100 bg-white")}>
            <div className="mb-4">
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">ENTERPRISE</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
            <div className="text-4xl font-bold text-slate-900 mb-6">149 € <span className="text-base font-normal text-slate-500">/ kk</span></div>
            <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Kaikki Pro-ominaisuudet</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Projektinjohto (Isännöitsijätön)</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Energia-AI optimointi</li>
                <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500" /> Oma asiakasvastaava</li>
            </ul>
            <button 
                onClick={() => handleUpgrade('PREMIUM')}
                disabled={subscription.plan === 'PREMIUM'}
                className={clsx("w-full py-3 rounded-lg font-bold transition-colors", 
                    subscription.plan === 'PREMIUM' ? "bg-purple-200 text-purple-700 cursor-default" : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                )}
            >
                {subscription.plan === 'PREMIUM' ? 'Käytössä' : 'Päivitä Premium'}
            </button>
         </div>
      </div>

      {/* Add-ons Marketplace */}
      <div className="pt-12 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Package className="text-slate-400" /> Saatavilla olevat lisäosat
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureAccess.map(feature => (
                <div key={feature.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Sparkles size={20} />
                        </div>
                        {feature.isEnabled ? (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                                <Check size={12} /> AKTIIVINEN
                            </span>
                        ) : (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                SAATAVILLA
                            </span>
                        )}
                    </div>
                    
                    <h3 className="font-bold text-slate-900 mb-2">{feature.name}</h3>
                    <p className="text-sm text-slate-500 mb-4 h-10">{feature.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                        <div className="font-bold text-slate-900">{feature.price} € <span className="font-normal text-slate-400 text-sm">/ kk</span></div>
                        
                        <button 
                            onClick={() => handleToggleFeature(feature.key, !feature.isEnabled)}
                            className={clsx("text-sm font-bold px-4 py-2 rounded-lg transition-colors border",
                                feature.isEnabled 
                                    ? "border-red-200 text-red-600 hover:bg-red-50"
                                    : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                            )}
                        >
                            {feature.isEnabled ? 'Poista' : 'Osta'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}
