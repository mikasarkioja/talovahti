"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WaterLeakAlert } from '@/components/finance/WaterLeakAlert'
import { LeakDashboard } from '@/components/finance/LeakDashboard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Loader2, Download, Droplets, Zap } from 'lucide-react'

// Mock Data
const CONSUMPTION_HISTORY = [
  { month: 'Tammi', water: 12, electricity: 140 },
  { month: 'Helmi', water: 11, electricity: 135 },
  { month: 'Maalis', water: 13, electricity: 130 },
  { month: 'Huhti', water: 12, electricity: 110 },
  { month: 'Touko', water: 18, electricity: 90 }, // Leak spike
  { month: 'Kesä', water: 12, electricity: 85 },
]

const APARTMENT_SUMMARY = [
  { id: 'A 1', resident: 'Virtanen', balance: -15.50, status: 'DUE' },
  { id: 'A 2', resident: 'Korhonen', balance: 45.20, status: 'REFUND' },
  { id: 'A 3', resident: 'Mäkinen', balance: 0.00, status: 'OK' },
  { id: 'A 4', resident: 'Nieminen', balance: -120.00, status: 'DUE' }, // Big consumer
]

export default function MeterBillingPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateInvoices = async () => {
    setIsGenerating(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
    alert('Tasauslaskut luotu ja siirretty kirjanpitoon.')
  }

  // Calculate if sustainable (mock logic: < 13m3 water/mo avg is good)
  const avgWater = CONSUMPTION_HISTORY.reduce((acc, curr) => acc + curr.water, 0) / CONSUMPTION_HISTORY.length
  const isSustainable = avgWater < 12.5

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Kulutusseuranta & Laskutus</h1>
          <p className="text-slate-500">Hallitse mittarilukemia ja tasauslaskutusta.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Vie Raportti
            </Button>
            <Button onClick={handleGenerateInvoices} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Luo Tasauslaskut
            </Button>
        </div>
      </div>

      {/* NEW: Leak Detection Dashboard */}
      <LeakDashboard />

      <Tabs defaultValue="resident" className="w-full">
        <TabsList>
          <TabsTrigger value="resident">Asukasnäkymä</TabsTrigger>
          <TabsTrigger value="board">Hallituksen Näkymä</TabsTrigger>
        </TabsList>

        <TabsContent value="resident" className="space-y-4">
          <WaterLeakAlert currentConsumption={18} averageConsumption={12} />
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Vedenkulutus
                    {isSustainable && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            <Droplets className="w-3 h-3 mr-1" /> Eko-Asuja
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>Viimeiset 6 kuukautta</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CONSUMPTION_HISTORY}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="water" fill="#0ea5e9" name="Vesi (m³)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sähkönkulutus</CardTitle>
                <CardDescription>Viimeiset 6 kuukautta</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CONSUMPTION_HISTORY}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="electricity" fill="#f59e0b" name="Sähkö (kWh)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="board">
          <Card>
            <CardHeader>
              <CardTitle>Tasauslaskennan Tilanne</CardTitle>
              <CardDescription>Kausi: 1.1.2025 - 31.12.2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-4 font-medium">Huoneisto</th>
                      <th className="p-4 font-medium">Asukas</th>
                      <th className="p-4 font-medium text-right">Saldo</th>
                      <th className="p-4 font-medium">Toimenpide</th>
                    </tr>
                  </thead>
                  <tbody>
                    {APARTMENT_SUMMARY.map((apt) => (
                      <tr key={apt.id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-4 font-medium">{apt.id}</td>
                        <td className="p-4">{apt.resident}</td>
                        <td className={`p-4 text-right font-bold ${apt.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {apt.balance.toFixed(2)} €
                        </td>
                        <td className="p-4">
                            {apt.status === 'DUE' && <Badge variant="destructive">Laskutettava</Badge>}
                            {apt.status === 'REFUND' && <Badge variant="default" className="bg-emerald-600">Palautettava</Badge>}
                            {apt.status === 'OK' && <Badge variant="outline">Tasan</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
