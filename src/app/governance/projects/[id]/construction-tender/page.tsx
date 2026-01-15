'use client'
import { useParams, useRouter } from 'next/navigation'
import { useStore, MockBid, MockServicePartner } from '@/lib/store'
import { CheckCircle2, User, Clock, Star, ArrowRight, TrendingUp, Plus, Send } from 'lucide-react'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'

export default function ConstructionTenderPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, selectWinnerBid, currentUser, servicePartners, addTender, addBid } = useStore()
  
  const projectId = typeof params.id === 'string' ? params.id : ''
  const project = projects.find(p => p.id === projectId)
  
  const [activeTenderId, setActiveTenderId] = useState<string | null>(null)

  // Ensure tender exists or find it
  useEffect(() => {
    if (!project) return

    const existingTender = project.tenders.find(t => t.type === 'CONSTRUCTION')
    if (existingTender) {
        setActiveTenderId(existingTender.id)
    } else {
        // Create new tender if not exists
        const newTenderId = `tender-${Date.now()}`
        addTender(project.id, {
            id: newTenderId,
            projectId: project.id,
            type: 'CONSTRUCTION',
            status: 'OPEN',
            bids: [],
            createdAt: new Date()
        })
        setActiveTenderId(newTenderId)
    }
  }, [project, addTender, projectId])

  const tender = project?.tenders.find(t => t.id === activeTenderId)
  
  const isBoard = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER'

  const handleHire = (bid: MockBid) => {
    if (!project || !tender) return
    selectWinnerBid(project.id, tender.id, bid.id)
    router.push(`/governance/projects/${project.id}/execution`)
  }

  const handleInvite = (partner: MockServicePartner) => {
      if (!tender) return

      // Check if already invited (bid exists)
      if (tender.bids.some(b => b.companyName === partner.name)) {
          alert('Tämä kumppani on jo jättänyt tarjouksen (tai kutsuttu).')
          return
      }

      // Simulate a bid arriving from the partner
      const mockBid: MockBid = {
          id: `bid-${Date.now()}`,
          tenderId: tender.id,
          companyName: partner.name,
          price: Math.floor(Math.random() * (60000 - 30000) + 30000), // Random price 30k-60k
          startDate: new Date(2026, 5, 1),
          endDate: new Date(2026, 8, 1),
          creditRating: 'AA',
          residentRating: partner.rating,
          livePhotosEnabled: true,
          notes: 'Alustava tarjous Palvelutorin kautta.',
          isWinner: false
      }

      addBid(tender.id, mockBid)
  }

  if (!project) return <div>Project not found</div>
  if (!tender) return <div>Loading tender...</div>

  // Find Lowest Price
  const lowestPrice = tender.bids.length > 0 ? Math.min(...tender.bids.map(b => b.price)) : 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header>
        <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Vaihe 2: Urakoitsijan Valinta</div>
        <h1 className="text-3xl font-bold text-slate-900">Kilpailuta Urakka</h1>
        <p className="text-slate-500 mt-1">
          Kutsu luotettavia kumppaneita Palvelutorilta ja vertaile tarjouksia.
        </p>
      </header>

      {/* Marketplace / Invite Section */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <User size={20} /> Kutsu Urakoitsijoita Palvelutorilta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {servicePartners.map(partner => {
                  const hasBid = tender.bids.some(b => b.companyName === partner.name)
                  return (
                    <div key={partner.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-bold text-slate-900">{partner.name}</div>
                            {partner.verified && <CheckCircle2 size={16} className="text-green-500" />}
                        </div>
                        <div className="text-xs text-slate-500 mb-3">{partner.category} • ★ {partner.rating}</div>
                        <button
                            onClick={() => handleInvite(partner)}
                            disabled={hasBid}
                            className={clsx(
                                "w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-2",
                                hasBid 
                                    ? "bg-green-50 text-green-700 cursor-default"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                            )}
                        >
                            {hasBid ? (
                                <>Tarjous saatu <CheckCircle2 size={12} /></>
                            ) : (
                                <>Kutsu / Pyydä tarjous <Send size={12} /></>
                            )}
                        </button>
                    </div>
                  )
              })}
          </div>
      </div>

      {/* Bids Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={20} /> Saapuneet Tarjoukset ({tender.bids.length})
        </h2>
        
        {tender.bids.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                Ei vielä tarjouksia. Kutsu urakoitsijoita yläpuolelta.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tender.bids.map((bid) => {
                    const isLowest = bid.price === lowestPrice
                    
                    return (
                    <div key={bid.id} className={clsx(
                        "bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition-colors relative",
                        isLowest ? "border-green-400 ring-1 ring-green-400 shadow-md" : "border-slate-200 hover:border-blue-300"
                    )}>
                        {isLowest && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                PARAS HINTA
                            </div>
                        )}
                        
                        <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-slate-900">{bid.companyName}</h3>
                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                            {bid.creditRating}
                            </span>
                        </div>
                        
                        <div className="text-3xl font-bold text-slate-900 mb-6">
                            {bid.price.toLocaleString()} €
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-slate-600">
                            <Clock size={18} className="text-blue-500" />
                            <span>Kesto: {Math.round((bid.endDate.getTime() - bid.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))} kk</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                            <Star size={18} className="text-yellow-500" />
                            <span>Referenssit: {bid.residentRating}/5.0</span>
                            </div>
                        </div>

                        <p className="mt-6 text-sm text-slate-500 italic bg-slate-50 p-3 rounded border border-slate-100">
                            "{bid.notes}"
                        </p>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button 
                            onClick={() => handleHire(bid)}
                            disabled={!isBoard}
                            className={clsx(
                            "w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all",
                            isBoard 
                                ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow" 
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            {isBoard ? (
                            <>Valitse Urakoitsija <CheckCircle2 size={18} /></>
                            ) : (
                            'Vain Hallitus'
                            )}
                        </button>
                        </div>
                    </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  )
}
