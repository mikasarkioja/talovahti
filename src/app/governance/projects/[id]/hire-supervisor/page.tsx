'use client'
import { useParams, useRouter } from 'next/navigation'
import { useStore, MockBid } from '@/lib/store'
import { CheckCircle2, User, Clock, Star, ArrowRight, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'

export default function HireSupervisorPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, selectWinnerBid, currentUser } = useStore()
  
  const project = projects.find(p => p.id === params.id)
  const tender = project?.tenders.find(t => t.type === 'SUPERVISOR')
  
  const isBoard = currentUser?.role === "BOARD_MEMBER" || currentUser?.role === "ADMIN"

  const handleHire = (bid: MockBid) => {
    if (!project || !tender) return
    if (!confirm(`Haluatko varmasti valita kumppaniksi: ${bid.companyName}?`)) return
    
    selectWinnerBid(project.id, tender.id, bid.id)
    router.push('/governance/projects')
  }

  if (!project || !tender) return <div>Project not found</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Vaihe 1: Tekninen Johtaja</div>
        <h1 className="text-3xl font-bold text-slate-900">Valitse Valvoja hankkeelle</h1>
        <p className="text-slate-500 mt-1">
          Valvoja toimii taloyhtiön edunvalvojana ja projektipäällikkönä koko hankkeen ajan.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tender.bids.map(bid => (
          <div key={bid.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-colors">
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
                  <User size={18} className="text-blue-500" />
                  <span>Läsnäolo: {bid.siteVisitsPerWeek} krt / vko</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Star size={18} className="text-yellow-500" />
                  <span>Asukastyytyväisyys: {bid.residentRating}/5.0</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <ShieldCheck size={18} className={bid.livePhotosEnabled ? "text-green-500" : "text-slate-300"} />
                  <span className={bid.livePhotosEnabled ? "text-slate-900" : "text-slate-400"}>
                    Live-kuvaraportointi {bid.livePhotosEnabled ? 'sisältyy' : 'ei sisälly'}
                  </span>
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
                  <>Valitse Kumppani <CheckCircle2 size={18} /></>
                ) : (
                  'Vain Hallitus'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
