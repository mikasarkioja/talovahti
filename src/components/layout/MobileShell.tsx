'use client'
import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { MobileHeader } from './MobileHeader'

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-lichen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header (Fixed) */}
        <MobileHeader />

        {/* Content Area */}
        <main className="flex-1 w-full pt-[60px] pb-[100px] md:pt-0 md:pb-0 md:px-0 min-h-[100dvh]">
          {children}
        </main>

        {/* Bottom Nav (Fixed) */}
        <BottomNav />
      </div>
    </div>
  )
}
