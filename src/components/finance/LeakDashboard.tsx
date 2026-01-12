"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Droplet, ShieldCheck, Activity } from 'lucide-react'

// Mock Data Types
type Alert = {
  id: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  message: string
  timestamp: string
}

const MOCK_ALERTS: Alert[] = [
  { id: '1', severity: 'HIGH', message: 'A 4: Putkirikko epäily (DEFENDER)', timestamp: '10 min sitten' },
  { id: '2', severity: 'LOW', message: 'A 12: Vuotava WC-istuin (SENTINEL)', timestamp: '2h sitten' },
]

export function LeakDashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [drynessScore, setDrynessScore] = useState(92)
  const [savedWater, setSavedWater] = useState(12500) // Liters

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'LOW': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-slate-100 text-slate-800'
    }
  }

  const handleSimulate = async () => {
    // Call simulation logic (mocked here for UI)
    alert('Simulaatio käynnistetty: Uusi vuoto generoitu.')
    setAlerts(prev => [{ id: 'new', severity: 'HIGH', message: 'Simulaatio: Äkillinen piikki (DEFENDER)', timestamp: 'Juuri nyt' }, ...prev])
    setDrynessScore(prev => Math.max(0, prev - 5))
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Health Card */}
      <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-white to-slate-50 border-emerald-100/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-700 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Kiinteistön Terveys
            </CardTitle>
            <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
              Live-seuranta
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold text-slate-900">{drynessScore}/100</div>
              <p className="text-sm text-slate-500 mt-1">Kuivuusindeksi (Dryness Score)</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">+{savedWater.toLocaleString()} L</div>
              <p className="text-xs text-slate-500">Säästetty vesi tänä vuonna</p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${drynessScore}%` }} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Aktiiviset Hälytykset
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleSimulate}>
                <Activity className="h-4 w-4 mr-2" />
                Simuloi Vuoto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length === 0 ? (
               <p className="text-sm text-slate-500 italic">Ei aktiivisia hälytyksiä. Kaikki kunnossa.</p>
            ) : (
                alerts.map(alert => (
                <div key={alert.id} className="flex items-start justify-between p-3 rounded-lg border bg-white shadow-sm">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                            </Badge>
                            <span className="text-xs text-slate-400">{alert.timestamp}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                        Tarkista
                    </Button>
                </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
