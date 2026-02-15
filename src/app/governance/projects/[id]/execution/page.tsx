'use client'
import { useParams } from 'next/navigation'
import { useStore, MockSiteReport, MockChangeOrder, MockMilestone } from '@/lib/store'
import { 
  Camera, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  CreditCard,
  History,
  ShieldCheck,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { useState, useTransition, useEffect } from 'react'
import { clsx } from 'clsx'
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Guardrail } from "@/components/finance/Guardrail"
import { approveMilestoneAction, completeProjectAction } from "@/app/actions/project-actions"
import { toast } from "sonner"

export default function ExecutionPage() {
  const params = useParams()
  const { projects, addSiteReport, updateChangeOrder, updateMilestoneStatus, completeProjectInStore, currentUser, housingCompany } = useStore()
  const [isPending, startTransition] = useTransition()
  const [isCompleting, setIsCompleting] = useState(false)
  
  const projectId = typeof params.id === 'string' ? params.id : ''
  const project = projects.find(p => p.id === projectId)
  
  const [reportContent, setReportContent] = useState('')
  const [changeTitle, setChangeTitle] = useState('')
  const [changeCost, setChangeCost] = useState(0)
  
  // Mock logic: add default milestones if none exist for demo
  useEffect(() => {
    if (project && (!project.milestones || project.milestones.length === 0)) {
      // In real app, these come from DB. For MVP/demo store, we'd have them.
      // Since store is client-side mock, I'll just rely on what's there or handle empty.
    }
  }, [project])

  if (!project) return <div className="p-20 text-center text-slate-500 italic">Projektia ei löytynyt.</div>

  const isSupervisor = currentUser?.role === "ADMIN" // Simulating Supervisor access
  const isBoard = currentUser?.role === "BOARD_MEMBER" || currentUser?.role === "ADMIN"
  const healthScore = housingCompany?.healthScore || 78

  // Calculate Progress based on paid milestones
  const paidMilestones = project.milestones.filter(m => m.status === 'PAID')
  const progressPct = project.milestones.length > 0 
    ? Math.round((paidMilestones.length / project.milestones.length) * 100) 
    : 15; // Default mock progress

  const canComplete = progressPct === 100

  const handlePostReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return
    
    addSiteReport({
        id: `rep-${Date.now()}`,
        projectId: project.id,
        authorId: currentUser?.id || 'anon',
        content: reportContent,
        timestamp: new Date(),
        imageUrl: 'https://placehold.co/600x400/png?text=Työmaakuva' 
    })
    setReportContent('')
    toast.success("Valvontaraportti julkaistu.")
  }

  const handleApproveMilestone = (milestone: MockMilestone) => {
    if (!currentUser) return;

    startTransition(async () => {
      const res = await approveMilestoneAction({
        milestoneId: milestone.id,
        projectId: project.id,
        userId: currentUser.id,
        amount: milestone.amount,
        title: milestone.title
      });

      if (res.success) {
        updateMilestoneStatus(project.id, milestone.id, 'PAID');
        toast.success(`Maksuerä "${milestone.title}" hyväksytty maksuun.`, {
          description: "Ansaitsit +100 XP hallitusprofiiliisi."
        });
      } else {
        toast.error(res.error || "Virhe hyväksynnässä.");
      }
    });
  }

  const handleCompleteProject = () => {
    if (!currentUser || !project) return;
    if (!confirm("Haluatko varmasti päättää urakan ja suorittaa vastaanottotarkastuksen?")) return;

    setIsCompleting(true);
    startTransition(async () => {
      const res = await completeProjectAction(project.id, currentUser.id);
      setIsCompleting(false);

      if (res.success && res.data) {
        completeProjectInStore(project.id, new Date(res.data.updatedProject.warrantyEndDate));
        toast.success("Urakka päättyi!", {
          description: res.message
        });
      } else {
        toast.error(res.error || "Virhe urakan päättämisessä.");
      }
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black text-brand-emerald uppercase tracking-widest mb-1 flex items-center gap-2">
            <ShieldCheck size={12} />
            Vaihe 3: Toteutus & Valvonta (YSE 1998)
          </div>
          <h1 className="text-3xl font-black text-brand-navy tracking-tight uppercase">
            {project.title}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Urakan reaaliaikainen valvonta ja maksuliikenne
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald font-black text-xl">
            {progressPct}%
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Urakan valmiusaste</div>
            <div className="w-32">
              <Progress value={progressPct} className="h-1.5 bg-slate-100" />
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Milestones & Finance */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Milestone Payments */}
          <Card className="shadow-soft border-brand-navy/5 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg font-bold text-brand-navy flex items-center gap-2 uppercase tracking-tight">
                    <CreditCard size={20} className="text-brand-emerald" />
                    Maksuerät ja talous
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Hyväksy maksuerät urakan valmiusasteen mukaan
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold">
                  {paidMilestones.length} / {project.milestones.length} MAKSETTU
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {project.milestones.length === 0 && (
                  <div className="p-12 text-center text-slate-400 italic text-sm">
                    Ei määritettyjä maksueriä.
                  </div>
                )}
                {project.milestones.map((m) => (
                  <div key={m.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/30 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                        m.status === 'PAID' 
                          ? "bg-brand-emerald/10 border-brand-emerald text-brand-emerald" 
                          : "bg-slate-50 border-slate-200 text-slate-300"
                      )}>
                        {m.status === 'PAID' ? <CheckCircle size={20} /> : <Clock size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy">{m.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium text-slate-500">Eräpäivä: {m.dueDate.toLocaleDateString('fi-FI')}</span>
                          <span className="text-xs font-black text-slate-900">{m.amount.toLocaleString('fi-FI')} €</span>
                        </div>
                      </div>
                    </div>

                    {m.status === 'PENDING' && isBoard && (
                      <Guardrail 
                        amount={m.amount} 
                        title={m.title} 
                        onApprove={() => handleApproveMilestone(m)}
                        healthScore={healthScore}
                      >
                        <Button 
                          className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold h-10 px-6 rounded-xl shadow-sm"
                          disabled={isPending}
                        >
                          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle className="mr-2" size={16} />}
                          Hyväksy maksuun
                        </Button>
                      </Guardrail>
                    )}

                    {m.status === 'PAID' && (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 font-black px-3 py-1 uppercase text-[10px]">
                        Maksettu {new Date().toLocaleDateString('fi-FI')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Site Journal / Feed */}
          <Card className="shadow-soft border-brand-navy/5">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-bold text-brand-navy flex items-center gap-2 uppercase tracking-tight">
                  <Camera size={20} className="text-brand-emerald" />
                  Valvontaraportti
                </CardTitle>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] uppercase font-bold">
                  Julkinen asukkaille
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isSupervisor && (
                <form onSubmit={handlePostReport} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-8">
                  <textarea 
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-brand-emerald focus:border-transparent outline-none transition-all"
                    placeholder="Kirjoita valvontahavainto tai tilannepäivitys..."
                    rows={3}
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <Button type="button" variant="ghost" className="text-xs font-bold text-slate-500 hover:text-brand-navy">
                      <Camera size={16} className="mr-2" /> Lisää työmaakuva
                    </Button>
                    <Button type="submit" className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold px-6 rounded-xl">
                      Julkaise raportti
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-8">
                {project.siteReports.length === 0 && (
                  <div className="text-center py-12 text-slate-400 italic text-sm">
                    Ei vielä raportteja.
                  </div>
                )}
                {project.siteReports.map((report, idx) => (
                  <div key={report.id} className="relative pl-8">
                    {idx !== project.siteReports.length - 1 && (
                      <div className="absolute left-[11px] top-8 bottom-[-32px] w-0.5 bg-slate-100" />
                    )}
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-emerald flex items-center justify-center z-10 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-brand-emerald" />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-black text-brand-navy uppercase tracking-tighter">
                        VALVONTARAPORTTI • {report.timestamp.toLocaleDateString('fi-FI')}
                      </div>
                      <div className="text-[10px] font-medium text-slate-400">
                        {report.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <p className="text-slate-700 text-sm leading-relaxed mb-4">{report.content}</p>
                      {report.imageUrl && (
                        <img src={report.imageUrl} alt="Työmaakuva" className="rounded-xl border border-slate-100 w-full object-cover max-h-64" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Decisions & History */}
        <div className="space-y-6">
          
          {/* Change Orders */}
          <Card className="shadow-soft border-brand-navy/5">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100/50">
              <CardTitle className="text-sm font-black text-amber-900 flex items-center gap-2 uppercase">
                <AlertTriangle size={16} className="text-amber-600" />
                Muutostyöt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {project.changeOrders.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  Ei vireillä olevia muutostöitä.
                </div>
              )}
              {project.changeOrders.map(co => (
                <div key={co.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-brand-navy uppercase leading-tight">{co.title}</h4>
                    <Badge className={clsx(
                      "text-[8px] font-black uppercase",
                      co.status === 'PENDING' ? "bg-amber-100 text-amber-800" :
                      co.status === 'APPROVED' ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    )}>
                      {co.status}
                    </Badge>
                  </div>
                  <div className="text-sm font-black text-brand-navy">
                    {co.costImpact > 0 ? '+' : ''}{co.costImpact.toLocaleString('fi-FI')} €
                  </div>
                  
                  {co.status === 'PENDING' && isBoard && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => updateChangeOrder(co.id, 'APPROVED')}
                        className="flex-1 bg-brand-emerald hover:bg-emerald-600 text-white font-bold h-8 text-[10px] uppercase"
                      >
                        Hyväksy
                      </Button>
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => updateChangeOrder(co.id, 'REJECTED')}
                        className="flex-1 text-rose-600 hover:text-rose-700 font-bold h-8 text-[10px] uppercase bg-rose-50"
                      >
                        Hylkää
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Decision History */}
          <Card className="shadow-soft border-brand-navy/5">
            <CardHeader>
              <CardTitle className="text-sm font-black text-brand-navy flex items-center gap-2 uppercase">
                <History size={16} className="text-brand-emerald" />
                Päätöshistoria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                <div className="p-4 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-emerald mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Sopimus allekirjoitettu</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">Visma Sign • 14.02.2026</p>
                  </div>
                </div>
                <div className="p-4 flex items-start gap-3 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-500">Valvoja valittu</p>
                    <p className="text-[10px] text-slate-400 uppercase mt-0.5">Insinööritoimisto Laatu • 12.02.2026</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50">
                <Button variant="outline" className="w-full h-8 text-[10px] font-bold text-slate-500 uppercase tracking-tighter border-slate-200">
                  Lataa Audit Log (PDF) <FileText size={12} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card className="bg-brand-navy text-white shadow-soft border-none overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-black text-brand-emerald uppercase tracking-widest">
                <TrendingUp size={14} />
                Hankkeen KPI
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-tight">Kokonaiskustannus</p>
                  <p className="text-lg font-black">{project.estimatedCost?.toLocaleString('fi-FI')} €</p>
                </div>
                <div>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-tight">Vastikevaikutus</p>
                  <p className="text-lg font-black">+0,12 €/m²</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Handover Section */}
          <Card className="shadow-soft border-brand-emerald/20 bg-emerald-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-black text-brand-emerald uppercase flex items-center gap-2">
                <CheckCircle size={14} />
                Vastaanottotarkastus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {['LVI-tarkastuspöytäkirjat', 'Sähkömittaukset', 'Painekokeet', 'Loppusiivous'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                    <div className="w-3 h-3 rounded border border-slate-300 bg-white flex items-center justify-center shrink-0">
                      {progressPct === 100 && <CheckCircle size={10} className="text-brand-emerald" />}
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              
              <Button 
                disabled={!canComplete || isCompleting || project.status === 'COMPLETED'} 
                onClick={handleCompleteProject}
                className={clsx(
                  "w-full font-black py-2 rounded-xl text-[10px] uppercase transition-all h-10",
                  canComplete && project.status !== 'COMPLETED'
                    ? "bg-brand-emerald hover:bg-emerald-600 text-white shadow-md" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                {isCompleting ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle className="mr-2" size={14} />}
                {project.status === 'COMPLETED' ? 'Urakka arkistoitu' : 'Päätä urakka ja arkistoi'}
              </Button>
              
              {project.status === 'COMPLETED' && (
                <div className="p-3 bg-white rounded-lg border border-brand-emerald/20 text-[10px] text-brand-emerald font-bold text-center">
                  Takuuaika päättyy: {project.warrantyEndDate?.toLocaleDateString('fi-FI')}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
