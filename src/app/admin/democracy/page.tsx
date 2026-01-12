"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { FileDown, Send, MessageSquare } from 'lucide-react'

// Mock Aggregated Data
const POLL_RESULTS = [
    { name: 'Maalämpö', votes: 25, impact: 1.5, color: '#059669' },
    { name: 'Aurinkopaneelit', votes: 15, impact: 0.4, color: '#3b82f6' },
    { name: 'Ei muutosta', votes: 5, impact: 0.0, color: '#94a3b8' },
]

export default function DemocracyAdminPage() {
  const totalVotes = POLL_RESULTS.reduce((acc, curr) => acc + curr.votes, 0)
  const winner = POLL_RESULTS.reduce((prev, current) => (prev.votes > current.votes) ? prev : current)
  const winnerPercentage = Math.round((winner.votes / totalVotes) * 100)

  const handleExport = () => {
    alert("Tulokset ladattu PDF-muodossa pöytäkirjan liitteeksi.")
  }

  const handleNotify = () => {
    alert("Muistutusviesti lähetetty osakkaille, jotka eivät ole vielä äänestäneet.")
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Demokratia & Äänestykset</h1>
                <p className="text-slate-500">Hallituksen näkymä</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleNotify}>
                    <Send className="w-4 h-4 mr-2" /> Muistuta (24h)
                </Button>
                <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700">
                    <FileDown className="w-4 h-4 mr-2" /> Vie Pöytäkirjaan
                </Button>
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            {/* Chart */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Aktiivinen Äänestys: Energiaremontti</CardTitle>
                    <CardDescription>
                        {winnerPercentage}% osakkaista suosii vaihtoehtoa: <span className="font-bold text-slate-900">{winner.name}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={POLL_RESULTS} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                            <Tooltip 
                                formatter={(value: number, name: string, props: any) => [
                                    `${value} ääntä`, 
                                    `Vastikevaikutus: ${props.payload.impact} €/m²`
                                ] as [string, string]}
                            />
                            <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                                {POLL_RESULTS.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Recent Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" /> Avoin Palaute (Viimeiset 7pv)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { user: "A 4", text: "Maalämpö kuulostaa kalliilta, mutta pitkällä aikavälillä järkevä.", sentiment: "neutral" },
                            { user: "B 12", text: "Ehdottomasti aurinkopaneelit! Vastike ei saa nousta liikaa.", sentiment: "positive" },
                            { user: "C 22", text: "Milloin meluhaitat loppuvat? Poraus häiritsee etätöitä.", sentiment: "negative" }
                        ].map((fb, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg border text-sm">
                                <div className="font-bold text-slate-700 mb-1">{fb.user}</div>
                                <div className="text-slate-600">"{fb.text}"</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Participation Stats */}
            <Card>
                <CardHeader>
                    <CardTitle>Osallistumisaste</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[250px]">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * 0.72)} className="text-emerald-500" />
                         </svg>
                         <div className="absolute text-4xl font-bold text-slate-900">72%</div>
                    </div>
                    <p className="text-slate-500 mt-4 text-center">45 / 62 osakasta äänestänyt</p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
