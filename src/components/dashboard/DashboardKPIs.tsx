"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  CreditCard,
  PieChart,
} from "lucide-react";
import {
  useStore,
  MockObservation,
  MockTicket,
  MockRenovation,
} from "@/lib/store";
import { StrategyEngine } from "@/lib/engines/StrategyEngine";
import { cn } from "@/lib/utils";

interface KPIProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "emerald" | "amber" | "red" | "blue" | "slate";
}

function KPICard({
  label,
  value,
  subValue,
  icon,
  trend,
  color = "slate",
}: KPIProps) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    red: "text-red-600 bg-red-50 border-red-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
  };

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
            colorMap[color],
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-slate-900 truncate">
              {value}
            </h3>
            {trend === "up" && (
              <ArrowUpRight size={14} className="text-emerald-500" />
            )}
            {trend === "down" && (
              <ArrowDownRight size={14} className="text-red-500" />
            )}
          </div>
          {subValue && (
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {subValue}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardKPIs() {
  const { observations, finance, tickets, renovations, housingCompany } = useStore();

  // Calculate Backlog Score Memoized
  const backlogScore = useMemo(() => {
    return StrategyEngine.calculateMaintenanceBacklogScore(
      (observations as MockObservation[]) || [],
      (renovations as MockRenovation[]) || [],
      (tickets as MockTicket[]) || [],
    );
  }, [observations, renovations, tickets]);

  const backlogColor: KPIProps["color"] =
    backlogScore > 15 ? "red" : backlogScore > 8 ? "amber" : "emerald";

  // Financial Health Memoized
  const financialStatus = useMemo(() => {
    const financialGrade = finance?.score || "B";
    const financialColor: KPIProps["color"] =
      financialGrade === "A"
        ? "emerald"
        : financialGrade === "B"
          ? "blue"
          : "amber";
    
    // Kassan riittävyys (ennuste kuukausissa)
    const avgMonthlyExpenses = 12000; // Mock average
    const cashBalance = housingCompany?.realTimeCash || 45000;
    const liquidityMonths = (cashBalance / avgMonthlyExpenses).toFixed(1);

    return { financialGrade, financialColor, liquidityMonths };
  }, [finance?.score, housingCompany?.realTimeCash]);

  // Active Alerts / Tickets Memoized
  const issuesStats = useMemo(() => {
    const activeIssuesCount = (tickets as MockTicket[]).filter(
      (t) => t.status === "OPEN",
    ).length;
    const criticalCount = (observations as MockObservation[]).filter(
      (o) => o.severityGrade === 1,
    ).length;
    return { activeIssuesCount, criticalCount };
  }, [tickets, observations]);

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "ERINOMAINEN";
    if (score >= 60) return "HYVÄ";
    return "VAATII HUOMIOTA";
  };

  const healthScore = housingCompany?.healthScore || 78;

  // Hyväksyttävät laskut (€)
  const totalPayable = 2450.75; // Mock total from Fennoa

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Kuntoindeksi"
        value={healthScore.toString()}
        subValue={getScoreLabel(healthScore)}
        icon={<Trophy size={20} />}
        color={backlogColor}
      />

      <KPICard
        label="Kassan riittävyys"
        value={`${financialStatus.liquidityMonths} kk`}
        subValue={`Kassa: ${(housingCompany?.realTimeCash || 0).toLocaleString("fi-FI")} €`}
        icon={<PieChart size={20} />}
        color={Number(financialStatus.liquidityMonths) < 2 ? "red" : "emerald"}
      />

      <KPICard
        label="Hyväksyttävät laskut"
        value={`${totalPayable.toLocaleString("fi-FI")} €`}
        subValue="3 avointa laskua"
        icon={<CreditCard size={20} />}
        color={totalPayable > 5000 ? "amber" : "blue"}
      />

      <KPICard
        label="Avoimet havainnot"
        value={issuesStats.activeIssuesCount}
        subValue={`${issuesStats.criticalCount} kriittistä tapausta`}
        icon={<ShieldAlert size={20} />}
        color={issuesStats.criticalCount > 0 ? "red" : "slate"}
      />
    </div>
  );
}
