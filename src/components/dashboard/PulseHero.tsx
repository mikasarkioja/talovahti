'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CloudSnow, ThermometerSnowflake, Zap, Thermometer, RefreshCw } from 'lucide-react'
import { getLocalWeather, WeatherData } from '@/lib/services/weather'
import { StrategyEngine } from '@/lib/engines/StrategyEngine'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

import { getPulseData, refreshPulse, PulseData } from '@/app/actions/pulse'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

export function PulseHero({ companyId, initialData }: { companyId?: string, initialData?: PulseData }) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [pulseData, setPulseData] = useState<PulseData | undefined>(initialData)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(!initialData)

  const handleRefresh = () => {
    if (!companyId) return
    startTransition(async () => {
        await refreshPulse(companyId)
        const freshData = await getPulseData(companyId)
        setPulseData(freshData)
    })
  }

  useEffect(() => {
    async function load() {
      if (!initialData && companyId) {
        try {
            const [localWeather, serverPulse] = await Promise.all([
                getLocalWeather(),
                getPulseData(companyId)
            ])
            setWeather(localWeather)
            setPulseData(serverPulse)
        } finally {
            setLoading(false)
        }
      } else if (!weather) {
          const local = await getLocalWeather()
          setWeather(local)
          setLoading(false)
      }
    }
    load()
  }, [companyId, initialData, weather])

  const today = new Date()
  const weekNumber = getWeekNumber(today)
  const dateString = today.toLocaleDateString('fi-FI', { weekday: 'long', day: 'numeric', month: 'long' })

  const isColdFront = pulseData?.alerts.cold || false
  const isSnowAlert = pulseData?.alerts.snow || false
  const hasAlert = isColdFront || isSnowAlert

  const currentTemp = pulseData?.forecast.temp[0]?.value || weather?.temperature || 0
  const energyImpact = Math.round((21 - currentTemp) * StrategyEngine.KLOSS_CONSTANT)

  if (loading) return <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl" />

  // Compact View (Status Icon) if no alerts
  if (!hasAlert) {
    return (
      <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm w-fit">
        <div className="flex items-center gap-2">
          <Thermometer size={16} className="text-blue-500" />
          <span className="text-sm font-bold text-slate-700">{currentTemp}°C</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-emerald-500" />
          <span className="text-xs font-medium text-slate-600">Järjestelmät OK</span>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-6 w-6 text-slate-400 hover:text-slate-600"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw className={cn("w-3 h-3", isPending && "animate-spin")} />
        </Button>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white relative group">
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
            size="icon" 
            variant="ghost" 
            className="text-white/50 hover:text-white hover:bg-white/10 h-8 w-8"
            onClick={handleRefresh}
            disabled={isPending}
        >
            <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
        
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight capitalize">{dateString}</h2>
                <div className="text-slate-400 font-medium">Viikko {weekNumber}</div>
            </div>
            <div className="text-right">
                <div className="text-4xl font-bold">{currentTemp}°</div>
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
