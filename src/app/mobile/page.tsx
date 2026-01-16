'use client'

import { PulseHero } from '@/components/dashboard/PulseHero'
import { ActivityStream, ActivityItem } from '@/components/dashboard/ActivityStream'
import { SpatialDrawer } from '@/components/dashboard/SpatialDrawer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { StatusLight } from '@/components/dashboard/StatusLight'
import { useState } from 'react'

export default function MobileDashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<ActivityItem | null>(null)

  const handleItemTap = (item: ActivityItem) => {
    setActiveItem(item)
    setDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 relative overflow-hidden">
      <StatusLight />
      
      <main className="p-4 space-y-6 pt-16">
        <PulseHero />
        <ActivityStream onItemTap={handleItemTap} />
      </main>

      <MobileBottomNav />
      <SpatialDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        activeItem={activeItem} 
      />
    </div>
  )
}
