'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CloudSnow, ThermometerSnowflake, Zap } from 'lucide-react'
import { getLocalWeather, WeatherData } from '@/lib/services/weather'
import { FmiService } from '@/lib/services/fmiService'
import { BuildingPhysicsEngine } from '@/lib/engines/BuildingPhysicsEngine'
import { StrategyEngine } from '@/lib/engines/StrategyEngine'
import { motion } from 'framer-motion'

export function PulseHero() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [realForecast, setRealForecast] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // Parallel fetch: Mock local + Real FMI
        const [data, fmiData] = await Promise.all([
            getLocalWeather(),
            FmiService.fetchForecast(60.1695, 24.9354) // Helsinki default for now
        ])
        
        setWeather(data)
        setRealForecast(fmiData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const today = new Date()
  const weekNumber = getWeekNumber(today)
  const dateString = today.toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'long' })

  // Logic
  const energyStatus = BuildingPhysicsEngine.calculateEnergyImpact(realForecast)
  const maintenanceStatus = BuildingPhysicsEngine.checkMaintenanceAlerts(realForecast)
  
  const isColdFront = energyStatus === 'CRITICAL'
  const isSnowAlert = maintenanceStatus === 'SNOW_REMOVAL'
  
  // E-impact (Mock formula: Delta T * Kloss)
  // Base indoor temp 21. Delta = 21 - (-15) = 36.
  const energyImpact = weather ? Math.round((21 - weather.temperature) * StrategyEngine.KLOSS_CONSTANT) : 0

  if (loading) return <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl" />

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardContent className="p-6 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
        
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight capitalize">{dateString}</h2>
                <div className="text-slate-400 font-medium">Viikko {weekNumber}</div>
            </div>
            <div className="text-right">
                <div className="text-4xl font-bold">{weather?.temperature}°</div>
                <div className="text-sm text-slate-400 capitalize">{weather?.condition}</div>
            </div>
        </div>

        <div className="space-y-3">
            {isColdFront && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg">
                    <ThermometerSnowflake className="text-blue-300 w-6 h-6 shrink-0" />
                    <div>
                        <div className="font-bold text-sm text-blue-100">Kylmä rintama</div>
                        <div className="text-xs text-blue-200/80">Energiankulutus +{energyImpact}%. LTV talviasetukseen.</div>
                    </div>
                </motion.div>
            )}

            {isSnowAlert && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 bg-white/10 border border-white/20 p-3 rounded-lg">
                    <CloudSnow className="text-white w-6 h-6 shrink-0" />
                    <div>
                        <div className="font-bold text-sm">Lumivaroitus</div>
                        <div className="text-xs text-slate-300">Auraus tilattu (Ennuste: {Math.max(...(weather?.forecast.map(f => f.snow) || []))}cm).</div>
                    </div>
                </motion.div>
            )}
            
            {!isColdFront && !isSnowAlert && (
                <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                    <Zap className="text-green-400 w-6 h-6" />
                    <div className="text-sm font-medium text-green-100">Järjestelmät optimaaliset.</div>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  )
}

function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
}
