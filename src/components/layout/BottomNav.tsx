'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Wallet, Hammer, Menu, Plus } from 'lucide-react'
import { clsx } from 'clsx'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/', icon: Home, label: 'Koti' },
    { href: '/finance', icon: Wallet, label: 'Talous' },
    { href: '/maintenance/observe', icon: Plus, label: 'Ilmoita', isFab: true },
    { href: '/maintenance/tickets', icon: Hammer, label: 'Huolto' },
    { href: '/admin/marketplace', icon: Menu, label: 'Valikko' }, // Using Marketplace as menu/more for now
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-6 py-2 md:hidden z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-between items-end max-w-md mx-auto relative">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          if (link.isFab) {
            return (
              <div key={link.href} className="relative -top-8">
                <Link 
                  href={link.href}
                  className="bg-[#002f6c] text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-900 transition-all flex items-center justify-center active:scale-95"
                >
                  <Icon size={28} />
                </Link>
              </div>
            )
          }

          return (
            <Link 
              key={link.label}
              href={link.href}
              className={clsx(
                "flex flex-col items-center gap-1 min-w-[64px] pb-2 transition-colors",
                isActive ? "text-[#002f6c]" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
