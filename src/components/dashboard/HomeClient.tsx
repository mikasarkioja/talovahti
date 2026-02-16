"use client";

import { useStore, MockInvoice, MockObservation } from "@/lib/store";
import Link from "next/link";
import {
  AlertCircle,
  PenTool,
  Home,
  Activity,
  Box,
} from "lucide-react";
import { DecisionQueue, DecisionItem } from "@/components/dashboard/DecisionQueue";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
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
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  currentUser?: any;
  housingCompany?: any;
  tickets?: any[];
  initiatives?: any[];
  invoices?: any[];
  budgetLines?: any[];
  fiscalConfig?: any;
  strategicGoals?: any[];
  finance?: any;
  renovations?: any[];
  observations?: any[];
  [key: string]: any;
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

          <section className="bg-gradient-to-br from-blue-600 to-brand-navy rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <Box size={24} className="text-brand-emerald" />
                </div>
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight">Digitaalinen Kaksonen</h2>
                  <p className="text-sm text-blue-100 opacity-80">Siirry tarkastelemaan yhtiön reaaliaikaista 3D-tilannekuvaa.</p>
                </div>
              </div>
              <Link href="/digital-twin">
                <Button className="bg-brand-emerald hover:bg-emerald-500 text-brand-navy font-black uppercase tracking-widest px-8 rounded-xl h-12 shadow-lg shadow-emerald-900/20 group-hover:scale-105 transition-all">
                  Avaa 3D-malli
                </Button>
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Box size={200} />
            </div>
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
