"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Droplets, Zap, Hammer } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PulseItem {
    id: string
    type: 'ALERT' | 'INFO' | 'SUCCESS'
    source: 'LEAK' | 'SAUNA' | 'CONSTRUCTION'
    message: string
    timestamp: string
}

export function CommunityPulse({ items }: { items: PulseItem[] }) {
  const getIcon = (source: string) => {
    switch (source) {
        case 'LEAK': return <Droplets className="w-4 h-4 text-blue-400" />
        case 'SAUNA': return <Zap className="w-4 h-4 text-yellow-400" />
        case 'CONSTRUCTION': return <Hammer className="w-4 h-4 text-orange-400" />
        default: return <Bell className="w-4 h-4 text-slate-400" />
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800 h-full">
        <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Community Pulse
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
                <div className="space-y-1 p-4 pt-0">
                    {items.length === 0 && <p className="text-slate-500 text-sm">Hiljaista. Ei uusia ilmoituksia.</p>}
                    {items.map(item => (
                        <div key={item.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800">
                            <div className="mt-1">{getIcon(item.source)}</div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-200">{item.message}</p>
                                <span className="text-xs text-slate-500">{item.timestamp}</span>
                            </div>
                            {item.type === 'ALERT' && <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </CardContent>
    </Card>
  )
}
