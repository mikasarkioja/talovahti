"use client";
import { useStore } from "@/lib/store";
import Link from "next/link";
import {
  AlertCircle,
  Vote,
  CheckCircle2,
  ArrowRight,
  Zap,
  PenTool,
  Home,
  Activity,
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { BuildingModel } from "@/components/BuildingModel";
import { PulseHero } from "@/components/dashboard/PulseHero";
import {
  AnnualClock,
  AnnualClockData,
} from "@/components/dashboard/AnnualClock";
import { StrategyDashboard } from "@/components/dashboard/StrategyDashboard";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { TourOverlay } from "@/components/onboarding/TourOverlay";
import { FEATURES } from "@/config/features";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function BuildingSkeleton() {
  return (
    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-emerald animate-spin"></div>
        <p className="text-xs font-medium uppercase tracking-widest">
          Ladataan 3D-mallia...
        </p>
      </div>
    </div>
  );
}

interface HomeClientProps {
  annualClockData: AnnualClockData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
}

export function HomeClient({ annualClockData, initialData }: HomeClientProps) {
  const { currentUser, tickets, initiatives, hydrate } = useStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      hydrate(initialData);
    }
  }, [initialData, hydrate]);

  useEffect(() => {
    if (searchParams.get("error") === "feature_disabled") {
      toast.info("Ominaisuus ei ole vielä saatavilla", {
        description:
          "Tämä toiminnallisuus julkaistaan myöhemmässä päivityksessä.",
      });
      // Clean up URL
      router.replace("/");
    }
  }, [searchParams, router]);

  // Tour State
  const [tourStep, setTourStep] = useState(1);
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined);

  const isBoard =
    currentUser?.role === "BOARD" ||
    currentUser?.role === "MANAGER" ||
    currentUser?.role === "ADMIN";

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

  const urgentObservations = (useStore.getState().observations || []).filter(
    (o) =>
      o.status === "OPEN" && (o.severityGrade === 1 || o.severityGrade === 2),
  );

  const handleApartmentClick = (id: string) => {
    if (tourStep === 3) {
      setHighlightId(id);
      setTourStep(4);
    }
  };

  // --- RESIDENT MOBILE VIEW ---
  if (!isBoard && currentUser?.role === "RESIDENT") {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <header className="text-center pt-8">
          <h1 className="text-3xl font-bold text-brand-navy">Talovahti</h1>
          <p className="text-slate-500">
            Tervetuloa kotiin, {currentUser?.name?.split(" ")[0]}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <Link href="/maintenance/tickets" className="w-full">
            <Button
              size="lg"
              className="w-full h-24 text-lg bg-orange-600 hover:bg-orange-700 flex flex-col gap-1"
            >
              <PenTool size={24} />
              Ilmoita Vika
            </Button>
          </Link>

          <Link href="/settings/profile" className="w-full">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg flex flex-col gap-1 border-2"
            >
              <Home size={24} />
              Oma Koti
            </Button>
          </Link>

          <Link href="/dashboard/feed" className="w-full">
            <Button
              size="lg"
              variant="outline"
              className="w-full h-24 text-lg flex flex-col gap-1 border-2"
            >
              <Activity size={24} />
              Yhtiön Tilanne
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-navy px-2">
            Ajankohtaista
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <PulseHero companyId={currentUser?.housingCompanyId} />
          </div>
          <ActivityFeed limit={3} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {tourStep > 0 && (
        <TourOverlay
          step={tourStep}
          onNext={() => setTourStep((p) => p + 1)}
          onRoleSelect={() => {}}
          onComplete={() => {
            setTourStep(0);
            setHighlightId(undefined);
          }}
        />
      )}

      {/* 1. Header & Quick Status */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-navy tracking-tight">
            Hallinto-ohjaamo
          </h1>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            As Oy Esimerkkikatu 123 • {currentUser?.name}
          </p>
        </div>
        <PulseHero companyId={currentUser?.housingCompanyId} />
      </header>

      {/* 2. Signal Zone: KPI Dashboard */}
      <section>
        <DashboardKPIs />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Primary Workspace: 3D Twin & Strategy */}
        <div className="lg:col-span-2 space-y-8">
          {/* 3D Twin */}
          <section className="bg-white rounded-2xl shadow-soft overflow-hidden border border-surface-greige/20 relative group h-[450px]">
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-navy shadow-sm">
              Reaaliaikainen 3D-tilannekuva
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
              {FEATURES.STRATEGY_INSIGHTS ? (
                <StrategyDashboard />
              ) : (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 shadow-none">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Zap size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-700">
                        Strategianäkymä
                      </h3>
                      <p className="text-sm text-slate-500 mt-1 max-w-md">
                        Taloyhtiön strateginen tilannekuva ja PTS-työkalut
                        avautuvat Phase 2 -päivityksessä.
                      </p>
                    </div>
                    <Badge variant="outline" className="mt-2 text-slate-500">
                      Tulossa pian
                    </Badge>
                  </CardContent>
                </Card>
              )}
            </section>
          )}
        </div>

        {/* 4. Operations & Schedule */}
        <div className="space-y-6">
          {/* Action Center (Consolidated) */}
          <div className="bg-white rounded-xl border border-surface-greige/50 shadow-soft p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-brand-navy flex items-center gap-2">
                <AlertCircle size={20} className="text-brand-emerald" />
                Toimenpidejono
              </h3>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600"
              >
                {approvalQueue.length +
                  activePolls.length +
                  urgentObservations.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Urgent Items Only */}
              {isBoard &&
                approvalQueue.slice(0, 3).map((item) => (
                  <Link key={item.id} href="/admin/ops">
                    <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex gap-3 items-start cursor-pointer hover:bg-red-50 mb-2">
                      <CheckCircle2 size={16} className="text-red-500 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-red-700 uppercase">
                          Hyväksyntä
                        </div>
                        <div className="text-sm font-medium text-brand-navy">
                          {item.title}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}

              {/* Polls */}
              {activePolls.slice(0, 2).map((poll) => (
                <Link key={poll.id} href="/governance/voting">
                  <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg flex gap-3 items-start cursor-pointer hover:bg-purple-50 mb-2">
                    <Vote size={16} className="text-purple-600 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-purple-700 uppercase">
                        Äänestys
                      </div>
                      <div className="text-sm font-medium text-brand-navy">
                        {poll.title}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Empty State */}
              {approvalQueue.length === 0 &&
                activePolls.length === 0 &&
                urgentObservations.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Ei kriittisiä toimenpiteitä juuri nyt.
                  </div>
                )}
            </div>

            <Link href="/admin/ops">
              <Button
                variant="ghost"
                className="w-full mt-2 text-xs text-slate-500 hover:text-brand-navy"
              >
                Katso kaikki tehtävät <ArrowRight size={12} className="ml-2" />
              </Button>
            </Link>
          </div>

          {/* Annual Clock */}
          <AnnualClock
            data={annualClockData}
            isBoard={isBoard}
            housingCompanyId={currentUser?.housingCompanyId}
          />
        </div>
      </div>
    </div>
  );
}
