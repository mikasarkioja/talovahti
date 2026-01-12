'use client'
import { useStore } from "@/lib/store";
import Link from "next/link";
import { AlertCircle, Vote, CheckCircle2, ArrowRight } from "lucide-react";
import { EconomicOverview } from "@/components/finance/EconomicOverview";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { BuildingHealth } from "@/components/dashboard/BuildingHealth";
import { BuildingModel } from "@/components/BuildingModel";
import { TourOverlay } from "@/components/onboarding/TourOverlay";
import { useState } from "react";

export default function Home() {
  const { currentUser, tickets, initiatives } = useStore()
  
  // Tour State
  const [tourStep, setTourStep] = useState(1)
  const [tourRole, setTourRole] = useState<'RESIDENT' | 'BOARD' | null>(null)
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined)

  const isBoard = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER'

  // Sidebar Data Logic
  const activePolls = initiatives.filter(i => i.pipelineStage === 'VOTING' && !i.votes.some(v => v.userId === currentUser?.id))
  const approvalQueue = tickets.filter(t => (t.type === 'RENOVATION' && t.status === 'OPEN') || (t.priority === 'HIGH' && t.status === 'OPEN'))

  const handleApartmentClick = (id: string) => {
    if (tourStep === 3) {
        setHighlightId(id)
        setTourStep(4)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {tourStep > 0 && (
        <TourOverlay 
            step={tourStep} 
            onNext={() => setTourStep(p => p + 1)}
            onRoleSelect={setTourRole}
            onComplete={() => { setTourStep(0); setHighlightId(undefined) }}
        />
      )}

      {/* 1. Header & Role Context */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Tervetuloa kotiin, {currentUser?.name}
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm md:text-base">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            As Oy Esimerkkikatu 123 • {isBoard ? 'Hallitusnäkymä' : 'Asukasliittymä'}
          </p>
        </div>
        <div className="flex gap-3">
          {/* Mobile responsive action buttons could go here */}
        </div>
      </header>

      {/* 2. Hero Metric Zone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Left: Building Twin (Replaces Health for Tour visibility) */}
         <div className="md:col-span-1">
            <BuildingModel onApartmentClick={handleApartmentClick} highlightId={highlightId} />
         </div>
         {/* Center/Right: Economic Overview (Context Aware) */}
         <div className="md:col-span-2">
            <EconomicOverview />
         </div>
      </div>

      {/* 3. Main Operational Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column: Activity Feed (Takes 2/3 on desktop, full on mobile) */}
        <div className="lg:col-span-2">
           <ActivityFeed />
        </div>

        {/* Right Sidebar: Actionable Items */}
        <div className="space-y-6">
           
           {/* Context Aware Action Card */}
           <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
               {isBoard ? <CheckCircle2 className="text-blue-600" size={20} /> : <Vote className="text-purple-600" size={20} />}
               {isBoard ? 'Hyväksyntäjono' : 'Avoimet äänestykset'}
             </h3>

             <div className="space-y-3">
               {isBoard ? (
                 approvalQueue.length > 0 ? (
                   approvalQueue.map(item => (
                     <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.type}</span>
                          {item.priority === 'HIGH' && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                        </div>
                        <div className="text-sm font-medium text-slate-900 line-clamp-1">{item.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.apartmentId ? `Asunto ${item.apartmentId}` : 'Yleiset tilat'}</div>
                     </div>
                   ))
                 ) : (
                   <div className="text-sm text-slate-500 italic">Ei hyväksyttäviä kohteita.</div>
                 )
               ) : (
                 activePolls.length > 0 ? (
                   activePolls.map(poll => (
                     <div key={poll.id} className="p-3 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                        <div className="text-sm font-medium text-slate-900 mb-1">{poll.title}</div>
                        <Link href="/governance/voting" className="text-xs text-purple-700 font-bold flex items-center gap-1 hover:underline">
                          Äänestä nyt <ArrowRight size={12} />
                        </Link>
                     </div>
                   ))
                 ) : (
                   <div className="text-sm text-slate-500 italic">Olet äänestänyt kaikissa kohteissa.</div>
                 )
               )}
             </div>
             
             {isBoard && approvalQueue.length > 0 && (
               <Link href="/maintenance/tickets" className="block mt-4 text-center text-sm font-medium text-blue-600 hover:text-blue-800">
                 Siirry käsittelemään &rarr;
               </Link>
             )}
           </div>

           {/* Personal Status (Resident) or Quick Stats (Board) */}
           {!isBoard && (
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="text-orange-500" size={20} />
                  Omat ilmoitukset
                </h3>
                <div className="text-sm text-slate-600">
                  Sinulla on {tickets.filter(t => t.apartmentId === currentUser?.apartmentId && t.status !== 'CLOSED').length} avointa vikailmoitusta.
                </div>
                <Link href="/maintenance/tickets" className="block mt-3 text-sm font-medium text-blue-600 hover:underline">
                  Tee uusi ilmoitus
                </Link>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
