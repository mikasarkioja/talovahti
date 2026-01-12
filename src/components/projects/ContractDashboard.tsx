"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { FileText, PenTool, CheckCircle2, Lock, ShieldCheck, AlertCircle, BookOpen } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

// Mock YSE 1998 Clauses
const YSE_CLAUSES = {
    'viivastys': "18 § Viivästyminen: Jos urakoitsija viivästyy, tilaajalla on oikeus viivästyssakkoon...",
    'vastaanotto': "71 § Vastaanottotarkastus: Työn tultua valmiiksi pidetään vastaanottotarkastus..."
}

type Milestone = {
    id: string
    title: string
    amount: number
    dueDate: string
    isApproved: boolean
    isPaid: boolean
}

export default function ContractDashboard({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<'DRAFT' | 'SIGNING' | 'ACTIVE'>('DRAFT')
  const [contractText, setContractText] = useState<string>("")
  const [isBoardSigned, setIsBoardSigned] = useState(false)
  const [isContractorSigned, setIsContractorSigned] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(false)

  // Simulate Fetching Data
  useEffect(() => {
    // In real app, fetch from API
    setContractText(`
URAKKASOPIMUS (LUONNOS)

1. OSAPUOLET
   Tilaaja: As Oy Esimerkki
   Urakoitsija: Rakennus Oy Laatu

... (Ladataan koko sopimus) ...

6. YLEISET EHDOT (YSE 1998)
   Noudatetaan YSE 1998 ehtoja.
    `)
    
    setMilestones([
        { id: '1', title: "Ennakkomaksu / Materiaalit", amount: 25000, dueDate: '2026-06-01', isApproved: true, isPaid: true },
        { id: '2', title: "Työvaihe 1: Purkutyöt", amount: 37500, dueDate: '2026-07-01', isApproved: false, isPaid: false },
        { id: '3', title: "Työvaihe 2: Asennus", amount: 50000, dueDate: '2026-08-01', isApproved: false, isPaid: false },
        { id: '4', title: "Luovutus", amount: 12500, dueDate: '2026-09-01', isApproved: false, isPaid: false },
    ])
  }, [])

  const handleGenerate = async () => {
    setLoading(true)
    setTimeout(() => {
        setContractText(`
URAKKASOPIMUS (YSE 1998)

1. OSAPUOLET
   Tilaaja: As Oy Esimerkki (Y-tunnus: 1234567-8)
   Urakoitsija: Rakennus Oy Laatu

2. URAKKAKKOHDE
   Hanke: Ikkunaremontti 2026
   Osoite: Mannerheimintie 1, 00100 Helsinki

3. URAKKA-AIKA
   Aloitus: 01.06.2026
   Valmistuminen: 31.08.2026

4. HINTA JA MAKSUEHDOT
   Urakkahinta: 125 000 € (alv 0%)
   Maksuerät: Ks. Liite 1.

5. VAKUUDET JA SAKOT
   Viivästyssakko: 0.05% / työpäivä.
   Työnaikainen vakuus: 10%.

Tämä sopimus luotu automaattisesti YSE 1998 -pohjalle.
        `)
        setStatus('SIGNING')
        setLoading(false)
    }, 1500)
  }

  const handleSignBoard = () => {
    setIsBoardSigned(true)
    if (isContractorSigned) setStatus('ACTIVE')
  }

  const handleSignContractor = () => {
    setIsContractorSigned(true)
    if (isBoardSigned) setStatus('ACTIVE')
  }

  const handleApproveMilestone = (id: string) => {
    const ms = milestones.find(m => m.id === id)
    if (ms) {
        if (confirm(`Hyväksytäänkö maksuerä "${ms.title}" (${ms.amount} €)?\n\nTämä lähettää maksuosoituksen isännöitsijäntoimistoon.`)) {
            setMilestones(milestones.map(m => m.id === id ? { ...m, isApproved: true } : m))
            alert("Maksuerä hyväksytty! Hallitukselle lähetetty notifikaatio.")
        }
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Urakkasopimus & Maksut</h1>
                <p className="text-slate-500">Ikkunaremontti (ID: {projectId})</p>
            </div>
            <div className="flex items-center gap-2">
                 <Badge variant={status === 'ACTIVE' ? 'default' : 'outline'} className={status === 'ACTIVE' ? 'bg-emerald-600' : ''}>
                    {status === 'DRAFT' ? 'Luonnos' : status === 'SIGNING' ? 'Allekirjoitetaan' : 'Aktiivinen'}
                 </Badge>
            </div>
        </div>

        {/* Timeline */}
        <div className="relative pt-4 pb-8">
             <div className="h-1 bg-slate-200 absolute top-1/2 left-0 right-0 -translate-y-1/2 z-0" />
             <div className="relative z-10 flex justify-between px-12">
                <div className={`flex flex-col items-center gap-2 ${['DRAFT', 'SIGNING', 'ACTIVE'].includes(status) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${['DRAFT', 'SIGNING', 'ACTIVE'].includes(status) ? 'bg-white border-emerald-600' : 'bg-slate-100 border-slate-300'}`}>
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Laadinta</span>
                </div>
                <div className={`flex flex-col items-center gap-2 ${['SIGNING', 'ACTIVE'].includes(status) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${['SIGNING', 'ACTIVE'].includes(status) ? 'bg-white border-emerald-600' : 'bg-slate-100 border-slate-300'}`}>
                        <PenTool className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Allekirjoitus</span>
                </div>
                <div className={`flex flex-col items-center gap-2 ${status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${status === 'ACTIVE' ? 'bg-white border-emerald-600' : 'bg-slate-100 border-slate-300'}`}>
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Toteutus (YSE 1998)</span>
                </div>
             </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Contract View */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className="bg-slate-50 border-b flex flex-row justify-between items-center py-3">
                        <div className="flex items-center gap-2">
                             <FileText className="w-4 h-4 text-slate-500" />
                             <span className="font-serif font-bold text-slate-700">URAKKASOPIMUS.pdf</span>
                        </div>
                        {status === 'DRAFT' && (
                            <Button size="sm" onClick={handleGenerate} disabled={loading}>
                                {loading ? 'Generoidaan...' : 'Luo YSE 1998 Sopimus'}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative bg-white">
                        <ScrollArea className="h-full p-8 font-serif text-sm leading-relaxed text-slate-800">
                            <pre className="whitespace-pre-wrap font-serif">{contractText}</pre>
                        </ScrollArea>
                        
                        {/* Signing Overlay */}
                        {status === 'SIGNING' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">Tilaaja (Hallitus)</span>
                                            {isBoardSigned ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1"/> Allekirjoitettu (Vahva Tunnistus)</Badge>
                                            ) : (
                                                <Button size="sm" onClick={handleSignBoard} className="bg-blue-600 hover:bg-blue-700">
                                                    <Lock className="w-3 h-3 mr-2" /> Allekirjoita (Visma Sign)
                                                </Button>
                                            )}
                                        </div>
                                        <div className="w-px bg-slate-200" />
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider">Urakoitsija (TJ)</span>
                                            {isContractorSigned ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1"/> Allekirjoitettu</Badge>
                                            ) : (
                                                <Button size="sm" variant="outline" onClick={handleSignContractor}>
                                                    Odottaa allekirjoitusta...
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                <div className="flex gap-2">
                     <Button variant="outline" className="text-xs" onClick={() => alert(YSE_CLAUSES.viivastys)}>
                        <BookOpen className="w-3 h-3 mr-2" /> YSE 18 § (Viivästys)
                     </Button>
                     <Button variant="outline" className="text-xs" onClick={() => alert(YSE_CLAUSES.vastaanotto)}>
                        <BookOpen className="w-3 h-3 mr-2" /> YSE 71 § (Tarkastus)
                     </Button>
                </div>
            </div>

            {/* Right: Milestones & Payments */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Maksuerät & Valmiusaste</CardTitle>
                        <CardDescription>Projektin laskutus etenee maksuerien mukaan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                             <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Valmiusaste</span>
                                <span className="font-bold">25%</span>
                             </div>
                             <Progress value={25} className="h-2" />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                            {milestones.map((ms, i) => (
                                <div key={ms.id} className="flex items-start justify-between group">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full ${ms.isApproved ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        <div>
                                            <div className="text-sm font-medium">{ms.title}</div>
                                            <div className="text-xs text-slate-500">{ms.dueDate}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono text-sm">{ms.amount.toLocaleString()} €</div>
                                        {ms.isApproved ? (
                                            <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-100">
                                                HYVÄKSYTTY
                                            </Badge>
                                        ) : (
                                            <Button 
                                                size="sm" 
                                                variant="ghost" 
                                                className="h-6 text-[10px] text-blue-600 hover:text-blue-700 px-2"
                                                onClick={() => handleApproveMilestone(ms.id)}
                                                disabled={status !== 'ACTIVE'}
                                            >
                                                Hyväksy
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 text-xs text-slate-500 border-t p-3">
                        Yhteensä: {milestones.reduce((acc, m) => acc + m.amount, 0).toLocaleString()} €
                    </CardFooter>
                </Card>

                <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                         <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Valvojan Muistio
                         </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-blue-800">
                        Seuraava maksuerä (Työvaihe 1) edellyttää purkukatselmuksen hyväksymistä. Varaa katselmus 2 viikkoa ennen eräpäivää.
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  )
}
