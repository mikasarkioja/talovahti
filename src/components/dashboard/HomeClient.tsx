"use client";

import { useStore, MockInvoice, MockObservation } from "@/lib/store";
import Link from "next/link";
import {
  AlertCircle,
  PenTool,
  Home,
  Activity,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DecisionQueue, DecisionItem } from "@/components/dashboard/DecisionQueue";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { BuildingModel } from "@/components/BuildingModel";
import { PulseHero } from "@/components/dashboard/PulseHero";
import { TicketTimeline } from "@/components/mobile/TicketTimeline";
import {
  AnnualClock,
  AnnualClockData,
} from "@/components/dashboard/AnnualClock";
import { StrategyDashboard } from "@/components/dashboard/StrategyDashboard";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { HealthScoreDashboard } from "@/components/dashboard/HealthScoreDashboard";
import { GamificationDashboard } from "@/components/dashboard/GamificationDashboard";
import { DynastyPanel } from "@/components/dashboard/DynastyPanel";
import { RoleGate } from "@/components/auth/RoleGate";
import { TourOverlay } from "@/components/onboarding/TourOverlay";
import { FEATURES } from "@/config/features";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
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

interface Achievement {
  name: string;
  description: string;
}

interface HomeInitialData {
  health?: {
    totalScore: number;
    technicalScore: number;
    financialScore: number;
    unpaidCount: number;
    maintenanceBacklog: number;
  };
  boardProfile?: {
    totalXP: number;
    level: number;
    achievements: Achievement[];
  };
  [key: string]: unknown;
}

interface HomeClientProps {
  annualClockData: AnnualClockData;
  initialData?: HomeInitialData;
}

export function HomeClient({ annualClockData, initialData }: HomeClientProps) {
  const { currentUser, tickets, observations, hydrate, housingCompany, invoices } =
    useStore();
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
      router.replace("/");
    }
  }, [searchParams, router]);

  const [tourStep, setTourStep] = useState(1);
  const [highlightId, setHighlightId] = useState<string | undefined>(undefined);
  const [is3DExpanded, setIs3DExpanded] = useState(false);

  const isBoard =
    currentUser?.role === "BOARD_MEMBER" ||
    currentUser?.role === "ADMIN";

  const urgentObservations = (observations as MockObservation[] || []).filter(
    (o) =>
      o.status === "OPEN" && (o.severityGrade === 1 || o.severityGrade === 2),
  );

  const pendingInvoices = (invoices as MockInvoice[] || [])
    .filter((inv) => inv.status === "PENDING" && inv.isExternal);

  const latestOpenTicket = (tickets || [])
    .filter((t) => t.createdById === currentUser?.id && t.status !== "CLOSED")
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })[0];

  const decisionItems: DecisionItem[] = [
    ...urgentObservations.map(o => ({
      id: o.id,
      type: "TRIAGE" as const,
      title: o.component,
      vendor: "Asiantuntija-arvio tarvitaan",
      amount: 450,
      xpReward: 150
    })),
    ...pendingInvoices.map((inv) => ({
      id: inv.id,
      type: "INVOICE" as const,
      title: `Ostolasku #${inv.invoiceNumber || inv.id}`,
      vendor: inv.vendorName,
      amount: inv.amount,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : "",
      invoiceNumber: inv.invoiceNumber,
      xpReward: 50
    }))
  ];

  const handleApartmentClick = (id: string) => {
    if (tourStep === 3) {
      setHighlightId(id);
      setTourStep(4);
    }
  };

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

          {latestOpenTicket && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-brand-navy">
                  Vikailmoituksen tila
                </h3>
                <Badge variant="outline" className="text-[10px]">
                  {latestOpenTicket.title}
                </Badge>
              </div>
              <TicketTimeline
                status={latestOpenTicket.status}
                category={latestOpenTicket.category}
                triageLevel={latestOpenTicket.triageLevel}
              />
            </div>
          )}

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

      <section>
        <DashboardKPIs />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {isBoard && (
            <section className="animate-in slide-in-from-left-4 duration-700 delay-150">
              <DecisionQueue items={decisionItems} />
            </section>
          )}

          <section className={cn(
            "bg-white rounded-2xl shadow-soft overflow-hidden border border-surface-greige/20 relative group transition-all duration-500",
            is3DExpanded ? "h-[700px] z-40 fixed inset-4 md:inset-8" : "h-[300px]"
          )}>
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-navy shadow-sm flex items-center gap-2">
              <Activity size={14} className="text-brand-emerald animate-pulse" />
              Reaaliaikainen 3D-tilannekuva
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white"
              onClick={() => setIs3DExpanded(!is3DExpanded)}
            >
              {is3DExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </Button>

            <Suspense fallback={<BuildingSkeleton />}>
              <BuildingModel
                onApartmentClick={handleApartmentClick}
                highlightId={highlightId}
              />
            </Suspense>
          </section>

          {isBoard && FEATURES.STRATEGY_INSIGHTS && (
            <section>
              <StrategyDashboard />
            </section>
          )}
        </div>

        <div className="space-y-6">
          {isBoard && (
            <div className="space-y-4">
              <HealthScoreDashboard
                totalScore={housingCompany?.healthScore || initialData?.health?.totalScore || 78}
                technicalScore={housingCompany?.healthScoreTechnical || initialData?.health?.technicalScore || 85}
                financialScore={housingCompany?.healthScoreFinancial || initialData?.health?.financialScore || 72}
                unpaidCount={housingCompany?.unpaidInvoicesCount || initialData?.health?.unpaidCount || 3}
                maintenanceBacklog={initialData?.health?.maintenanceBacklog || 12000}
              />
              
              {(housingCompany?.healthScoreTechnical || 100) < 85 && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3 animate-pulse">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                    <AlertCircle size={18} />
                    Kuntoindeksi laskenut
                  </div>
                  <p className="text-xs text-red-600 leading-relaxed">
                    Tekninen arvosana on laskenut avoimien havaintojen vuoksi. 
                    Suosittelemme asiantuntijan kutsumista tilanteen arvioimiseksi.
                  </p>
                  <Link href="/board/marketplace">
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs mt-2">
                      Palkkaa asiantuntija tästä (+150 XP)
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <RoleGate allowed={["BOARD_MEMBER", "ADMIN"]}>
            <GamificationDashboard
              totalXP={initialData?.boardProfile?.totalXP}
              level={initialData?.boardProfile?.level}
              achievements={initialData?.boardProfile?.achievements || []}
            />
          </RoleGate>

          <AnnualClock
            data={annualClockData}
            isBoard={isBoard}
            housingCompanyId={currentUser?.housingCompanyId}
          />
          
          {isBoard && <DynastyPanel />}
        </div>
      </div>
    </div>
  );
}
