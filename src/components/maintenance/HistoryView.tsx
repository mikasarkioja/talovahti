"use client";
import { MockRenovation, useStore } from "@/lib/store";
import { MaintenanceTimeline } from "@/components/maintenance/MaintenanceTimeline";
import { SavingsGoal } from "@/components/maintenance/SavingsGoal";
import {
  History,
  Wrench,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { calculatePriorityScore, ProjectPriority } from "@/lib/pts-logic";
import { VastikeImpact } from "@/components/maintenance/VastikeImpact";
import { estimateFutureCost } from "@/lib/maintenance-logic";
import { clsx } from "clsx";
import Link from "next/link";
import { useEffect } from "react";

export function HistoryView({
  initialRenovations,
}: {
  initialRenovations: MockRenovation[];
}) {
  const { renovations, finance, currentUser, observations, hydrate } =
    useStore();

  // Hydrate store on mount if initial data provided
  useEffect(() => {
    if (initialRenovations && initialRenovations.length > 0) {
      hydrate({ renovations: initialRenovations });
    }
  }, [initialRenovations, hydrate]);

  // Use store data (which is now hydrated)
  const completed = renovations.filter((r) => r.status === "COMPLETED");
  const planned = renovations.filter((r) => r.status === "PLANNED");

  // Prioritize Planned Items
  const currentYear = new Date().getFullYear();
  const prioritizedPlan = planned
    .map((item) => {
      // Mock linking assessments: In real app, db query. Here, we check if any obs matches component name
      // Simple mock logic for demo
      const relatedAssessments = observations
        .filter((o) => o.component === item.component && o.assessment)
        .map((o) => o.assessment!);

      return {
        ...item,
        priority: calculatePriorityScore(item, relatedAssessments),
      };
    })
    .sort((a, b) => b.priority.score - a.priority.score); // High score first

  const nextBigProject = planned.sort((a, b) => b.cost - a.cost)[0];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <History className="text-[#002f6c]" />
          Historia & PTS
        </h1>
        <p className="text-slate-500 mt-1">
          Kiinteistön elinkaaren hallinta ja pitkän tähtäimen
          kunnossapitosuunnitelma (PTS).
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: History Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* PTS Section Enhanced */}
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Calendar className="text-blue-600" size={20} />
              Kunnossapitosuunnitelma (PTS 5v)
            </h3>

            <div className="space-y-4">
              {prioritizedPlan.map((item) => {
                const yearsUntil =
                  (item.plannedYear || currentYear) - currentYear;
                const estimatedCost = estimateFutureCost(item.cost, yearsUntil);
                const isFunded = finance.reserveFund >= estimatedCost;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded text-sm mb-1">
                            {item.plannedYear}
                          </div>
                          <span
                            className={clsx(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                              item.priority.color,
                            )}
                          >
                            {item.priority.label}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">
                            {item.component}
                          </h4>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900">
                          ~
                          {(
                            Math.round(estimatedCost / 1000) * 1000
                          ).toLocaleString()}{" "}
                          €
                        </div>
                        {!isFunded && (
                          <div className="text-xs text-red-600 font-medium flex items-center justify-end gap-1 mt-1">
                            <AlertTriangle size={12} />
                            Rahoitusvaje:{" "}
                            {(
                              estimatedCost - finance.reserveFund
                            ).toLocaleString()}{" "}
                            €
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Simulator Section */}
                    <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/30 pt-3">
                      <VastikeImpact
                        cost={estimatedCost}
                        shares={1000} // Mock total shares
                        userShares={currentUser?.shareCount}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <MaintenanceTimeline history={completed} />
        </div>

        {/* Right: Future Plan & Finances */}
        <div className="space-y-8">
          {nextBigProject && (
            <SavingsGoal
              targetAmount={nextBigProject.cost}
              targetYear={nextBigProject.plannedYear || 2030}
              currentSavings={finance.reserveFund}
            />
          )}

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Wrench size={18} className="text-slate-500" />
              Huoltokirja
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Kaikki pienkorjaukset ja huoltotoimenpiteet kirjataan
              digitaaliseen huoltokirjaan.
            </p>
            <Link
              href="/maintenance/tickets?filter=closed"
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              Selaa huoltokirjaa <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
