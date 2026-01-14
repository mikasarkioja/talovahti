'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, Wallet, User, Plus, Droplets, CalendarClock, Megaphone, X } from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function BottomNav() {
  const pathname = usePathname()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const tabs = [
    { id: 'home', href: '/', icon: Home, label: 'Koti' },
    { id: 'tasks', href: '/tasks', icon: CheckSquare, label: 'Tehtävät' },
    { id: 'fab', isFab: true }, // Spacer for FAB
    { id: 'finance', href: '/finance', icon: Wallet, label: 'Talous' },
    { id: 'profile', href: '/profile', icon: User, label: 'Profiili' },
  ]

  const quickActions = [
    { label: 'Ilmoita Vuoto', icon: Droplets, color: 'bg-blue-100 text-blue-600', href: '/maintenance/observe' },
    { label: 'Varaa Vuoro', icon: CalendarClock, color: 'bg-emerald-100 text-emerald-600', href: '/booking' },
    { label: 'Uusi Aloite', icon: Megaphone, color: 'bg-purple-100 text-purple-600', href: '/governance/pipeline' },
  ]

  return (
    <>
      {/* Quick Actions Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 pb-24 md:hidden shadow-2xl"
            >
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
                <h3 className="text-lg font-bold text-brand-navy mb-6 text-center">Pikatoiminnot</h3>
                <div className="grid grid-cols-3 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Link href={action.href} key={action.label} onClick={() => setIsDrawerOpen(false)}>
                                <div className="flex flex-col items-center gap-3">
                                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-1 transition-transform active:scale-95", action.color)}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-xs font-medium text-slate-600 text-center leading-tight">{action.label}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] md:hidden">
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className={clsx(
                "w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-colors",
                isDrawerOpen ? "bg-slate-800" : "bg-brand-navy"
            )}
        >
            <motion.div
                animate={{ rotate: isDrawerOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
            >
                {isDrawerOpen ? <Plus size={28} /> : <Plus size={28} />}
            </motion.div>
        </motion.button>
      </div>

      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-surface-greige h-[80px] pb-[env(safe-area-inset-bottom)] z-40 md:hidden">
        <div className="grid grid-cols-5 h-full items-center">
            {tabs.map((tab) => {
                if (tab.isFab) return <div key="fab" /> // Spacer

                const Icon = tab.icon
                const isActive = pathname === tab.href
                
                return (
                    <Link 
                        key={tab.id} 
                        href={tab.href || '#'} 
                        className="flex flex-col items-center justify-center gap-1 h-full relative group"
                    >
                        {isActive && (
                            <motion.div 
                                layoutId="nav-pill"
                                className="absolute top-0 w-12 h-1 rounded-b-full bg-brand-emerald"
                            />
                        )}
                        <Icon 
                            size={24} 
                            className={clsx(
                                "transition-colors",
                                isActive ? "text-brand-navy" : "text-slate-400 group-hover:text-slate-600"
                            )} 
                        />
                        <span className={clsx(
                            "text-[10px] font-medium transition-colors",
                            isActive ? "text-brand-navy" : "text-slate-400"
                        )}>
                            {tab.label}
                        </span>
                    </Link>
                )
            })}
        </div>
      </nav>
    </>
  )
}
