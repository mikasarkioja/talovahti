"use client";

import { useState, useTransition, useEffect } from "react";
import { useStore, MockUser } from "@/lib/store";
import { switchUserAction } from "@/app/actions/auth-actions";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import {
  ShieldCheck,
  Hammer,
  User as UserIcon,
  Loader2,
  ChevronUp,
  ChevronDown,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  {
    id: "resident",
    name: "Asukas (Pekka)",
    email: "pekka.asukas@example.com",
    role: "RESIDENT" as UserRole,
    icon: UserIcon,
    color: "bg-blue-500",
    description: "Tee vikailmoitus, seuraa kulutusta",
    redirect: "/resident",
  },
  {
    id: "board",
    name: "Hallituksen PJ (Liisa)",
    email: "liisa.puheenjohtaja@example.com",
    role: "BOARD_MEMBER" as UserRole,
    icon: ShieldCheck,
    color: "bg-emerald-500",
    description: "Päätösjono, Kanban, Omatase-XP",
    redirect: "/",
  },
  {
    id: "contractor",
    name: "Urakoitsija (Matti)",
    email: "matti.urakoitsija@example.com",
    role: "EXPERT" as UserRole,
    icon: Hammer,
    color: "bg-orange-500",
    description: "Tarjouspyynnöt, Magic Link",
    redirect: "/admin/ops/contractor",
  },
];

export function ScenarioSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDev =
    process.env.NODE_ENV === "development" ||
    (typeof window !== "undefined" && window.location.hostname === "localhost");

  if (!isDev) return null;

  const handleSwitch = (scenario: (typeof SCENARIOS)[0]) => {
    startTransition(async () => {
      try {
        // Clear store to prevent flicker
        setCurrentUser(null);

        const res = await switchUserAction(scenario.email);
        if (res.success) {
          toast.success(`Skenaario aktivoitu: ${scenario.name}`);
          window.location.href = scenario.redirect;
        } else {
          toast.error(res.error || "Vaihto epäonnistui");
        }
      } catch (err) {
        console.error("Scenario Switcher Error:", err);
        toast.error("Tekninen virhe");
      }
    });
  };

  const activeScenario =
    SCENARIOS.find((s) => s.role === currentUser?.role) || SCENARIOS[1];

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col items-end gap-3 group">
      {/* Active Badge (Summary) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-2xl hover:bg-slate-800 transition-all group-hover:scale-105"
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              activeScenario.color,
            )}
          />
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">
            {activeScenario.name}
          </span>
          <div className="h-3 w-px bg-white/10 mx-1" />
          <div className="flex items-center gap-1">
            <Trophy size={10} className="text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400">
              {currentUser?.boardXP || 450} XP
            </span>
          </div>
          <ChevronUp size={12} className="text-white/50 ml-1" />
        </button>
      )}

      {/* Selector Panel */}
      {isOpen && (
        <Card className="w-72 bg-slate-900/95 backdrop-blur-xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="p-4 pb-2 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-[10px] font-black uppercase text-white/50 tracking-widest flex items-center gap-2">
                <Zap size={12} className="text-brand-emerald" />
                Demo Skenaariot
              </CardTitle>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/30 hover:text-white transition-colors"
            >
              <ChevronDown size={16} />
            </button>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleSwitch(scenario)}
                disabled={isPending}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all relative overflow-hidden group/btn",
                  currentUser?.role === scenario.role
                    ? "bg-white/10 border border-white/10"
                    : "hover:bg-white/5",
                )}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div
                    className={cn(
                      "p-2 rounded-lg text-white shadow-lg",
                      scenario.color,
                    )}
                  >
                    <scenario.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-white uppercase tracking-tight">
                        {scenario.name}
                      </span>
                      {isPending && currentUser?.role !== scenario.role && (
                        <Loader2
                          size={12}
                          className="text-white/30 animate-spin"
                        />
                      )}
                    </div>
                    <p className="text-[9px] text-white/40 font-medium leading-tight">
                      {scenario.description}
                    </p>
                  </div>
                </div>
                {currentUser?.role === scenario.role && (
                  <div className="absolute inset-0 bg-brand-emerald/5 animate-pulse" />
                )}
              </button>
            ))}
          </CardContent>
          <div className="p-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[8px] border-white/20 text-white/60 font-bold uppercase tracking-widest"
              >
                Omatase: {currentUser?.omataseScore || 92}%
              </Badge>
            </div>
            <span className="text-[8px] font-bold text-white/20 tracking-tighter uppercase">
              Talovahti OS v4.0
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}
