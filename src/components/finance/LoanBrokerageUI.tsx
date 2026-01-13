"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { submitLoanApplication } from '@/app/actions/loan-actions'
import { Loader2, Landmark, CheckCircle, TrendingDown, ShieldCheck, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoanBrokerageUIProps {
    projects: any[]
    applications: any[]
}

const BANKS = [
    { id: 'Nordea', name: 'Nordea', logo: 'N' },
    { id: 'OP', name: 'OP Ryhmä', logo: 'OP' },
    { id: 'Danske', name: 'Danske Bank', logo: 'DB' }
]

export function LoanBrokerageUI({ projects, applications }: LoanBrokerageUIProps) {
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [selectedBanks, setSelectedBanks] = useState<string[]>(['Nordea', 'OP'])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleApply = async () => {
        if (!selectedProject) return
        setIsSubmitting(true)
        try {
            await submitLoanApplication(selectedProject, selectedBanks)
        } catch (e) {
            console.error(e)
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleBank = (id: string) => {
        if (selectedBanks.includes(id)) {
            setSelectedBanks(selectedBanks.filter(b => b !== id))
        } else {
            setSelectedBanks([...selectedBanks, id])
        }
    }

    const formatEur = (val: number) => new Intl.NumberFormat('fi-FI', { style: 'currency', currency: 'EUR' }).format(val)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Lainapörssi & Rahoitus</h2>
                    <p className="text-slate-400">Kilpailuta taloyhtiolainat suoraan pankkien rajapinnoista.</p>
                </div>
            </div>

            {/* Application Wizard */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Landmark className="h-5 w-5 text-emerald-500" />
                        Uusi Lainahakemus
                    </CardTitle>
                    <CardDescription>Valitse hanke ja pankit joille hakemus lähetetään.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    {/* Project Selector */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-300">1. Valitse Rahoitettava Hanke</label>
                        <div className="grid gap-2">
                            {projects.length === 0 && <p className="text-slate-500 text-sm">Ei avoimia hankkeita.</p>}
                            {projects.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => setSelectedProject(p.id)}
                                    className={cn(
                                        "p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center",
                                        selectedProject === p.id 
                                            ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500" 
                                            : "bg-slate-950 border-slate-800 hover:border-slate-700"
                                    )}
                                >
                                    <div>
                                        <div className="font-medium text-white">{p.title}</div>
                                        <div className="text-xs text-slate-400">Arvio: {formatEur(p.estimatedCost)}</div>
                                    </div>
                                    {p.projectType && ['HEATING', 'WINDOWS', 'FACADE'].includes(p.projectType) && (
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Green</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bank Selector */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-300">2. Valitse Pankit</label>
                        <div className="flex gap-2">
                            {BANKS.map(bank => (
                                <div
                                    key={bank.id}
                                    onClick={() => toggleBank(bank.id)}
                                    className={cn(
                                        "flex-1 p-3 rounded-lg border cursor-pointer flex flex-col items-center justify-center gap-2 h-24",
                                        selectedBanks.includes(bank.id)
                                            ? "bg-slate-800 border-indigo-500 text-white"
                                            : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                                    )}
                                >
                                    <div className="text-lg font-bold">{bank.logo}</div>
                                    <div className="text-xs">{bank.name}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-lg text-sm text-blue-200 flex gap-2">
                            <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <span className="font-bold">Vahva Tunnistautuminen</span>
                                <p className="text-xs opacity-80">Allekirjoitetaan hallituksen pj:n pankkitunnuksilla ennen lähetystä.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        size="lg" 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={!selectedProject || selectedBanks.length === 0 || isSubmitting}
                        onClick={handleApply}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Käsitellään...</>
                        ) : (
                            'Lähetä Lainahakemus'
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Offers Grid */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Saapuneet Tarjoukset</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    {applications.map(app => {
                        const margin = app.offerMargin || 0
                        const refRate = 3.5 // Mock Euribor
                        const totalRate = margin + refRate
                        // Monthly cost approximation (Interest only for simplicity or annuity?)
                        // Prompt: "Projected Vastike Impact"
                        // totalShares is needed. Assume avg apartment size 70m2, total 2500m2.
                        // Impact = (Amount * (Rate/100) / 12) / TotalM2
                        const monthlyInterest = (app.amount * (totalRate / 100)) / 12
                        const impactPerM2 = monthlyInterest / 2500 // Mock area

                        const isGreen = app.riskAnalysis?.includes('"greenLoan":true')

                        return (
                            <Card key={app.id} className="bg-slate-900 border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
                                {isGreen && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-bl font-bold uppercase tracking-wider">
                                        Green Loan
                                    </div>
                                )}
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="border-slate-700 text-slate-300">{app.bankName}</Badge>
                                        <Badge className={cn(
                                            "uppercase",
                                            app.status === 'OFFER_RECEIVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800'
                                        )}>
                                            {app.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-white text-3xl font-mono mt-2">
                                        {margin.toFixed(2)}%
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        + Euribor 12kk ({refRate}%) = <span className="text-white font-bold">{totalRate.toFixed(2)}%</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Lainasumma</span>
                                            <span className="text-white">{formatEur(app.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Maksuaika</span>
                                            <span className="text-white">{app.repaymentTerm} vuotta</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Vakuus</span>
                                            <span className="text-white">{app.collateralType || '-'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingDown className="h-4 w-4 text-orange-500" />
                                            <span className="text-xs font-bold text-slate-300">RAHOITUSVASTIKEVAIKUTUS</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            {impactPerM2.toFixed(2)} €<span className="text-sm font-normal text-slate-500">/m²/kk</span>
                                        </div>
                                        <div className="text-xs text-slate-500">Pelkkä korko (alussa)</div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                                        Katso Ehdot & Hyväksy
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
