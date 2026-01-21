"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { getBuildingValueMetrics } from "@/app/actions/valuation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingDown, TrendingUp, Clock, Info, Building2 } from "lucide-react";

interface BuildingValueMetrics {
  marketValueEstimate: number;
  riskAdjustedValue: number;
  pki: number;
  ph: number;
  kai: number;
  rdr: number;
  totalRenovationDebt: number;
  renovationUrgency: Array<{
    name: string;
    age: number;
    remainingLife: number;
    status: string;
    potentialInvestment: number;
  }>;
  overallLifeCycleScore: number;
}

export function ValueIntelligenceCard() {
  const { currentUser } = useStore();
  const [metrics, setMetrics] = useState<BuildingValueMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      if (!currentUser?.housingCompanyId) {
        setLoading(false);
        return;
      }

      try {
        const areaAvgSqmPrice = 3500; // Mock, should come from external data
        const result = await getBuildingValueMetrics(
          currentUser.housingCompanyId,
          areaAvgSqmPrice,
        );

        if (result.success && result.data) {
          setMetrics(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch building value metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [currentUser?.housingCompanyId]);

  if (loading) {
    return (
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 font-semibold">
            Rakennuksen Arvointi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800 font-semibold">
            Rakennuksen Arvointi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Ei saatavilla olevaa dataa.</p>
        </CardContent>
      </Card>
    );
  }

  const {
    riskAdjustedValue,
    marketValueEstimate,
    pki,
    ph,
    kai,
    rdr,
    totalRenovationDebt,
  } = metrics;

  // Calculate equity (market value - debt)
  const equity = riskAdjustedValue;
  const equityPercentage = (equity / marketValueEstimate) * 100;
  const debtPercentage = (totalRenovationDebt / marketValueEstimate) * 100;

  // Calculate THC-20 (Total Housing Cost for 20 years)
  // This includes: renovation debt + estimated maintenance costs over 20 years
  // Simplified: renovation debt + (annual maintenance * 20)
  // Annual maintenance estimate: ~1-2% of building value
  const annualMaintenanceEstimate = marketValueEstimate * 0.015; // 1.5% per year
  const maintenanceOver20Years = annualMaintenanceEstimate * 20;
  const thc20 = totalRenovationDebt + maintenanceOver20Years;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fi-FI", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // PKI Badge: Red if > 40
  const pkiColor =
    pki > 40 ? "bg-red-500" : pki > 30 ? "bg-yellow-500" : "bg-emerald-500";
  const pkiLabel = pki > 40 ? "Kriittinen" : pki > 30 ? "Huomio" : "Hyvä";

  // KAI Badge: Green if > 8
  const kaiColor =
    kai > 8 ? "bg-emerald-500" : kai > 5 ? "bg-yellow-500" : "bg-slate-400";
  const kaiLabel = kai > 8 ? "Aktiivinen" : kai > 5 ? "Keskitaso" : "Matala";

  return (
    <Card className="border-indigo-100 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-800 font-semibold text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-indigo-600" />
          Rakennuksen Arvointi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hero Stat: Risk-Adjusted Building Value */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Riskikorjattu Arvo
            </span>
            {rdr > 15 && <TrendingDown className="h-5 w-5 text-red-500" />}
            {rdr <= 15 && <TrendingUp className="h-5 w-5 text-emerald-500" />}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(riskAdjustedValue)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Markkina-arvo: {formatCurrency(marketValueEstimate)}
          </p>
        </div>

        {/* Index Badges: PKI, KAI, PH */}
        <div className="grid grid-cols-3 gap-3">
          {/* PKI Badge */}
          <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Badge
              className={`${pkiColor} text-white border-0 mb-2 text-xs font-medium`}
            >
              {pkiLabel}
            </Badge>
            <span className="text-lg font-bold text-slate-900">{pki}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
              PKI
            </span>
          </div>

          {/* KAI Badge */}
          <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Badge
              className={`${kaiColor} text-white border-0 mb-2 text-xs font-medium`}
            >
              {kaiLabel}
            </Badge>
            <span className="text-lg font-bold text-slate-900">
              {kai.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">
              KAI
            </span>
          </div>

          {/* PH Badge with Clock */}
          <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
            <Clock className="h-4 w-4 text-indigo-600 mb-2" />
            <span className="text-lg font-bold text-slate-900">{ph}</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wide mt-1 text-center">
              {ph} vuotta LVIS
            </span>
          </div>
        </div>

        {/* Hidden Debt Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Piilotettu Velka
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {formatCurrency(totalRenovationDebt)}
            </span>
          </div>

          {/* Progress Bar: Equity (filled) + Debt (ghosted red) */}
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            {/* Equity (filled part) */}
            <div
              className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(equityPercentage, 100)}%` }}
            />
            {/* Debt (ghosted red part) */}
            <div
              className="absolute h-full bg-red-200 rounded-full opacity-60"
              style={{
                left: `${equityPercentage}%`,
                width: `${Math.min(debtPercentage, 100 - equityPercentage)}%`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Oma pääoma: {formatCurrency(equity)}</span>
            <span>Korjausvelka: {formatCurrency(totalRenovationDebt)}</span>
          </div>
        </div>

        {/* THC-20 Tooltip */}
        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              THC-20 (20 vuoden kokonaiskustannus)
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-indigo-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs text-slate-700">
                    <strong>THC-20</strong> laskee rakennuksen
                    kokonaiskustannukset seuraavien 20 vuoden aikana. Tämä
                    sisältää:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
                    <li>Korjausvelka: {formatCurrency(totalRenovationDebt)}</li>
                    <li>
                      Arvioitu huolto (20v):{" "}
                      {formatCurrency(maintenanceOver20Years)}
                    </li>
                  </ul>
                  <p className="mt-2 text-xs text-slate-500">
                    Perustuu RT-kortiston elinkaarilaskelmiin ja
                    kunnossapitostandardeihin.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-lg font-bold text-indigo-900">
            {formatCurrency(thc20)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
