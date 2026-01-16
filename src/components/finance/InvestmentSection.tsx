"use client";

import { useState } from "react";
import { Zap, Sun, TrendingUp } from "lucide-react";
import { clsx } from "clsx";
import { InvestmentROIChart } from "@/components/finance/InvestmentROIChart";
import { InvestmentScenario } from "@/lib/energy-logic";

export function InvestmentSection() {
  // Mock Scenarios (preserved from original page)
  const scenarios: InvestmentScenario[] = [
    {
      id: "scen-1",
      title: "Maalämpö (GSHP)",
      type: "GSHP",
      initialCost: 150000,
      annualSavings: 18000,
      lifespan: 25,
      energySavedKwh: 120000,
    },
    {
      id: "scen-2",
      title: "Aurinkopaneelit",
      type: "SOLAR",
      initialCost: 25000,
      annualSavings: 3500,
      lifespan: 25,
      energySavedKwh: 25000,
    },
  ];

  const [activeScenario, setActiveScenario] = useState<InvestmentScenario>(
    scenarios[0],
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Scenario Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {scenarios.map((scen) => (
            <button
              key={scen.id}
              onClick={() => setActiveScenario(scen)}
              className={clsx(
                "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeScenario.id === scen.id
                  ? "bg-white text-blue-600 border-t-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
              )}
            >
              {scen.type === "GSHP" ? <Zap size={16} /> : <Sun size={16} />}
              {scen.title}
            </button>
          ))}
        </div>
        <InvestmentROIChart scenario={activeScenario} />
      </div>

      {/* Vastike Impact - "What does this mean for me?" */}
      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
        <h3 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
          <TrendingUp size={18} />
          Vaikutus vastikkeeseen
        </h3>
        <p className="text-sm text-emerald-800 mb-4">
          Investoinnin maksamisen jälkeen (v. {2026 + 9}) hoitovastike putoaa
          arviolta:
        </p>
        <div className="text-3xl font-bold text-emerald-700">
          -0,85 € / m² / kk
        </div>
        <p className="text-xs text-emerald-600 mt-1 opacity-80">
          (Keskimääräinen säästö 60m² asunnolle: ~50€/kk)
        </p>
      </div>
    </div>
  );
}
