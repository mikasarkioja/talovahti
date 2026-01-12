"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Power, Thermometer, ShieldAlert } from 'lucide-react'

// Mock Data
const RESOURCES = [
  { id: '1', name: 'Sauna A (Lenkki)', status: 'HEATING', temp: 65, power: 6.0 },
  { id: '2', name: 'Sauna B (Tila)', status: 'STANDBY', temp: 22, power: 9.0 },
]

export default function SaunaSafetyPage() {
  const [resources, setResources] = useState(RESOURCES)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)

  const handleKillSwitch = () => {
    if (confirm('VAROITUS: Tämä katkaisee virrat kaikista taloyhtiön saunoista välittömästi. Haluatko jatkaa?')) {
        setIsEmergencyActive(true)
        setResources(prev => prev.map(r => ({ ...r, status: 'OFF' })))
        alert('HÄTÄSEIS AKTIVOITU. Kaikki laitteet sammutettu.')
    }
  }

  const getStatusColor = (s: string) => {
    switch(s) {
        case 'HEATING': return 'bg-orange-100 text-orange-800 border-orange-200'
        case 'COOLING': return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'OFF': return 'bg-red-100 text-red-800 border-red-200'
        default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Saunaturvallisuus</h1>
          <p className="text-slate-500">Reaaliaikainen valvonta ja hätähallinta.</p>
        </div>
        <Button 
            variant="destructive" 
            size="lg" 
            className="animate-pulse shadow-xl border-4 border-red-200"
            onClick={handleKillSwitch}
            disabled={isEmergencyActive}
        >
            <Power className="mr-2 h-6 w-6" />
            HÄTÄKATKAISU (KILL SWITCH)
        </Button>
      </div>

      {isEmergencyActive && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-start">
            <ShieldAlert className="h-6 w-6 text-red-600 mr-3" />
            <div>
                <h3 className="text-lg font-bold text-red-800">JÄRJESTELMÄ HÄTÄTILASSA</h3>
                <p className="text-red-700">Kaikki virransyöttö on estetty. Palauta normaalitila ottamalla yhteys huoltoon.</p>
            </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {resources.map(res => (
            <Card key={res.id} className="overflow-hidden">
                <CardHeader className="bg-slate-50 pb-4">
                    <div className="flex justify-between items-start">
                        <CardTitle>{res.name}</CardTitle>
                        <Badge variant="outline" className={getStatusColor(res.status)}>
                            {res.status}
                        </Badge>
                    </div>
                    <CardDescription>Teho: {res.power} kW</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Thermometer className="h-8 w-8 text-slate-400" />
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{res.temp}°C</div>
                                <div className="text-xs text-slate-500">Lämpötila</div>
                            </div>
                        </div>
                        
                        {/* Gauge Visual (Simple) */}
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${res.temp > 80 ? 'bg-red-500' : res.temp > 60 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(100, (res.temp / 100) * 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <div className="text-sm text-slate-500 flex justify-between">
                            <span>Ovikytkin:</span>
                            <span className="font-medium text-emerald-600">SULJETTU</span>
                        </div>
                        <div className="text-sm text-slate-500 flex justify-between mt-1">
                            <span>Viimeisin komento:</span>
                            <span className="font-mono">ON @ 17:15</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
