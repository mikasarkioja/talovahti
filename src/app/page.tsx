"use client";
import { useStore } from "@/lib/store";
import Link from "next/link";
import {
  AlertCircle,
  Vote,
  CheckCircle2,
  ArrowRight,
  Droplets,
  Zap,
  CalendarClock,
  PenTool,
  MoreHorizontal,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { BuildingModel } from "@/components/BuildingModel";
import { PulseHero } from "@/components/dashboard/PulseHero";
import { AnnualClock } from "@/components/dashboard/AnnualClock";
import { StrategyDashboard } from "@/components/dashboard/StrategyDashboard";
import { TourOverlay } from "@/components/onboarding/TourOverlay";
import { useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function BuildingSkeleton() {
  return (
    <div className="w-full h-[400px] bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-300">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-slate-200"></div>
        <p>Ladataan 3D-mallia...</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { currentUser, tickets, initiatives } = useStore();

  // Tour State
  const [tourStep, setTourStep] = useState(1);
  const [tourRole, setTourRole] = useState<"RESIDENT" | "BOARD" | null>(null);
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined);

  const isBoard =
    currentUser?.role === "BOARD" || currentUser?.role === "MANAGER";

  // Action Center Logic
  const activePolls = initiatives.filter(
    (i) =>
      i.status === "VOTING" &&
      !i.votes.some((v) => v.userId === currentUser?.id),
  );
  const approvalQueue = tickets.filter(
    (t) =>
      (t.type === "RENOVATION" && t.status === "OPEN") ||
      (t.priority === "HIGH" && t.status === "OPEN"),
  );
  const myOpenTickets = tickets.filter(
    (t) => t.apartmentId === currentUser?.apartmentId && t.status !== "CLOSED",
  );

  const handleApartmentClick = (id: string) => {
    if (tourStep === 3) {
      setHighlightId(id);
      setTourStep(4);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {tourStep > 0 && (
        <TourOverlay
          step={tourStep}
          onNext={() => setTourStep((p) => p + 1)}
          onRoleSelect={setTourRole}
          onComplete={() => {
            setTourStep(0);
            setHighlightId(undefined);
          }}
        />
      )}

      {/* 1. Header & Pulse */}
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-navy tracking-tight">
              Hei, {currentUser?.name?.split(" ")[0]}
            </h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"></span>
              As Oy Esimerkkikatu 123 • {isBoard ? "Hallitus" : "Asukas"}
            </p>
          </div>
        </div>

        {/* Daily Context: Weather & Building Physics */}
        <PulseHero companyId={currentUser?.housingCompanyId} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Primary Zone: 3D Twin & Strategy */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3D Twin */}
          <section className="bg-white rounded-2xl shadow-soft overflow-hidden border border-surface-greige/20 relative group">
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-navy shadow-sm">
              Reaaliaikainen Tilannekuva
            </div>
            <Suspense fallback={<BuildingSkeleton />}>
              <BuildingModel
                onApartmentClick={handleApartmentClick}
                highlightId={highlightId}
              />
            </Suspense>
          </section>

          {/* Strategy Dashboard (Board Only) */}
          {isBoard && (
            <section>
              <StrategyDashboard />
            </section>
          )}

          {/* Quick Access Grid */}
          <section>
            <h2 className="text-lg font-bold text-brand-navy mb-4">
              Pikavalinnat
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/booking" className="group">
                <Card className="hover:border-brand-emerald/50 transition-all cursor-pointer h-full border-surface-greige/50 shadow-sm hover:shadow-md">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CalendarClock size={24} />
                    </div>
                    <span className="font-medium text-brand-navy text-sm">
                      Varaa Vuoro
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/maintenance/tickets" className="group">
                <Card className="hover:border-brand-emerald/50 transition-all cursor-pointer h-full border-surface-greige/50 shadow-sm hover:shadow-md">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PenTool size={24} />
                    </div>
                    <span className="font-medium text-brand-navy text-sm">
                      Ilmoita Vika
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/dashboard/feed" className="group">
                <Card className="hover:border-brand-emerald/50 transition-all cursor-pointer h-full border-surface-greige/50 shadow-sm hover:shadow-md">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap size={24} />
                    </div>
                    <span className="font-medium text-brand-navy text-sm">
                      Tapahtumat
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <button className="group">
                <Card className="hover:border-brand-emerald/50 transition-all cursor-pointer h-full border-surface-greige/50 border-dashed bg-slate-50/50 shadow-none">
                  <CardContent className="p-4 flex flex-col items-center justify-center gap-3 text-center h-full">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center group-hover:text-brand-navy transition-colors">
                      <MoreHorizontal size={24} />
                    </div>
                    <span className="font-medium text-slate-500 text-sm group-hover:text-brand-navy">
                      Lisää...
                    </span>
                  </CardContent>
                </Card>
              </button>
            </div>
          </section>
        </div>

        {/* 3. Right Sidebar: Action Center & Annual Clock */}
        <div className="space-y-6">
          {/* Annual Clock */}
          <AnnualClock />

          <div className="bg-white rounded-xl border border-surface-greige/50 shadow-soft p-5 sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-navy flex items-center gap-2">
                <AlertCircle size={20} className="text-brand-emerald" />
                Action Center
              </h3>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600"
              >
                {approvalQueue.length +
                  activePolls.length +
                  myOpenTickets.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* 1. Urgent Approvals (Board) */}
              {isBoard &&
                approvalQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex gap-3 items-start cursor-pointer hover:bg-red-50 transition-colors"
                  >
                    <div className="mt-0.5">
                      <CheckCircle2 size={16} className="text-red-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-red-700 uppercase mb-0.5">
                        Hyväksyntä Vaaditaan
                      </div>
                      <div className="text-sm font-medium text-brand-navy">
                        {item.title}
                      </div>
                    </div>
                  </div>
                ))}

              {/* 2. Active Polls */}
              {activePolls.map((poll) => (
                <div
                  key={poll.id}
                  className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg flex gap-3 items-start cursor-pointer hover:bg-purple-50 transition-colors"
                >
                  <div className="mt-0.5">
                    <Vote size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-purple-700 uppercase mb-0.5">
                      Äänestys Käynnissä
                    </div>
                    <div className="text-sm font-medium text-brand-navy mb-1">
                      {poll.title}
                    </div>
                    <div className="text-xs text-purple-600 flex items-center gap-1 font-semibold">
                      Osallistu <ArrowRight size={10} />
                    </div>
                  </div>
                </div>
              ))}

              {/* 3. My Issues */}
              {myOpenTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex gap-3 items-start"
                >
                  <div className="mt-0.5">
                    <PenTool size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-0.5">
                      Oma Ilmoitus
                    </div>
                    <div className="text-sm font-medium text-brand-navy">
                      {ticket.title}
                    </div>
                    <Badge
                      variant="outline"
                      className="mt-1 text-[10px] h-5 px-1.5 bg-white"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {approvalQueue.length === 0 &&
                activePolls.length === 0 &&
                myOpenTickets.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <CheckCircle2
                      size={32}
                      className="mx-auto mb-2 text-slate-200"
                    />
                    Ei vaadittuja toimenpiteitä.
                  </div>
                )}
            </div>
          </div>

          {/* Secondary Feed Summary */}
          <div className="bg-white rounded-xl border border-surface-greige/50 shadow-soft p-5 opacity-80 hover:opacity-100 transition-opacity">
            <h3 className="font-bold text-slate-700 text-sm mb-3">
              Viimeisimmät tapahtumat
            </h3>
            <ActivityFeed limit={3} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
