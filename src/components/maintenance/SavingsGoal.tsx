"use client";
import { PiggyBank, Target } from "lucide-react";

export function SavingsGoal({
  targetAmount,
  targetYear,
  currentSavings,
}: {
  targetAmount: number;
  targetYear: number;
  currentSavings: number;
}) {
  const currentYear = new Date().getFullYear();
  const monthsUntil = (targetYear - currentYear) * 12 - new Date().getMonth(); // Rough calc

  const remaining = Math.max(0, targetAmount - currentSavings);
  const monthlyNeed = monthsUntil > 0 ? remaining / monthsUntil : 0;

  const progress = Math.min(100, (currentSavings / targetAmount) * 100);

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Target size={120} />
      </div>

      <div className="relative z-10">
        <h3 className="text-blue-300 font-bold uppercase tracking-wider text-xs mb-1">
          Rahoitustavoite {targetYear}
        </h3>
        <div className="text-2xl font-bold mb-6">Putkiremonttivaraus</div>

        <div className="flex justify-between text-sm mb-2 opacity-80">
          <span>
            Kerätty: {(currentSavings || 0).toLocaleString("fi-FI")} €
          </span>
          <span>Tavoite: {(targetAmount || 0).toLocaleString("fi-FI")} €</span>
        </div>

        <div className="h-3 bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
          <PiggyBank className="text-emerald-400" size={24} />
          <div>
            <div className="text-xs text-blue-200 uppercase font-bold">
              Kuukausisäästötarve
            </div>
            <div className="text-lg font-bold">
              {Math.round(monthlyNeed).toLocaleString("fi-FI")} € / kk
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
