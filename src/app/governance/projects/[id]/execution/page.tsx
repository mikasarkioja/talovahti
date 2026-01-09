'use client'
import { useParams } from 'next/navigation'
import { useStore, MockSiteReport, MockChangeOrder } from '@/lib/store'
import { Camera, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

export default function ExecutionPage() {
  const params = useParams()
  const { projects, addSiteReport, updateChangeOrder, currentUser } = useStore()
  
  const project = projects.find(p => p.id === params.id)
  
  const [reportContent, setReportContent] = useState('')
  const [changeTitle, setChangeTitle] = useState('')
  const [changeCost, setChangeCost] = useState(0)
  
  // Mock Supervisor Role Check (In real app, check if currentUser is the hired supervisor)
  const isSupervisor = currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN' // Simulating Supervisor access
  const isBoard = currentUser?.role === 'BOARD'

  const handlePostReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    
    addSiteReport({
        id: `rep-${Date.now()}`,
        projectId: project.id,
        authorId: currentUser?.id || 'anon',
        content: reportContent,
        timestamp: new Date(),
        imageUrl: 'https://placehold.co/600x400/png?text=Työmaakuva' // Mock image
    })
    setReportContent('')
  }

  const handleCreateChangeOrder = (e: React.FormEvent) => {
      // Mock creation logic not fully in store actions for new CO, but we have update.
      // Assuming we'd add it. For UI demo we'll skip adding to store and just alert.
      e.preventDefault()
      alert('Muutostyötarjous lähetetty hallitukselle hyväksyttäväksi.')
      setChangeTitle('')
      setChangeCost(0)
  }

  if (!project) return <div>Project not found</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-[calc(100vh-64px)] flex flex-col">
      <header className="flex-shrink-0">
        <div className="text-sm text-green-600 font-bold uppercase tracking-wider mb-2">Vaihe 3: Toteutus & Valvonta</div>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">{project.title} - Työmaaportaali</h1>
                <p className="text-slate-500 mt-1">
                Reaaliaikainen seuranta, työmaapäiväkirja ja muutostyöhallinta.
                </p>
            </div>
            <div className="bg-green-50 text-green-800 px-4 py-2 rounded-lg font-bold border border-green-200">
                Status: KÄYNNISSÄ
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        
        {/* Left: Site Journal (Feed) */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Camera size={20} className="text-blue-600" />
                    Työmaapäiväkirja
                </h3>
                <span className="text-xs text-slate-500">Näkyy asukkaille</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Input for Supervisor */}
                {isSupervisor && (
                    <form onSubmit={handlePostReport} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                        <textarea 
                            className="w-full p-3 border border-slate-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Kirjoita viikkoraportti tai tilannepäivitys..."
                            rows={3}
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                        />
                        <div className="flex justify-between items-center">
                            <button type="button" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
                                <Camera size={16} /> Lisää kuva
                            </button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                Julkaise
                            </button>
                        </div>
                    </form>
                )}

                {/* Feed */}
                {project.siteReports.length === 0 && <div className="text-center text-slate-400 py-10">Ei vielä raportteja.</div>}
                
                {project.siteReports.map(report => (
                    <div key={report.id} className="border-l-2 border-blue-100 pl-4 relative">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                        <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                            <span className="font-bold text-slate-700">Valvoja</span>
                            <span>•</span>
                            {report.timestamp.toLocaleDateString()} klo {report.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <p className="text-slate-800 mb-3 text-sm leading-relaxed">{report.content}</p>
                        {report.imageUrl && (
                            <img src={report.imageUrl} alt="Työmaakuva" className="rounded-lg border border-slate-200 w-full max-w-md" />
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Right: Change Orders & Admin */}
        <div className="space-y-6 flex flex-col">
            
            {/* Change Orders */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                <div className="p-4 border-b border-slate-100 bg-amber-50 flex justify-between items-center">
                    <h3 className="font-bold text-amber-900 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-600" />
                        Muutostyöt
                    </h3>
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        {project.changeOrders.filter(co => co.status === 'PENDING').length} odottaa
                    </span>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto max-h-[400px]">
                     {isSupervisor && (
                         <form onSubmit={handleCreateChangeOrder} className="bg-slate-50 p-3 rounded border border-slate-200 space-y-2">
                             <input 
                                type="text" 
                                placeholder="Muutoksen otsikko" 
                                className="w-full text-sm p-2 border rounded"
                                value={changeTitle}
                                onChange={e => setChangeTitle(e.target.value)}
                             />
                             <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Hinta €" 
                                    className="w-1/2 text-sm p-2 border rounded"
                                    value={changeCost || ''}
                                    onChange={e => setChangeCost(Number(e.target.value))}
                                />
                                <button className="w-1/2 bg-amber-500 text-white text-xs font-bold rounded">Luo Ehdotus</button>
                             </div>
                         </form>
                     )}

                     {project.changeOrders.map(co => (
                         <div key={co.id} className="border border-slate-100 rounded-lg p-3 shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="font-bold text-sm text-slate-900">{co.title}</h4>
                                 <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded", 
                                     co.status === 'PENDING' ? "bg-amber-100 text-amber-800" :
                                     co.status === 'APPROVED' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                 )}>
                                     {co.status}
                                 </span>
                             </div>
                             <div className="text-sm font-medium text-slate-700 mb-3">
                                 Hinta: {co.costImpact > 0 ? '+' : ''}{co.costImpact.toLocaleString()} €
                             </div>
                             
                             {co.status === 'PENDING' && isBoard && (
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => updateChangeOrder(co.id, 'APPROVED')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1.5 rounded transition-colors"
                                     >
                                         Hyväksy
                                     </button>
                                     <button 
                                        onClick={() => updateChangeOrder(co.id, 'REJECTED')}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-1.5 rounded transition-colors"
                                     >
                                         Hylkää
                                     </button>
                                 </div>
                             )}
                         </div>
                     ))}
                </div>
            </div>

            {/* Checklist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Vastaanottotarkastus</h3>
                <div className="space-y-2">
                    {['LVI-tarkastuspöytäkirjat', 'Sähkömittaukset', 'Painekokeet', 'Loppusiivous'].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-4 h-4 rounded border border-slate-300 bg-white"></div>
                            {item}
                        </div>
                    ))}
                </div>
                <button disabled className="mt-4 w-full bg-slate-200 text-slate-400 font-bold py-2 rounded text-sm cursor-not-allowed">
                    Hyväksy Urakka
                </button>
            </div>

        </div>
      </div>
    </div>
  )
}
