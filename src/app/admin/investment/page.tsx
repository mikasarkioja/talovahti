"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp, FileText, ShieldCheck, AlertTriangle, Download } from 'lucide-react'

// Mock Data
const MOCK_DATA = {
    score: 72,
    grade: 'C',
    pillars: [
        { subject: 'Tekninen (40%)', A: 65, fullMark: 100 },
        { subject: 'Talous (30%)', A: 85, fullMark: 100 },
        { subject: 'Energia (15%)', A: 60, fullMark: 100 },
        { subject: 'Hallinto (15%)', A: 90, fullMark: 100 },
    ],
    debtPerM2: 450
}

export default function InvestmentGradePage() {
  const [data, setData] = useState(MOCK_DATA)
  const [loading, setLoading] = useState(false)

  const handleSimulate = () => {
    setLoading(true)
    setTimeout(() => {
        // Simulate Solar Panel Investment impact
        setData({
            ...data,
            score: 78,
            grade: 'C+',
            pillars: [
                { subject: 'Tekninen (40%)', A: 65, fullMark: 100 },
                { subject: 'Talous (30%)', A: 80, fullMark: 100 }, // Slight dip due to loan
                { subject: 'Energia (15%)', A: 95, fullMark: 100 }, // Huge boost
                { subject: 'Hallinto (15%)', A: 90, fullMark: 100 },
            ]
        })
        setLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto bg-slate-950 text-slate-100 min-h-screen">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Investment Grade™</h1>
                <p className="text-slate-400">Rakennuksen rahoituskelpoisuus ja arvon säilyminen.</p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => alert("Raportti ladattu.")}>
                <Download className="w-4 h-4 mr-2" /> Lataa Raportti (PDF)
            </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            {/* Grade Card */}
            <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <CardHeader>
                    <CardTitle className="text-slate-200">BIG-Luokitus</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className={`text-9xl font-black bg-clip-text text-transparent bg-gradient-to-br ${data.score > 75 ? 'from-emerald-400 to-cyan-500' : 'from-yellow-400 to-orange-500'}`}>
                        {data.grade}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">{data.score}/100</span>
                        {data.score > 75 && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Bank-Ready</Badge>}
                    </div>
                </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card className="bg-slate-900 border-slate-800 md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-slate-200">Analyysin Pylväät</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.pillars}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Nykyhetki" dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        {/* Metrics & Simulator */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" /> Korjausvelka (Repair Debt)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-400">Velka per m²</span>
                            <span className="text-white font-bold">{data.debtPerM2} €/m²</span>
                        </div>
                        <Progress value={Math.min(100, (data.debtPerM2 / 800) * 100)} className="h-2 bg-slate-800" indicatorClassName={data.debtPerM2 > 600 ? "bg-red-500" : "bg-orange-500"} />
                        <p className="text-xs text-slate-500 mt-2">
                            Teoreettinen korjausvelka perustuu KH-kortin elinkaarimalleihin. Arvo yli 500 €/m² on hälyttävä.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-200 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" /> "Mitä jos?" -simulaattori
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                        <h4 className="font-bold text-white mb-2">Investointi: Aurinkopaneelit (30k€)</h4>
                        <p className="text-sm text-slate-400 mb-4">Vaikutus: Energia +35p, Talous -5p.</p>
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            onClick={handleSimulate} 
                            disabled={loading}
                        >
                            {loading ? 'Lasketaan...' : 'Simuloi Vaikutus'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
