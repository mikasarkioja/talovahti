'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, PanInfo } from 'framer-motion'
import { CalendarPlus, Pin, Archive, ChevronRight, Droplets, Info, Vote } from 'lucide-react'
import { useRenovationStore } from '@/lib/useRenovationStore'
import { toast } from 'sonner'

export type ActivityItem = {
  id: string
  title: string
  type: 'CRITICAL' | 'INFO' | 'GOVERNANCE'
  date: string
  location?: string
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', title: 'Vesikatko (Linjasaneeraus)', type: 'CRITICAL', date: 'Tänään 12:00', location: 'A-Rappu' },
  { id: '2', title: 'Yhtiökokouskutsu', type: 'GOVERNANCE', date: 'Huomenna 18:00' },
  { id: '3', title: 'Pihakeinu asennetaan', type: 'INFO', date: 'Ke 10:00', location: 'Piha' },
]

export function ActivityStream({ onItemTap }: { onItemTap: (item: ActivityItem) => void }) {
  const { addPin } = useRenovationStore()

  const handleSwipe = (event: any, info: PanInfo, item: ActivityItem) => {
    if (info.offset.x > 100) {
      // Swipe Right -> Calendar
      toast.success("Lisätty kalenteriin", { description: item.title })
    } else if (info.offset.x < -100) {
      // Swipe Left -> Pin
      if (item.location) {
        addPin({ id: `pin-${Date.now()}`, x: 0, y: 0, z: 0, label: item.title }) // Mock coords
        toast.info("Kiinnitetty 3D-näkymään", { description: item.location })
      } else {
        toast.error("Ei sijaintitietoa kiinnitystä varten")
      }
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold px-1">Tämä viikko</h3>
      
      {/* Horizontal Scroll (Today) */}
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x">
        {MOCK_ACTIVITIES.map(item => (
            <div key={item.id} className="snap-center shrink-0 w-[280px]">
                <SwipeableCard item={item} onSwipe={handleSwipe} onTap={() => onItemTap(item)} />
            </div>
        ))}
      </div>

      {/* Vertical Feed (Upcoming) - Simplified for brevity */}
    </div>
  )
}

function SwipeableCard({ item, onSwipe, onTap }: { item: ActivityItem, onSwipe: (e: any, i: PanInfo, item: ActivityItem) => void, onTap: () => void }) {
    const getColor = (type: string) => {
        switch(type) {
            case 'CRITICAL': return 'bg-red-50 border-red-200 text-red-900'
            case 'GOVERNANCE': return 'bg-green-50 border-green-200 text-green-900'
            default: return 'bg-blue-50 border-blue-200 text-blue-900'
        }
    }

    const getIcon = (type: string) => {
        switch(type) {
            case 'CRITICAL': return <Droplets size={18} className="text-red-600" />
            case 'GOVERNANCE': return <Vote size={18} className="text-green-600" />
            default: return <Info size={18} className="text-blue-600" />
        }
    }

    return (
        <motion.div 
            drag="x" 
            dragConstraints={{ left: 0, right: 0 }} 
            onDragEnd={(e, i) => onSwipe(e, i, item)}
            className="relative h-full"
            onClick={onTap}
        >
            {/* Background Actions */}
            <div className="absolute inset-0 flex justify-between items-center px-4 rounded-xl bg-slate-100">
                <CalendarPlus className="text-green-600" />
                <Pin className="text-blue-600" />
            </div>

            {/* Card Front */}
            <Card className={`relative h-full border ${getColor(item.type)} active:cursor-grabbing`}>
                <CardContent className="p-4 flex flex-col gap-2 h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                            {getIcon(item.type)}
                        </div>
                        <Badge variant="outline" className="bg-white/50">{item.date}</Badge>
                    </div>
                    <div>
                        <h4 className="font-bold leading-tight">{item.title}</h4>
                        {item.location && <div className="text-xs opacity-80 mt-1">{item.location}</div>}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
