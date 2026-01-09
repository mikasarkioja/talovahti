'use client'
import { useParams, useRouter } from 'next/navigation'
import { useStore, MockBid } from '@/lib/store'
import { CheckCircle2, User, Clock, Star, ArrowRight, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

export default function ConstructionTenderPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, selectWinnerBid, currentUser } = useStore()
  
  const project = projects.find(p => p.id === params.id)
  // Mock data for construction tender since it wasn't in seed
  // In real app, we'd fetch or use existing logic if seeded
  const tender = project?.tenders.find(t => t.type === 'CONSTRUCTION') || {
    id: 'tend-const-mock',
    projectId: project?.id || '',
    type: 'CONSTRUCTION',
    status: 'OPEN',
    bids: [
        {
            id: 'bid-c1',
            tenderId: 'tend-const-mock',
            companyName: 'Rakennus Oy Laatu',
            price: 450000,
            startDate: new Date(2027, 0, 1),
            endDate: new Date(2027, 5, 30),
            creditRating: 'AA+',
            residentRating: 4.5,
            livePhotosEnabled: true,
            notes: 'Erikoistunut linjasaneerauksiin.',
            isWinner: false
        },
        {
            id: 'bid-c2',
            tenderId: 'tend-const-mock',
            companyName: 'Halpis-Saneeraus',
            price: 395000,
            startDate: new Date(2027, 0, 1),
            endDate: new Date(2027, 7, 30),
            creditRating: 'B',
            residentRating: 2.8,
            livePhotosEnabled: false,
            notes: 'Halvin hinta, mutta pidempi kesto.',
            isWinner: false
        },
        {
            id: 'bid-c3',
            tenderId: 'tend-const-mock',
            companyName: 'Premium Remontit',
            price: 490000,
            startDate: new Date(2027, 0, 1),
            endDate: new Date(2027, 4, 30),
            creditRating: 'AAA',
            residentRating: 4.9,
            livePhotosEnabled: true,
            notes: 'Nopein aikataulu ja paras laatu.',
            isWinner: false
        }
    ]
  }
  
  const isBoard = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER'

  const handleHire = (bid: any) => {
    if (!project) return
    // Mock update since we don't have this tender in store state effectively
    alert(`Urakoitsija valittu: ${bid.companyName}. Sopimusluonnos generoitu.`)
    router.push(`/governance/projects/${project.id}/execution`)
  }

  if (!project) return <div>Project not found</div>

  // Find Lowest Price
  const lowestPrice = Math.min(...tender.bids.map((b: any) => b.price))

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <div className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">Vaihe 2: Urakoitsijan Valinta</div>
        <h1 className="text-3xl font-bold text-slate-900">Kilpailuta Urakka</h1>
        <p className="text-slate-500 mt-1">
          Vertaile tarjouksia hinnan, laadun ja aikataulun perusteella.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tender.bids.map((bid: any) => {
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
    </div>
  )
}
