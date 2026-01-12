"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Camera, Info, AlertTriangle, Volume2, Hammer } from 'lucide-react'

// Mock Updates
const MOCK_UPDATES = [
  {
    id: '1',
    type: 'ALERT',
    title: 'Vedenkatko (A-rappu)',
    content: 'Vedenjakelu katkaistaan huomenna 13.5. klo 09:00 - 12:00 putkistotöiden vuoksi.',
    timestamp: '1h sitten',
    project: 'Putkiremontti'
  },
  {
    id: '2',
    type: 'PHOTO',
    title: 'Purkutyöt etenevät',
    content: 'Kellarin purkutyöt ovat valmistuneet aikataulussa.',
    timestamp: '4h sitten',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400',
    project: 'Putkiremontti'
  },
  {
    id: '3',
    type: 'INFO',
    title: 'Meluvaroitus',
    content: 'Porraskäytävän hiontatyöt aiheuttavat kovaa ääntä ke-to klo 08-16.',
    timestamp: 'Eilen',
    project: 'Ikkunaremontti'
  }
]

// Mock Noise Schedule
const NOISE_SCHEDULE = [
    { hour: 8, level: 'HIGH' },
    { hour: 9, level: 'HIGH' },
    { hour: 10, level: 'MED' },
    { hour: 11, level: 'MED' },
    { hour: 12, level: 'LOW' }, // Lunch
    { hour: 13, level: 'HIGH' },
    { hour: 14, level: 'HIGH' },
    { hour: 15, level: 'MED' },
    { hour: 16, level: 'LOW' },
]

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ALERTS'>('ALL')

  return (
    <div className="space-y-6 p-4 pb-24 md:p-6 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Työmaapäiväkirja</h1>
            <Button variant="outline" size="sm" onClick={() => alert('Ilmoitukset päällä')}>
                <Bell className="w-4 h-4 mr-2" /> Tilaa
            </Button>
        </div>

        {/* Urgent Alerts */}
        {MOCK_UPDATES.filter(u => u.type === 'ALERT').map(alert => (
            <Card key={alert.id} className="bg-red-50 border-red-200 shadow-sm animate-pulse-slow">
                <CardContent className="flex gap-4 p-4 items-start">
                    <div className="bg-red-100 p-2 rounded-full text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-900">{alert.title}</h3>
                        <p className="text-sm text-red-800 mt-1">{alert.content}</p>
                    </div>
                </CardContent>
            </Card>
        ))}

        {/* Noise Meter */}
        <Card className="bg-slate-900 text-white border-none shadow-lg overflow-hidden">
             <CardHeader className="pb-2">
                 <CardTitle className="text-sm uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" /> Meluennuste (Tänään)
                 </CardTitle>
             </CardHeader>
             <CardContent>
                 <div className="flex justify-between items-end h-16 gap-1">
                    {NOISE_SCHEDULE.map((slot) => (
                        <div key={slot.hour} className="flex-1 flex flex-col justify-end gap-1 group relative">
                            <div 
                                className={`w-full rounded-t-sm transition-all duration-500 ${
                                    slot.level === 'HIGH' ? 'bg-red-500 h-full' : 
                                    slot.level === 'MED' ? 'bg-orange-400 h-2/3' : 'bg-emerald-500 h-1/3'
                                }`}
                            />
                            <span className="text-[10px] text-slate-500 text-center">{slot.hour}</span>
                            
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                {slot.level === 'HIGH' ? 'Kova Melu (Poraus)' : slot.level === 'MED' ? 'Keskitaso' : 'Hiljaista'}
                            </div>
                        </div>
                    ))}
                 </div>
                 <div className="text-xs text-slate-400 mt-2 flex gap-4 justify-center">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"/> Kova (85dB+)</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"/> Kohtalainen</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Hiljainen</span>
                 </div>
             </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-8 pl-4 border-l-2 border-slate-100 ml-4 relative">
             {MOCK_UPDATES.map((update) => (
                 <div key={update.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[25px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                        update.type === 'ALERT' ? 'bg-red-500 text-white' : 
                        update.type === 'PHOTO' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {update.type === 'ALERT' ? <AlertTriangle className="w-4 h-4" /> : 
                         update.type === 'PHOTO' ? <Camera className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{update.timestamp}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-700">{update.project}</span>
                        </div>
                        <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-slate-900">{update.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{update.content}</p>
                            {update.imageUrl && (
                                <div className="mt-3 rounded-md overflow-hidden h-40 bg-slate-100 relative">
                                    <img src={update.imageUrl} alt="Update" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                 </div>
             ))}
        </div>
    </div>
  )
}
