"use client";

import { useEffect, useState } from "react";
import { useStore, MockUser } from "@/lib/store";
import { getTestUsers } from "@/app/actions/dev-actions";
import { UserRole } from "@prisma/client";
import { switchUserAction } from "@/app/actions/auth-actions";
import { toast } from "sonner";
import {
  User as UserIcon,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

type SwitcheableUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  apartmentId: string | null;
  apartmentNumber?: string | null;
  housingCompanyId: string;
  housingCompanyName?: string;
  canApproveFinance: boolean;
};

export function UserSwitcher() {
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [users, setUsers] = useState<SwitcheableUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Only attempt to fetch in dev environment
    const isDev =
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost";

    if (isDev) {
      console.log("UserSwitcher: Fetching test users...");
      getTestUsers().then((res) => {
        if (res.success && res.users) {
          console.log(
            `UserSwitcher: Successfully fetched ${res.users.length} users`,
          );
          setUsers(res.users);
        } else {
          console.error("UserSwitcher: Failed to fetch test users", res.error);
        }
      });
    }
  }, []);

  if (!mounted) return null;

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
                  disabled={isSwitching}
                  onClick={async () => {
                    if (isSwitching) return;
                    setIsSwitching(true);
                    try {
                      // 1. Clear store to prevent flicker of old data
                      setCurrentUser(null);

                      // 2. Prepare user object for store (updated to match MockUser)
                      const newUser: MockUser = {
                        id: u.id,
                        name:
                          u.name || (u.email ? u.email.split("@")[0] : u.id),
                        email: u.email || "",
                        role: u.role as UserRole,
                        apartmentId: u.apartmentId,
                        apartmentNumber: u.apartmentNumber,
                        housingCompanyId: u.housingCompanyId,
                        housingCompanyName: u.housingCompanyName,
                        canApproveFinance: u.canApproveFinance,
                      };

                      // 3. Determine redirect path
                      const dashboardPath =
                        u.role === "BOARD_MEMBER" || u.role === "ADMIN"
                          ? "/"
                          : u.role === "EXPERT"
                            ? "/admin/ops/contractor"
                            : "/resident";

                      // 4. Update session cookie via server action
                      const res = await switchUserAction(u.email);
                      if (res.success) {
                        // 5. Update store and redirect (full reload ensures server context)
                        setCurrentUser(newUser);
                        window.location.href = dashboardPath;
                        setIsOpen(false);
                      } else {
                        toast.error(
                          res.error || "Käyttäjän vaihto epäonnistui.",
                        );
                        setIsSwitching(false);
                      }
                    } catch (err) {
                      console.error("UserSwitcher Error:", err);
                      toast.error("Kriittinen virhe.");
                      setIsSwitching(false);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl text-[10px] transition-all group ${
                    currentUser?.id === u.id
                      ? "bg-brand-navy text-white shadow-md ring-2 ring-brand-navy/20"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                  } ${isSwitching ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  <div className="flex items-center gap-2 mt-1 opacity-60 text-[9px] flex-wrap">
                    <UserIcon size={10} />
                    <span>
                      {u.apartmentNumber || u.apartmentId || "Keskushallinto"}
                    </span>
                    <span className="text-brand-emerald font-bold">
                      • {u.housingCompanyName}
                    </span>
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
