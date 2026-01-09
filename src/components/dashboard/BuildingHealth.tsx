'use client'
import { Activity, Droplets, Zap, Thermometer } from 'lucide-react'

export function BuildingHealth() {
  // Mock telemetry data
  const stats = [
    { label: 'Lämpö', value: '21.5°C', icon: Thermometer, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Vesi', value: 'Normaali', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Sähkö', value: '12.4 kW', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  ]

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <Activity className="text-green-600" size={20} />
        Kiinteistön tila (Telemetry)
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {stats.map(stat => {
            const Icon = stat.icon
            return (
                <div key={stat.label} className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className={`p-2 rounded-full mb-2 ${stat.bg} ${stat.color}`}>
                        <Icon size={18} />
                    </div>
                    <div className="text-sm font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                </div>
            )
        })}
      </div>
    </div>
  )
}
