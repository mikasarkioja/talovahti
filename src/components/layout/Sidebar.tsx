'use client'
import Link from 'next/link'
import { 
  Home, PenTool, Gavel, Wallet, Building2, ClipboardList, CheckSquare, 
  TrendingUp, Vote, FileText, Lock, LayoutDashboard, Database, HardHat, 
  LucideIcon, Activity, CalendarClock, Hammer, Users, ScanLine, Gauge, 
  Thermometer, LineChart, Megaphone
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { useStore } from '@/lib/store'

type MenuGroup = {
  title?: string
  items: {
    href: string
    label: string
    icon: LucideIcon
    locked?: boolean
    description?: string // Tooltip text
  }[]
}

export function Sidebar() {
  const pathname = usePathname()
  const { currentUser, subscription } = useStore()
  
  const isBoard = currentUser?.role === 'BOARD' || currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN'
  const plan = subscription?.plan || 'BASIC'
  const isBasic = plan === 'BASIC'

  const menuGroups: MenuGroup[] = [
    {
      items: [
        { href: '/', label: 'Etusivu (Digital Twin)', icon: Home },
      ]
    },
    {
      title: 'Asuminen',
      items: [
        { href: '/dashboard/feed', label: 'Työmaapäiväkirja', icon: Activity },
        { href: '/booking', label: 'Varaukset', icon: CalendarClock },
        { href: '/tasks', label: 'Talkoot & Tehtävät', icon: Hammer },
        { href: '/partners', label: 'Palvelutori', icon: Users },
        { href: '/scanner', label: 'AR-Skanneri (Beta)', icon: ScanLine },
      ]
    },
    {
      title: 'Kunnossapito',
      items: [
        { href: '/maintenance/tickets', label: 'Vikailmoitukset', icon: PenTool },
        { href: '/maintenance/history', label: 'PTS & Historia', icon: ClipboardList },
        isBoard 
          ? { href: '/admin/assessment', label: 'Kuntoarvio', icon: CheckSquare }
          : { href: '/maintenance/observe', label: 'Ilmoita havainto', icon: CheckSquare },
        { href: '/admin/sauna-safety', label: 'Saunavahti', icon: Thermometer },
      ]
    },
    {
      title: 'Talous',
      items: [
        { href: '/finance', label: 'Yleisnäkymä', icon: Wallet },
        { href: '/finance/meter-billing', label: 'Mittarit & Laskutus', icon: Gauge },
        { href: '/finance/scenarios', label: 'Skenaariot', icon: TrendingUp },
        // Board Only Items
        ...(isBoard ? [
          { href: '/finance/approvals', label: 'Laskujen hyväksyntä', icon: CheckSquare },
          { href: '/board/roi', label: 'Energia ROI', icon: LineChart },
          { href: '/finance/summary', label: 'Talousanalyysi', icon: LayoutDashboard }
        ] : [])
      ]
    },
    {
      title: 'Hallinto',
      items: [
        { href: '/governance/pipeline', label: 'Päätösputki', icon: Gavel },
        { href: '/admin/democracy', label: 'Demokratia', icon: Megaphone },
        { href: '/governance/voting', label: 'Äänestykset', icon: Vote },
        { 
            href: '/governance/projects', 
            label: 'Urakat (Kilpailutus)', 
            icon: HardHat, 
            locked: isBasic,
            description: 'Vaatii Pro- tai Premium-tilauksen.' 
        },
        { 
            href: '/admin/mml-sync', 
            label: 'MML Integraatio', 
            icon: Database, 
            locked: isBasic,
            description: 'Vaatii Pro-tilauksen.'
        },
        { href: '/documents/marketplace', label: 'Asiakirjat', icon: FileText }
      ]
    }
  ]

  const roleLabels: Record<string, string> = {
    RESIDENT: 'Asukas',
    BOARD: 'Hallitus',
    MANAGER: 'Isännöitsijä',
    ADMIN: 'Ylläpitäjä',
    SUPERVISOR: 'Valvoja'
  }

  return (
    <div className="w-64 h-screen bg-[#002f6c] text-white flex flex-col fixed left-0 top-0 shadow-xl z-50">
      <div className="p-6 h-full flex flex-col">
        {/* Logo Area */}
        <div className="flex items-center gap-3 mb-8 flex-shrink-0">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Building2 size={24} className="text-blue-200" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none">Taloyhtiö OS</div>
            <div className="text-xs text-blue-200 mt-1 opacity-80">As Oy Esimerkki</div>
          </div>
        </div>
        
        {/* User Card */}
        <div className="mb-6 px-3 py-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
             {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium truncate">{currentUser?.name}</div>
            <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider mt-0.5">
              {roleLabels[currentUser?.role || 'RESIDENT']}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              {group.title && (
                <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2 px-4">
                  {group.title}
                </h3>
              )}
              <nav className="space-y-1">
                {group.items.map(link => {
                  const Icon = link.icon
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                  const isLocked = link.locked
                  
                  return (
                    <Link 
                      key={link.href} 
                      href={isLocked ? '#' : link.href}
                      title={link.description}
                      className={clsx(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm relative",
                        isActive 
                          ? "bg-white text-[#002f6c] font-medium shadow-sm" 
                          : "text-blue-100 hover:bg-white/10 hover:text-white",
                        isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-blue-100"
                      )}
                      onClick={(e) => {
                          if (isLocked) {
                              e.preventDefault()
                              alert(link.description || "Tämä ominaisuus ei kuulu tilaukseesi.")
                          }
                      }}
                    >
                      <Icon size={18} className={clsx("transition-colors", isActive ? "text-[#002f6c]" : "text-blue-300 group-hover:text-white")} />
                      <span className="flex-1 truncate">{link.label}</span>
                      {isLocked && <Lock size={14} className="text-blue-400" />}
                    </Link>
                  )
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/10 flex-shrink-0">
          <div className="text-xs text-blue-300 text-center">
            &copy; 2026 Taloyhtiö OS
            <br/>v0.4.0 Beta
          </div>
        </div>
      </div>
    </div>
  )
}
