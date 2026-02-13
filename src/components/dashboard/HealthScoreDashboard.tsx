"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Info,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HealthScoreDashboardProps {
  totalScore: number;
  technicalScore: number;
  financialScore: number;
  unpaidCount: number;
  maintenanceBacklog: number;
}

export function HealthScoreDashboard({
  totalScore = 78,
  technicalScore = 85,
  financialScore = 72,
  unpaidCount = 3,
  maintenanceBacklog = 12000,
}: HealthScoreDashboardProps) {
  const businessValue = useMemo(() => {
    if (totalScore >= 80)
      return "Taloyhtiönne on parhaassa lainaluokassa (A). Tämä mahdollistaa jopa 0.5% matalamman marginaalin ja edullisemmat vakuutusmaksut.";
    if (totalScore >= 60)
      return "Hyvä kuntoindeksi. Pankit suhtautuvat yhtiöön positiivisesti, mutta tietyt huoltotoimenpiteet voisivat nostaa luokitusta.";
    return "Huolestuttava kuntoindeksi. Rahoituksen saanti voi vaikeutua ja vakuutusmaksut nousta. Suosittelemme välittömiä korjaavia toimenpiteitä.";
  }, [totalScore]);

  const showRecommendation = technicalScore < 50 || financialScore < 50;

  return (
    <Card className="border-brand-navy/10 bg-white shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity size={16} className="text-brand-emerald" />
              Kuntoindeksi (Health Score)
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400">
              Reaaliaikainen analyysi yhtiön teknisestä ja taloudellisesta
              tilasta
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-brand-emerald/10 text-brand-emerald px-3 py-1 rounded-full text-xl font-black cursor-help">
                  {totalScore}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[250px] bg-brand-navy text-white p-3 border-none">
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase border-b border-white/10 pb-1">
                    Liiketoiminta-arvo
                  </p>
                  <p className="text-[10px] leading-relaxed">{businessValue}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technical Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
            <span className="text-slate-500">Tekninen tila (Huoltovelka)</span>
            <span
              className={cn(
                technicalScore >= 80 ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {technicalScore} / 100
            </span>
          </div>
          <Progress
            value={technicalScore}
            className="h-2 bg-slate-100"
            indicatorClassName={cn(
              technicalScore >= 80 ? "bg-emerald-500" : "bg-amber-500",
            )}
          />
        </div>

        {/* Financial Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
            <span className="text-slate-500">Vastikevalmius (Kassa)</span>
            <span
              className={cn(
                financialScore >= 80 ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {financialScore} / 100
            </span>
          </div>
          <Progress
            value={financialScore}
            className="h-2 bg-slate-100"
            indicatorClassName={cn(
              financialScore >= 80 ? "bg-emerald-500" : "bg-blue-500",
            )}
          />
        </div>

        {/* Insights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
              Avoimet havainnot
            </p>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-sm font-bold text-brand-navy">
                {unpaidCount} kpl
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">
              Huoltovelka-arvio
            </p>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-rose-500" />
              <span className="text-sm font-bold text-brand-navy">
                {maintenanceBacklog.toLocaleString("fi-FI")} €
              </span>
            </div>
          </div>
        </div>

        {/* Smart Recommendation */}
        {showRecommendation && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-[10px] uppercase">
              <ShieldCheck size={14} />
              Suositeltu toimenpide
            </div>
            <p className="text-[11px] text-rose-900 leading-relaxed">
              Kuntoindeksin osatekijä on laskenut alle tavoitetason.
              Suosittelemme tilaamaan riippumattoman asiantuntijan
              markkinapaikalta tilanteen korjaamiseksi.
            </p>
            <Link href="/board/marketplace">
              <Button
                size="sm"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-8 text-xs"
              >
                <Briefcase size={12} className="mr-2" />
                Tilaa asiantuntija
                <ChevronRight size={14} className="ml-auto" />
              </Button>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] text-slate-400 justify-center">
          <Info size={12} />
          <span>
            Indeksi perustuu AsOYL:n suosituksiin ja reaaliaikaiseen dataan.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
