"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthGauge } from "./HealthGauge";
import { TrendingUp, TrendingDown, AlertTriangle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";

interface FinanceScoreProps {
  data: {
    totalActual: number;
    totalBudgeted: number;
    utilization: number;
    score: string;
    monthlyTrend: { month: number; actual: number; budgeted: number }[];
  };
}

export function FinanceScore({ data }: FinanceScoreProps) {
  const { totalActual, totalBudgeted, utilization, score, monthlyTrend } = data;

  const isBreach = utilization > 100;
  const variance = totalActual - totalBudgeted;

  // Determine trend (compare last month to month before, or generic trend)
  // Assuming monthlyTrend is sorted 1-12.
  const lastMonth = monthlyTrend[monthlyTrend.length - 1];
  const prevMonth = monthlyTrend[monthlyTrend.length - 2];
  const isTrendingUp =
    lastMonth && prevMonth ? lastMonth.actual > prevMonth.actual : false;

  return (
    <Card className="w-full shadow-sm border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-slate-800">
            Taloudellinen Terveys
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Yhdistetty arvosana budjetin pidosta ja kassavirrasta.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* 1. The Strategic Gauge */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <HealthGauge score={score} utilization={utilization} />

            {/* Sparkline Overlay */}
            <div className="h-10 w-24 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke={["A", "B"].includes(score) ? "#10b981" : "#e11d48"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Metrics & Burn Rate */}
          <div className="flex-1 w-full space-y-5 pt-2">
            {/* KPI Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">
                  Toteuma (YTD)
                </p>
                <div className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  {totalActual.toLocaleString("fi-FI")} €
                  {isTrendingUp ? (
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">
                  Budjetti
                </p>
                <div className="text-xl md:text-2xl font-bold text-slate-700">
                  {totalBudgeted.toLocaleString("fi-FI")} €
                </div>
              </div>
            </div>

            {/* Burn Rate Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Budjetin käyttöaste
                </span>
                <span
                  className={cn(
                    "font-bold",
                    isBreach ? "text-rose-600" : "text-emerald-600",
                  )}
                >
                  {utilization.toFixed(1)}%
                </span>
              </div>

              <TooltipProvider>
                <Tooltip open={isBreach}>
                  <TooltipTrigger asChild>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          isBreach
                            ? "bg-rose-600 animate-pulse"
                            : "bg-brand-emerald",
                        )}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </TooltipTrigger>
                  {isBreach && (
                    <TooltipContent className="bg-rose-600 text-white border-rose-700">
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        Budjetin ylitys: {variance.toLocaleString("fi-FI")} €
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Insight Text */}
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100">
              <span className="font-semibold text-slate-900 mr-1">
                Analyysi:
              </span>
              {score === "A" && "Erinomainen budjettikuri. Kulut hallinnassa."}
              {score === "B" &&
                "Hyvä tilanne, pieniä poikkeamia sallitun rajoissa."}
              {score === "C" && "Huomio: Kulut lähestyvät budjetin ylärajaa."}
              {(score === "D" || score === "E") &&
                "Kriittinen: Merkittävä ylitys. Hallituksen toimenpiteitä vaaditaan."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
