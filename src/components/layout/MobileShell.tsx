"use client";
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileHeader } from "./MobileHeader";
import { UserSwitcher } from "../debug/UserSwitcher";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-lichen flex flex-col md:flex-row">
      <UserSwitcher />
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 z-50 print:hidden">
        <Sidebar />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header (Fixed) */}
        <div className="print:hidden">
          <MobileHeader />
        </div>

        {/* Content Area */}
        <main className="flex-1 w-full pt-[60px] pb-[100px] md:pt-0 md:pb-0 md:px-0 min-h-[100dvh] print:pt-0 print:pb-0">
          {children}
        </main>

        {/* Bottom Nav (Fixed) */}
        <div className="print:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
