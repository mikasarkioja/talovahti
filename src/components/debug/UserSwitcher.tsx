"use client";

import { useEffect, useState } from "react";
import { useStore, MockUser } from "@/lib/store";
import { getTestUsers } from "@/app/actions/dev-actions";
import { UserRole } from "@prisma/client";
import {
  User as UserIcon,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type SwitcheableUser = Omit<MockUser, "name"> & {
  name: string | null;
  email?: string;
};

export function UserSwitcher() {
  const { currentUser, setCurrentUser } = useStore();
  const [users, setUsers] = useState<SwitcheableUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only attempt to fetch in dev environment
    const isDev =
      process.env.NODE_ENV === "development" ||
      (typeof window !== "undefined" &&
        window.location.hostname === "localhost");

    if (isDev) {
      getTestUsers().then((res) => {
        if (res.success && res.users) {
          setUsers(res.users);
        }
      });
    }
  }, []);

  // Don't render anything in production unless explicitly wanted
  if (typeof window === "undefined") return null;

  const isDev =
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost";

  if (!isDev) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[9999] print:hidden">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-brand-navy text-white px-3 py-2 rounded-full shadow-2xl hover:bg-slate-800 transition-all border border-white/10"
        >
          <div className="bg-brand-emerald w-2 h-2 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            Vaihda käyttäjää
          </span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {isOpen && (
          <div className="absolute bottom-14 right-0 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 w-72 animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
              <h3 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                <ShieldAlert size={12} className="text-brand-navy" />
                Dev: Testikäyttäjät
              </h3>
              <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                {users.length} kpl
              </span>
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {users.length === 0 && (
                <div className="text-[10px] text-slate-400 italic text-center py-4">
                  Ei testikäyttäjiä tietokannassa.
                </div>
              )}
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser({
                      id: u.id,
                      name: u.name || u.id,
                      role: u.role as UserRole,
                      apartmentId: u.apartmentId,
                      housingCompanyId: u.housingCompanyId,
                      shareCount: u.shareCount,
                      canApproveFinance: u.canApproveFinance,
                    });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-[10px] transition-all group ${
                    currentUser?.id === u.id
                      ? "bg-brand-navy text-white shadow-md ring-2 ring-brand-navy/20"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black truncate max-w-[140px]">
                      {u.name || (u.email ? u.email.split("@")[0] : u.id)}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                        currentUser?.id === u.id
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-500 shadow-sm"
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 opacity-60 text-[9px]">
                    <UserIcon size={10} />
                    <span>{u.apartmentId || "Keskushallinto"}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
