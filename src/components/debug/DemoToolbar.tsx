"use client";

import { useState, useTransition, useEffect } from "react";
import { useStore } from "@/lib/store";
import { switchUserAction } from "@/app/actions/auth-actions";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import {
  ShieldCheck,
  Hammer,
  User as UserIcon,
  Loader2,
  ChevronRight,
} from "lucide-react";

export function DemoToolbar() {
  const [isPending, startTransition] = useTransition();
  const currentUser = useStore((state) => state.currentUser);
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

  const handleSwitch = (email: string, role: UserRole) => {
    startTransition(async () => {
      try {
        const res = await switchUserAction(email);
        if (res.success) {
          toast.success(`Rooli vaihdettu: ${role}`);
          window.location.href =
            role === "BOARD_MEMBER" || role === "ADMIN" ? "/" : "/resident";
        } else {
          toast.error(res.error || "Vaihto epäonnistui");
        }
      } catch (err) {
        console.error("Demo Toolbar Error:", err);
        toast.error("Tekninen virhe");
      }
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[10000] bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 py-1.5 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2 py-1 bg-brand-emerald/20 rounded-md border border-brand-emerald/30">
          <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
          <span className="text-[10px] font-black text-brand-emerald uppercase tracking-tighter">
            Demo Mode
          </span>
        </div>

        <div className="h-4 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">
            Pikavalinnat:
          </span>

          <button
            onClick={() =>
              handleSwitch("matti.meikalainen@example.com", "RESIDENT")
            }
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              currentUser?.role === "RESIDENT"
                ? "bg-white text-slate-900 shadow-lg"
                : "text-white hover:bg-white/10"
            }`}
          >
            <UserIcon size={12} />
            Asukas
          </button>

          <button
            onClick={() =>
              handleSwitch("pekka.puheenjohtaja@example.com", "BOARD_MEMBER")
            }
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              currentUser?.role === "BOARD_MEMBER"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "text-white hover:bg-white/10"
            }`}
          >
            <ShieldCheck size={12} />
            Hallitus
          </button>

          <button
            onClick={() => handleSwitch("huolto@esimerkki.fi", "EXPERT")}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              currentUser?.role === "EXPERT"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "text-white hover:bg-white/10"
            }`}
          >
            <Hammer size={12} />
            Urakoitsija
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isPending && <Loader2 size={14} className="text-white animate-spin" />}
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <span className="font-bold text-white/60">
            {currentUser?.name || "Vieras"}
          </span>
          <ChevronRight size={10} />
          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest text-white/80">
            {currentUser?.role || "Ei roolia"}
          </span>
        </div>
      </div>
    </div>
  );
}
