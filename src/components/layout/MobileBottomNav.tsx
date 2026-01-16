'use client'

import { Box, Plus, Archive, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 h-16 flex items-center justify-around z-40 pb-safe">
      <NavItem icon={<Box size={24} />} label="3D Twin" active />
      <div className="relative -top-6">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700">
            <Plus size={28} className="text-white" />
        </Button>
      </div>
      <NavItem icon={<Archive size={24} />} label="Arkisto" />
      <NavItem icon={<Settings size={24} />} label="Asetukset" />
    </div>
  )
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
            {icon}
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    )
}
