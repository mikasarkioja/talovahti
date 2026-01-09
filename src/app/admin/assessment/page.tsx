'use client'
import { useState } from 'react'
import { useStore, MockObservation } from '@/lib/store'
import { CheckCircle, AlertTriangle, Clock, MapPin, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { SolutionDesigner } from '@/components/maintenance/SolutionDesigner'
import { OptionComparison } from '@/components/maintenance/OptionComparison'

export default function AssessmentPage() {
  const { observations, addAssessment } = useStore()
  const [selectedObs, setSelectedObs] = useState<MockObservation | null>(null)
  
  // Form State
  const [severity, setSeverity] = useState(1)
  const [verdict, setVerdict] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())

  const handleAssess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedObs) return

    addAssessment(selectedObs.id, {
      id: `assess-${Date.now()}`,
      severityGrade: severity,
      technicalVerdict: verdict,
      recommendedYear: year,
      options: []
    })
    
    // Refresh selected object from store to get the new assessment structure
    // In a real app with SWR/React Query this would be automatic
    // Here we rely on the parent re-render or we can manually update local state if needed
    // But since `observations` comes from store, it will update.
    // However, `selectedObs` is a copy. We should re-select it after update.
    // Ideally we track by ID.
  }

  // Effect to keep selectedObs in sync with store would be better, 
  // but for mock simplicity we'll just re-find it in render.
  const activeObs = selectedObs ? observations.find(o => o.id === selectedObs.id) : null
  const hasAssessment = !!activeObs?.assessment

  const openObservations = observations.filter(o => o.status === 'OPEN')
  const reviewedObservations = observations.filter(o => o.status === 'REVIEWED')

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kuntoarvio (Expert View)</h1>
          <p className="text-slate-500">Hallinnoi asukashavaintoja ja päivitä PTS-suunnitelmaa.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        
        {/* Left: Observation Feed */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 flex justify-between">
            <span>Tehtäväjono</span>
          </div>
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Käsittelemättömät ({openObservations.length})</h5>
            {openObservations.map(obs => (
              <div 
                key={obs.id}
                onClick={() => { setSelectedObs(obs); setVerdict(''); setSeverity(1); }}
                className={clsx(
                  "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                  activeObs?.id === obs.id 
                    ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300" 
                    : "bg-white border-slate-200 hover:border-blue-200"
                )}
              >
                 <div className="flex justify-between items-start mb-1">
                   <span className="font-bold text-slate-800 text-sm">{obs.component}</span>
                   <span className="text-xs text-slate-500">{obs.createdAt.toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm text-slate-600 line-clamp-2">{obs.description}</p>
              </div>
            ))}

            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-6">Viimeksi arvioidut ({reviewedObservations.length})</h5>
            {reviewedObservations.map(obs => (
              <div 
                key={obs.id}
                onClick={() => setSelectedObs(obs)}
                className={clsx(
                  "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md opacity-75 hover:opacity-100",
                  activeObs?.id === obs.id 
                    ? "bg-slate-100 border-slate-300 ring-1 ring-slate-300" 
                    : "bg-slate-50 border-slate-200"
                )}
              >
                 <div className="flex justify-between items-start mb-1">
                   <div className="flex items-center gap-2">
                     <CheckCircle size={14} className="text-green-600" />
                     <span className="font-bold text-slate-800 text-sm line-through">{obs.component}</span>
                   </div>
                 </div>
                 <div className="text-xs text-slate-500 mt-1">Luokka {obs.assessment?.severityGrade} • {obs.assessment?.recommendedYear}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Center & Right: Workflow Area */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
           <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700 flex items-center gap-2">
             <span>Työtila</span>
             {activeObs && <span className="text-slate-400 text-sm font-normal">/ {activeObs.component}</span>}
           </div>
           
           <div className="p-6 flex-1 overflow-y-auto">
             {activeObs ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 
                 {/* Phase 1: Diagnosis */}
                 <div className="space-y-6">
                   <div>
                     <div className="flex justify-between items-start">
                       <h3 className="font-bold text-lg mb-1">{activeObs.component}</h3>
                       <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">{activeObs.id}</span>
                     </div>
                     <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm italic">
                       "{activeObs.description}"
                     </p>
                     {activeObs.location && (
                       <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                         <MapPin size={12} /> {activeObs.location}
                       </div>
                     )}
                   </div>

                   <div className="border-t border-slate-100 pt-4">
                     <h4 className="font-semibold text-slate-800 mb-4">Vaihe 1: Diagnoosi</h4>
                     {hasAssessment ? (
                       <div className="space-y-3">
                         <div className="flex items-center gap-3">
                           <span className={clsx(
                             "px-2 py-1 rounded text-sm font-bold",
                             activeObs.assessment?.severityGrade === 4 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                           )}>
                             Vakavuus: {activeObs.assessment?.severityGrade}/4
                           </span>
                           <span className="text-sm text-slate-500">Vuosi: {activeObs.assessment?.recommendedYear}</span>
                         </div>
                         <p className="text-sm text-slate-700">{activeObs.assessment?.technicalVerdict}</p>
                       </div>
                     ) : (
                       <form onSubmit={handleAssess} className="space-y-4">
                         <div>
                           <label className="block text-xs font-medium text-slate-600 mb-1">Vakavuusaste</label>
                           <div className="flex gap-2">
                             {[1, 2, 3, 4].map(lvl => (
                               <button
                                 key={lvl}
                                 type="button"
                                 onClick={() => setSeverity(lvl)}
                                 className={clsx(
                                   "flex-1 py-2 rounded-lg font-bold text-sm border transition-colors",
                                   severity === lvl 
                                     ? (lvl === 4 ? "bg-red-500 text-white border-red-600" : "bg-blue-600 text-white border-blue-700")
                                     : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                 )}
                               >
                                 {lvl}
                               </button>
                             ))}
                           </div>
                         </div>

                         <div>
                           <label className="block text-xs font-medium text-slate-600 mb-1">Tekninen lausunto</label>
                           <textarea
                             value={verdict}
                             onChange={e => setVerdict(e.target.value)}
                             rows={3}
                             className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                             placeholder="Asiantuntijan arvio..."
                             required
                           />
                         </div>

                         <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Suositeltu korjausvuosi</label>
                            <input 
                              type="number"
                              value={year}
                              onChange={e => setYear(parseInt(e.target.value))}
                              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
                            />
                         </div>

                         <button 
                           type="submit"
                           className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm shadow-sm"
                         >
                           Tallenna Diagnoosi
                         </button>
                       </form>
                     )}
                   </div>
                 </div>

                 {/* Phase 2: Options (Only visible after diagnosis) */}
                 {hasAssessment && (
                   <div className="border-l border-slate-100 pl-8 relative">
                     {/* Step Indicator */}
                     <div className="absolute -left-3 top-0 bg-blue-100 text-blue-600 rounded-full p-1 border-4 border-white">
                        <ChevronRight size={16} />
                     </div>
                     
                     <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                       <SolutionDesigner observation={activeObs} />
                       
                       {activeObs.assessment?.options && activeObs.assessment.options.length > 0 && (
                         <OptionComparison options={activeObs.assessment.options} />
                       )}
                     </div>
                   </div>
                 )}

               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <AlertTriangle size={48} className="mb-4 opacity-20" />
                 <p>Valitse havainto vasemmalta aloittaaksesi arvioinnin.</p>
               </div>
             )}
           </div>
        </div>

      </div>
    </div>
  )
}
