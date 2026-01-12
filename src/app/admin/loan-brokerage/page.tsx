"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle, Building2, TrendingUp, ShieldAlert, Loader2 } from 'lucide-react'

export default function LoanBrokeragePage() {
  const [businessId, setBusinessId] = useState('1234567-8')
  const [amount, setAmount] = useState('500000')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    try {
        const res = await fetch('/api/loan-brokerage/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ businessId, amount: Number(amount), purpose: 'Julkisivuremontti' })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setResult(data)
    } catch (e: any) {
        alert("Virhe: " + e.message)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Lainahakemus & Riskianalyysi</h1>
            <p className="text-slate-500">Integroitu taloyhtiön luottokelpoisuuden arviointi (Fivaldi API).</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            {/* Input Form */}
            <Card className="md:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Aloita Hakemus</CardTitle>
                    <CardDescription>Hae tiedot isännöintijärjestelmästä.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Y-tunnus</Label>
                        <Input value={businessId} onChange={e => setBusinessId(e.target.value)} placeholder="1234567-8" />
                    </div>
                    <div className="space-y-2">
                        <Label>Lainasumma (€)</Label>
                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleAnalyze} disabled={loading}>
                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analysoidaan...</> : 'Hae & Analysoi'}
                    </Button>
                </CardContent>
            </Card>

            {/* Results Area */}
            <div className="md:col-span-2 space-y-6">
                {!result && !loading && (
                    <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400">
                        <Building2 className="w-12 h-12 mb-2 opacity-20" />
                        <p>Syötä Y-tunnus nähdäksesi riskianalyysin.</p>
                    </div>
                )}

                {result && (
                    <>
                        {/* Traffic Light Status */}
                        <Card className={`border-l-8 ${
                            result.riskAnalysis.riskLevel === 'GREEN' ? 'border-l-emerald-500 bg-emerald-50/50' :
                            result.riskAnalysis.riskLevel === 'YELLOW' ? 'border-l-yellow-500 bg-yellow-50/50' : 'border-l-red-500 bg-red-50/50'
                        }`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {result.riskAnalysis.riskLevel === 'GREEN' ? <CheckCircle className="text-emerald-600" /> : <ShieldAlert className="text-amber-600" />}
                                        Riskiluokitus: {result.riskAnalysis.riskLevel}
                                    </CardTitle>
                                    <Badge variant="outline" className="bg-white">Hakemus ID: {result.applicationId.slice(-6)}</Badge>
                                </div>
                                <CardDescription>
                                    {result.company.name} ({result.company.businessId})
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Concentration Risk */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">Omistuskeskittymä</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold mb-2">
                                        {result.riskAnalysis.concentrationRisk.largestOwnerShare}%
                                    </div>
                                    <Progress value={result.riskAnalysis.concentrationRisk.largestOwnerShare} className="h-2" />
                                    <p className="text-xs text-slate-500 mt-2">Suurin yksittäinen omistaja. {'>'}20% on kohonnut riski.</p>
                                </CardContent>
                            </Card>

                            {/* Institutional Ownership */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-500">Sijoittajaomistus</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold mb-2">
                                        {result.riskAnalysis.institutionalOwnership.totalPercentage}%
                                    </div>
                                    <Progress value={result.riskAnalysis.institutionalOwnership.totalPercentage} className="h-2" />
                                    <p className="text-xs text-slate-500 mt-2">Instituutioiden osuus osakekannasta.</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Owners Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Suurimmat Omistajat</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {result.riskAnalysis.topOwners.map((owner: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm p-2 bg-slate-50 rounded">
                                            <span className="font-medium">{owner.name}</span>
                                            <span className="text-slate-600">{owner.percentage}% ({owner.shareCount} osaketta)</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    </div>
  )
}
