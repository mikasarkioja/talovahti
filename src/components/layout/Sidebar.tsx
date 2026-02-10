"use client";
import Link from "next/link";
import {
  Home,
  PenTool,
  Gavel,
  Wallet,
  Building2,
  ClipboardList,
  TrendingUp,
  Vote,
  ShieldCheck,
  Settings,
  Workflow,
  LucideIcon,
  Activity,
  CalendarClock,
  Hammer,
  Users,
  Database,
  Thermometer,
  LineChart,
  LayoutDashboard,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Lock,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useStore } from "@/lib/store";
import { FEATURES } from "@/config/features";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

type MenuGroup = {
  title?: string;
  items: {
    href: string;
    label: string;
    icon: LucideIcon;
    locked?: boolean;
    description?: string;
  }[];
};

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, subscription } = useStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isBoard =
    currentUser?.role === "BOARD" ||
    currentUser?.role === "MANAGER" ||
    currentUser?.role === "ADMIN";
  const plan = subscription?.plan || "BASIC";
  const isBasic = plan === "BASIC";

  const primaryItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/dashboard/feed", label: "Tapahtumat", icon: Activity },
    ...(isBoard
      ? [{ href: "/admin/ops", label: "Ops Board", icon: Workflow }]
      : []),
    { href: "/maintenance/tickets", label: "Vikailmoitukset", icon: PenTool },
  ];

  const secondaryGroups: MenuGroup[] = [
    {
      title: "Asuminen",
      items: [
        { href: "/booking", label: "Varaukset", icon: CalendarClock },
        { href: "/tasks", label: "Talkoot", icon: Hammer },
        ...(FEATURES.SERVICE_MARKETPLACE
          ? [{ href: "/partners", label: "Palvelutori", icon: Users }]
          : []),
      ],
    },
    {
      title: "Kunnossapito",
      items: [
        {
          href: "/maintenance/history",
          label: "PTS & Historia",
          icon: ClipboardList,
        },
        { href: "/admin/sauna-safety", label: "Saunavahti", icon: Thermometer },
      ],
    },
    {
      title: "Talous & Strategia",
      items: [
        { href: "/finance", label: "Talousnäkymä", icon: Wallet },
        { href: "/finance/scenarios", label: "Skenaariot", icon: TrendingUp },
        ...(isBoard
          ? [
              { href: "/board/roi", label: "Energia ROI", icon: LineChart },
              {
                href: "/finance/summary",
                label: "Talousanalyysi",
                icon: LayoutDashboard,
              },
            ]
          : []),
      ],
    },
    {
      title: "Hallinto",
      items: [
        { href: "/governance/pipeline", label: "Päätösputki", icon: Gavel },
        { href: "/governance/voting", label: "Äänestykset", icon: Vote },
      ],
    },
    ...(isBoard
      ? [
          {
            title: "Ylläpito & Asetukset",
            items: [
              {
                href: "/admin/privacy/audit",
                label: "GDPR Audit",
                icon: ShieldCheck,
              },
              {
                href: "/admin/mml-sync",
                label: "MML Integraatio",
                icon: Database,
                locked: isBasic,
              },
              {
                href: "/settings/profile",
                label: "Omat Asetukset",
                icon: Settings,
              },
            ],
          },
        ]
      : [
          {
            title: "Asetukset",
            items: [
              {
                href: "/settings/profile",
                label: "Omat Asetukset",
                icon: Settings,
              },
            ],
          },
        ]),
  ];

  const roleLabels: Record<string, string> = {
    RESIDENT: "Asukas",
    BOARD: "Hallitus",
    MANAGER: "Isännöitsijä",
    ADMIN: "Ylläpitäjä",
    SUPERVISOR: "Valvoja",
  };

  return (
    <div className="w-64 h-screen bg-brand-navy text-white flex flex-col fixed left-0 top-0 shadow-soft z-50 font-sans">
      <div className="p-6 h-full flex flex-col">
        {/* Logo Area */}
        <div className="flex items-center gap-3 mb-8 flex-shrink-0">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-md">
            <Building2 size={24} className="text-brand-emerald" />
          </div>
          <div>
            <div className="font-bold text-lg leading-none tracking-tight">
              Talovahti
            </div>
            <div className="text-xs text-blue-200 mt-1 opacity-80">
              As Oy Esimerkki
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="mb-6 px-3 py-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 flex-shrink-0 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full bg-brand-emerald flex items-center justify-center text-xs font-bold text-brand-navy shadow-sm">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-medium truncate">
              {currentUser?.name}
            </div>
            <div className="text-[10px] text-brand-emerald font-bold uppercase tracking-wider mt-0.5">
              {roleLabels[currentUser?.role || "RESIDENT"]}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 pr-2 -mr-2">
          <nav className="space-y-1 mb-6">
            {primaryItems.map((link) => {
              const NavIcon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                    isActive
                      ? "bg-white text-brand-navy shadow-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <NavIcon
                    size={20}
                    className={clsx(
                      "transition-colors",
                      isActive
                        ? "text-brand-emerald"
                        : "text-blue-300 group-hover:text-white",
                    )}
                  />
                  <span className="flex-1 truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* More Drawer */}
          <div className="space-y-1">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
            >
              <MoreHorizontal size={20} className="text-blue-300" />
              <span className="flex-1 text-left">Lisää</span>
              {isMoreOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {isMoreOpen && (
              <div className="pl-4 space-y-6 mt-2 animate-in slide-in-from-top-2 duration-200">
                {secondaryGroups.map((group, idx) => (
                  <div key={idx}>
                    {group.title && (
                      <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 px-4">
                        {group.title}
                      </h3>
                    )}
                    <nav className="space-y-1 border-l border-white/10 ml-2 pl-2">
                      {group.items.map((link) => {
                        const ItemIcon = link.icon;
                        const isActive = pathname === link.href;
                        const isLocked = link.locked;

                        return (
                          <Link
                            key={link.href}
                            href={isLocked ? "#" : link.href}
                            title={link.description}
                            className={clsx(
                              "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group text-sm",
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-blue-200 hover:text-white",
                              isLocked && "opacity-50 cursor-not-allowed",
                            )}
                            onClick={(e) => {
                              if (isLocked) {
                                e.preventDefault();
                                alert(
                                  link.description ||
                                    "Tämä ominaisuus ei kuulu tilaukseesi.",
                                );
                              }
                            }}
                          >
                            <ItemIcon
                              size={16}
                              className="text-blue-300 group-hover:text-white"
                            />
                            <span className="flex-1 truncate">
                              {link.label}
                            </span>
                            {isLocked && (
                              <Lock size={12} className="text-blue-400" />
                            )}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/10 flex-shrink-0">
          <div className="text-[10px] text-blue-300 text-center">
            &copy; 2026 Talovahti
            <span className="mx-1">•</span>
            v0.5.0
          </div>
        </div>
      </div>
    </div>
  );
}
