import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Euro, TrendingUp, Zap, AlertOctagon } from 'lucide-react'
import { energyMath } from '@/lib/energy-math'

// Mock ID
const HOUSING_COMPANY_ID = 'hc-default'

export default async function ROIDashboard() {
  // In a real app, this would be fetched from context or auth
  // We'll mock the data fetch here since we can't run the DB queries in this environment without a real DB.
  // const stats = await energyMath.calculateEstimatedSavings(HOUSING_COMPANY_ID)
  // const sectorHealth = await energyMath.calculateSectorHealth(HOUSING_COMPANY_ID)

  // Mock Data for Display
  const stats = {
    annualSavingsEur: 1250,
    annualSavingsKwh: 8333,
    leakCount: 12
  }

  const sectorHealth = {
    'North Wall': { health: 40, status: 'CRITICAL', leakCount: 6 },
    'Roof': { health: 80, status: 'EFFICIENT', leakCount: 2 },
    'Windows (West)': { health: 60, status: 'WARNING', leakCount: 4 }
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Energiaremontin ROI</h1>
          <p className="text-slate-500">Arvioidut säästöt perustuen asukkaiden tekemiin lämpökuvauksiin.</p>
        </div>
        <Badge variant="outline" className="text-lg py-1 px-3 border-emerald-500 text-emerald-600 bg-emerald-50">
            <TrendingUp className="w-4 h-4 mr-2" />
            Potentiaali: +{stats.annualSavingsEur} € / vuosi
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* KPI Cards */}
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-emerald-700 flex items-center gap-2">
                    <Euro className="w-5 h-5" /> Säästöpotentiaali
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-slate-900">{stats.annualSavingsEur.toLocaleString()} €</div>
                <p className="text-sm text-slate-500 mt-1">Vuosittainen säästö jos viat korjataan</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" /> Energia
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-slate-900">{stats.annualSavingsKwh.toLocaleString()} kWh</div>
                <p className="text-sm text-slate-500 mt-1">Hukkaan menevä energia vuodessa</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-red-500" /> Havainnot
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-slate-900">{stats.leakCount}</div>
                <p className="text-sm text-slate-500 mt-1">Raportoituja lämpövuotoja</p>
            </CardContent>
        </Card>
      </div>

      {/* Sector Breakdown */}
      <Card>
        <CardHeader>
            <CardTitle>Rakennuksen Osat (Aggregoitu Terveys)</CardTitle>
            <CardDescription>Perustuu joukkoistettuun dataan.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {Object.entries(sectorHealth).map(([sector, data]) => (
                    <div key={sector} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                            <div className="font-bold text-lg">{sector}</div>
                            <div className="text-xs text-slate-500">{data.leakCount} raporttia</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="font-mono font-bold text-xl">{data.health}/100</div>
                                <div className={`text-xs font-bold ${data.status === 'CRITICAL' ? 'text-red-600' : data.status === 'WARNING' ? 'text-orange-500' : 'text-emerald-600'}`}>
                                    {data.status}
                                </div>
                            </div>
                            {/* Health Bar */}
                            <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${data.health < 50 ? 'bg-red-500 animate-pulse' : data.health < 80 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                    style={{ width: `${data.health}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
