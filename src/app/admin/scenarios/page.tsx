"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Shield, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Mock Data for Graph
const DATA = [
    { year: 2026, scenarioA: 5000, scenarioB: 5000, scenarioC: 6000 },
    { year: 2027, scenarioA: 5500, scenarioB: 5500, scenarioC: 6000 },
    { year: 2028, scenarioA: 15000, scenarioB: 8000, scenarioC: 7500 }, // A: Big Break
    { year: 2029, scenarioA: 6000, scenarioB: 8000, scenarioC: 7500 },
    { year: 2030, scenarioA: 6500, scenarioB: 8000, scenarioC: 7500 },
    { year: 2031, scenarioA: 7000, scenarioB: 8000, scenarioC: 7500 },
    { year: 2035, scenarioA: 40000, scenarioB: 12000, scenarioC: 10000 }, // A: Another Break
]

export default function ScenariosPage() {
  const [activeTab, setActiveTab] = useState('summary')

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Strategiasimulaattori (20v)</h1>
            <p className="text-slate-500">Vertaa korjausvelan kehitystä ja vastikevaikutuksia.</p>
        </div>

        <Tabs defaultValue="compare" className="space-y-6">
            <TabsList>
                <TabsTrigger value="compare">Vertailu</TabsTrigger>
                <TabsTrigger value="details">Yksityiskohdat</TabsTrigger>
            </TabsList>

            <TabsContent value="compare" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" /> Skenaario A (Reaktiivinen)
                            </CardTitle>
                            <CardDescription>Korjataan vain kun hajoaa.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">125 000 €</div>
                            <div className="text-xs text-slate-500">Kumulatiivinen kulu (10v)</div>
                            <Badge variant="outline" className="mt-4 bg-red-50 text-red-700">+ Riski: Vesivahingot</Badge>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" /> Skenaario B (PTS)
                            </CardTitle>
                            <CardDescription>Tasainen ylläpito.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">95 000 €</div>
                            <div className="text-xs text-slate-500">Kumulatiivinen kulu (10v)</div>
                            <Badge variant="outline" className="mt-4 bg-blue-50 text-blue-700">Ennustettava</Badge>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-emerald-500" /> Skenaario C (Optimoitu)
                            </CardTitle>
                            <CardDescription>Niputetut hankkeet + Energia.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">82 000 €</div>
                            <div className="text-xs text-slate-500">Kumulatiivinen kulu (10v)</div>
                            <Badge className="mt-4 bg-emerald-600">Suositus</Badge>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Kumulatiiviset Kustannukset</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={DATA}>
                                <defs>
                                    <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="scenarioA" stroke="#ef4444" fillOpacity={1} fill="url(#colorA)" name="Reaktiivinen" />
                                <Area type="monotone" dataKey="scenarioB" stroke="#3b82f6" fillOpacity={1} fill="url(#colorB)" name="Proaktiivinen" />
                                <Area type="monotone" dataKey="scenarioC" stroke="#10b981" fillOpacity={1} fill="url(#colorC)" name="Optimoitu" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  )
}
