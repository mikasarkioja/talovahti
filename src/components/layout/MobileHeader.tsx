'use client'
import { Bell, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function MobileHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 h-[60px] bg-white/80 backdrop-blur-md border-b border-surface-greige z-40 flex items-center justify-between px-4 md:hidden">
      <div className="flex flex-col">
        <h1 className="text-sm font-bold text-brand-navy leading-none">Mannerheimintie 12</h1>
        <div className="flex items-center gap-1 mt-0.5">
            <ShieldCheck size={12} className="text-brand-emerald" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Kunto: A-Luokka</span>
        </div>
      </div>
      
      <Button variant="ghost" size="icon" className="relative text-brand-navy hover:bg-surface-lichen">
        <Bell size={20} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </Button>
    </header>
  )
}
