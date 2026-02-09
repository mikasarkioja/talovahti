"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  TrendingDown, 
  ShieldAlert, 
  Droplets, 
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useStore } from "@/lib/store";
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

function KPICard({ label, value, subValue, icon, trend, color = "slate" }: KPIProps) {
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
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", colorMap[color])}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold text-slate-900 truncate">{value}</h3>
            {trend === "up" && <ArrowUpRight size={14} className="text-emerald-500" />}
            {trend === "down" && <ArrowDownRight size={14} className="text-red-500" />}
          </div>
          {subValue && (
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{subValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardKPIs() {
  const { observations, finance, tickets } = useStore();
  
  // Calculate Backlog Score
  const backlogScore = StrategyEngine.calculateMaintenanceBacklogScore(observations || []);
  const backlogColor = backlogScore > 15 ? "red" : backlogScore > 8 ? "amber" : "emerald";
  
  // Financial Health (A-E)
  const financialGrade = finance?.score || "B";
  const financialColor = financialGrade === "A" ? "emerald" : financialGrade === "B" ? "blue" : "amber";

  // Active Alerts / Tickets
  const activeIssuesCount = tickets.filter(t => t.status === "OPEN").length;
  const criticalCount = observations.filter(o => o.severityGrade === 1).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard 
        label="Kunnossapito-indeksi"
        value={backlogScore.toFixed(1)}
        subValue={backlogScore > 10 ? "Vaatii huomiota" : "Hyvä taso"}
        icon={<AlertTriangle size={20} />}
        trend={backlogScore > 10 ? "up" : "neutral"}
        color={backlogColor}
      />
      
      <KPICard 
        label="Taloudellinen tila"
        value={`Arvosana: ${financialGrade}`}
        subValue={`${(finance?.collectionPercentage || 100).toFixed(1)}% vastikekertymä`}
        icon={<TrendingDown size={20} />}
        color={financialColor}
      />

      <KPICard 
        label="Avoimet havainnot"
        value={activeIssuesCount}
        subValue={`${criticalCount} kriittistä tapausta`}
        icon={<ShieldAlert size={20} />}
        color={criticalCount > 0 ? "red" : "slate"}
      />

      <KPICard 
        label="Yhtiölainan osuus"
        value={`${((finance?.companyLoansTotal || 0) / 1000).toFixed(0)}k €`}
        subValue="Lyhennykset ajan tasalla"
        icon={<Droplets size={20} />}
        color="blue"
      />
    </div>
  );
}
