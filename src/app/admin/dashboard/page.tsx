import { prisma } from "@/lib/db";
import { DecisionQueueServer } from "@/components/dashboard/DecisionQueueServer";
import { HealthScoreDashboard } from "@/components/dashboard/HealthScoreDashboard";
import { BuildingModel } from "@/components/BuildingModel";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { GamificationDashboard } from "@/components/dashboard/GamificationDashboard";
import { RoleGate } from "@/components/auth/RoleGate";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRole } from "@prisma/client";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Achievement {
  name: string;
  description: string;
}

export const dynamic = "force-dynamic";

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl bg-slate-800/50" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-[400px] rounded-2xl bg-slate-800/50" />
          <Skeleton className="h-[300px] rounded-2xl bg-slate-800/50" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[350px] rounded-2xl bg-slate-800/50" />
          <Skeleton className="h-[250px] rounded-2xl bg-slate-800/50" />
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  // 1. Fetch Basic Info
  const company = await prisma.housingCompany.findFirst({
    include: { boardProfile: true }
  });

  if (!company) {
    return <div className="p-8 text-white">Taloyhtiötä ei löytynyt.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">Hallituksen Työpöytä</h1>
        <p className="text-slate-400 mt-1">Päätöksenteko ja yhtiön tilannekuva • {company.name}</p>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        {/* KPI Row */}
        <section className="mb-8">
          <DashboardKPIs />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Decision Queue - The Core */}
            <section className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <DecisionQueueServer housingCompanyId={company.id} />
            </section>

            {/* 3D Spatial Awareness */}
            <section className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative group h-[400px] shadow-2xl">
              <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/20 shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                DIGITAALINEN KAKSONEN (LIVE)
              </div>
              <BuildingModel />
            </section>
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            {/* Building Health */}
            <div className="space-y-4">
              <HealthScoreDashboard
                totalScore={company.healthScore || 0}
                technicalScore={company.healthScoreTechnical || 0}
                financialScore={company.healthScoreFinancial || 0}
                unpaidCount={0}
                maintenanceBacklog={0}
              />

              {/* Smart Guardrail for low Technical Score */}
              {(company.healthScoreTechnical || 100) < 85 && (
                <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-2xl space-y-3 animate-pulse">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase">
                    <AlertCircle size={18} />
                    Kuntoindeksi laskenut
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tekninen arvosana on laskenut avoimien havaintojen vuoksi. 
                    Kuntoindeksin palauttaminen vaatii asiantuntija-arvion.
                  </p>
                  <Link href="/board/marketplace">
                    <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs mt-2 uppercase tracking-widest h-10">
                      Palkkaa asiantuntija (+150 XP)
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Gamification / Board XP */}
            <RoleGate allowed={[UserRole.BOARD_MEMBER, UserRole.ADMIN]}>
              <GamificationDashboard
                totalXP={company.boardProfile?.totalXP}
                level={company.boardProfile?.level}
                achievements={(company.boardProfile?.achievements as unknown as Achievement[]) || []}
              />
            </RoleGate>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Vaikutusvalta</h3>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                &ldquo;Hallituksen nopea päätöksenteko nostaa yhtiön kuntoindeksiä ja parantaa lainaehtoja.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
