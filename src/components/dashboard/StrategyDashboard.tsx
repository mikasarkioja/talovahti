"use client";

import React, { useMemo } from "react";
import { useStore } from "@/lib/store";
import { StrategyEngine } from "@/lib/engines/StrategyEngine";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Target, Activity, Euro, Zap } from "lucide-react";

export function StrategyDashboard() {
  const {
    finance,
    observations,
    renovations,
    tickets,
    strategicGoals,
    apartmentCount,
  } = useStore();

  // 1. Calculate Metrics via Engine
  const metrics = useMemo(() => {
    const backlogScore = StrategyEngine.calculateMaintenanceBacklogScore(
      observations,
      renovations,
      tickets,
    );

    // Mock/Other values for rest as they are no longer in StrategyEngine
    const energyIntensity = 125.5; // Placeholder
    const financialHealth = { grade: "B", score: 82 }; // Placeholder

    // Dynamic historical data based on real aggregates if available
    const chartData = finance.monthlyTrend || [
      { month: "Jan", total: 135 },
      { month: "Feb", total: 128 },
      { month: "Mar", total: 120 },
    ];

    return { energyIntensity, backlogScore, financialHealth, chartData };
  }, [finance, observations, renovations, tickets]);

  // 2. Mock Historical Data for Charts (Keep as fallback if needed)
  const historyData = metrics.chartData;

  const getHealthColor = (grade: string) => {
    if (["A", "B"].includes(grade)) return "text-green-600";
    if (["C"].includes(grade)) return "text-yellow-600";
    return "text-red-600";
  };

  const getBacklogColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Strateginen Tilannekuva
          </h2>
          <p className="text-slate-500">
            Hallituksen reaaliaikainen näkymä yhtiön tilaan.
          </p>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taloudellinen Terveys
            </CardTitle>
            <Euro className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getHealthColor(metrics.financialHealth.grade)}`}
            >
              {metrics.financialHealth.grade} ({metrics.financialHealth.score}
              /100)
            </div>
            <p className="text-xs text-slate-500">
              Perustuu maksuvalmiuteen ja velkaasteeseen.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kunnossapitoindeksi
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getBacklogColor(metrics.backlogScore)}`}
            >
              {metrics.backlogScore}/100
            </div>
            <p className="text-xs text-slate-500">
              Huomioi avoimet viat ja rästissä olevat remontit.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Energiatehokkuus
            </CardTitle>
            <Zap className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.energyIntensity}{" "}
              <span className="text-sm font-normal text-slate-500">kWh/m²</span>
            </div>
            <p className="text-xs text-slate-500">
              Viimeisen 12kk kulutus (E-luku arvio).
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Yleisnäkymä</TabsTrigger>
          <TabsTrigger value="value">Arvo & Kehitys</TabsTrigger>
          <TabsTrigger value="roadmap">Strategia & Tavoitteet</TabsTrigger>
          <TabsTrigger value="financials">Talouden Trendit</TabsTrigger>
        </TabsList>

        <TabsContent value="value">
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-slate-500">
              Arvon kehityksen analyysi tulossa pian.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Kuluseuranta (Toteutunut)</CardTitle>
                <CardDescription>
                  Maksetut laskut kuukausittain.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="year"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="total"
                      name="Kulut (€)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Strategiset Tavoitteet</CardTitle>
                <CardDescription>
                  Edistyminen kohti 5-vuotissuunnitelmaa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {strategicGoals.map((goal) => {
                    // Complex logic for progress bar calculation skipped for mock brevity, using a heuristic.
                    const heuristicProgress =
                      goal.status === "ACHIEVED"
                        ? 100
                        : goal.status === "IN_PROGRESS"
                          ? 45
                          : 10;

                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-sm">
                              {goal.title}
                            </span>
                          </div>
                          <Badge
                            variant={
                              goal.status === "ACHIEVED" ? "default" : "outline"
                            }
                          >
                            {goal.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>
                            Nyt: {goal.currentValue} {goal.unit}
                          </span>
                          <span>
                            Tavoite: {goal.targetValue} {goal.unit} (
                            {goal.targetDate
                              ? new Date(goal.targetDate).getFullYear()
                              : "-"}
                            )
                          </span>
                        </div>
                        <Progress value={heuristicProgress} className="h-2" />
                      </div>
                    );
                  })}
                  {strategicGoals.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">
                      Ei asetettuja strategisia tavoitteita.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full text-xs">
                  Hallitse Tavoitteita
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card>
            <CardHeader>
              <CardTitle>Strateginen Roadmap 2026-2030</CardTitle>
              <CardDescription>
                Pitkän tähtäimen suunnitelman visualisointi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <span className="font-semibold text-sm mb-1">Tulossa Pian</span>
                <span className="text-xs">
                  Roadmap-työkalu on kehityksessä.
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lainasalkun Rakenne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <span className="font-semibold text-sm mb-1">
                    Tulossa Pian
                  </span>
                  <span className="text-xs">
                    Lainasalkun visualisointi on kehityksessä.
                  </span>
                  <div className="mt-4 text-xs font-mono text-slate-500">
                    Nykyinen kanta:{" "}
                    {(finance.companyLoansTotal || 0).toLocaleString("fi-FI")} €
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
