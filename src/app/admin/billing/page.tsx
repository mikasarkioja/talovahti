'use client'
import { useStore } from '@/lib/store'
import { PRICING_TIERS } from '@/lib/subscriptions'
import { CreditCard, Calendar, BarChart, Users, DollarSign, Activity } from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'
import Link from 'next/link'

export default function BillingPage() {
  const { subscription, orders, systemStats, currentUser } = useStore()
  const [isAdminView, setIsAdminView] = useState(false)

  // Toggle for Provider View (Mock role check)
  const canSeeAdmin = true // For demo purposes

  if (isAdminView) {
      return (
          <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-900 text-white min-h-screen">
              <header className="flex justify-between items-center">
                  <div>
                      <h1 className="text-3xl font-bold flex items-center gap-2">
                          <Activity className="text-emerald-400" />
                          Platform Provider Admin
                      </h1>
                      <p className="text-slate-400 mt-1">System-wide revenue and usage metrics.</p>
                  </div>
                  <button 
                    onClick={() => setIsAdminView(false)}
                    className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Switch to Board View
                  </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">MRR (Recurring)</div>
                      <div className="text-3xl font-bold text-white">{systemStats.mrr.toLocaleString()} €</div>
                      <div className="text-xs text-emerald-400 mt-1">+12% vs last month</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Transactions</div>
                      <div className="text-3xl font-bold text-white">{systemStats.totalTransactionRevenue.toLocaleString()} €</div>
                      <div className="text-xs text-slate-400 mt-1">Document sales</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Companies</div>
                      <div className="text-3xl font-bold text-white">{systemStats.activeCompanies}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Conversion Rate</div>
                      <div className="text-3xl font-bold text-white">{(systemStats.certificatesSold / systemStats.activeCompanies).toFixed(1)}</div>
                      <div className="text-xs text-slate-400 mt-1">Certs / Company</div>
                  </div>
              </div>

              {/* Recent Activity Mock */}
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="p-4 border-b border-white/10 font-bold">Recent Transactions</div>
                  <div className="divide-y divide-white/5">
                      {[1,2,3].map(i => (
                          <div key={i} className="p-4 flex justify-between text-sm">
                              <span className="text-slate-300">As Oy Example {i} - Pro Subscription</span>
                              <span className="text-white font-mono">149.00 €</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )
  }

  // Board View
  const currentPlan = PRICING_TIERS[subscription.plan as keyof typeof PRICING_TIERS]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="text-[#002f6c]" />
            Laskutus & Tilaus
          </h1>
          <p className="text-slate-500 mt-1">Hallinnoi taloyhtiön lisenssiä ja maksutapoja.</p>
        </div>
        {canSeeAdmin && (
            <button 
                onClick={() => setIsAdminView(true)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
                <Activity size={14} /> Provider Login
            </button>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Current Plan Card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                  <div>
                      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Nykyinen Tilaus</div>
                      <div className="text-3xl font-bold">{currentPlan.label}</div>
                  </div>
                  <div className="text-right">
                      <div className="text-2xl font-bold">{currentPlan.price} € <span className="text-sm font-normal text-slate-400">/ kk</span></div>
                      <div className={clsx("text-xs font-bold px-2 py-1 rounded inline-block mt-1", subscription.status === 'ACTIVE' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                          {subscription.status}
                      </div>
                  </div>
              </div>
              
              <div className="p-6 space-y-6">
                  <div className="flex items-center gap-4 text-sm text-slate-600 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 w-1/2">
                          <Calendar size={18} className="text-blue-600" />
                          <span>Seuraava veloitus:</span>
                      </div>
                      <span className="font-bold text-slate-900">
                          {subscription.nextBillingDate ? subscription.nextBillingDate.toLocaleDateString() : '-'}
                      </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 w-1/2">
                          <CreditCard size={18} className="text-blue-600" />
                          <span>Maksutapa:</span>
                      </div>
                      <span className="font-bold text-slate-900">Visa •••• 4242</span>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 flex justify-between items-center">
                      <span>Haluatko päivittää tilauksen?</span>
                      <Link 
                          href="/admin/marketplace"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded transition-colors inline-block text-center"
                      >
                          Siirry Kauppaan
                      </Link>
                  </div>
              </div>
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileTextIcon /> Laskutushistoria
              </h3>
              <div className="space-y-3">
                  {/* Mock History */}
                  {[1, 2, 3].map(i => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - i);
                      return (
                          <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded transition-colors cursor-pointer group">
                              <div className="flex flex-col">
                                  <span className="font-medium text-slate-700">{date.toLocaleDateString()}</span>
                                  <span className="text-xs text-slate-400">Kuukausimaksu</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <span className="font-mono text-slate-600">49.00 €</span>
                                  <DownloadIcon className="text-slate-300 group-hover:text-blue-600" />
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      </div>
    </div>
  )
}

function FileTextIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
}

function DownloadIcon({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
}
