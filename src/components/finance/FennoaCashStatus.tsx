"use client";

import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Receipt, PieChart, TrendingUp } from "lucide-react";

export function FennoaCashStatus() {
  const { finance } = useStore();
  const cash = finance.realTimeCash || 0;
  const unpaidCount = finance.unpaidInvoicesCount || 0;
  const budgetLeft = finance.budgetRemaining || 0;

  return (
    <Card className="border-brand-navy/10 bg-white shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Reaaliaikainen kassa (Fennoa)
        </CardTitle>
        <RefreshCw
          size={14}
          className="text-slate-400 cursor-pointer hover:text-brand-emerald transition-colors"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-black text-brand-navy">
              {cash.toLocaleString("fi-FI", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-[10px] font-medium text-slate-400">
              Päivitetty reaaliajassa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <Receipt size={12} className="text-brand-navy" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Hyväksyttävät laskut
              </p>
            </div>
            <p className="text-lg font-bold text-brand-navy">
              {unpaidCount} kpl
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <PieChart size={12} className="text-brand-navy" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Budjetti jäljellä
              </p>
            </div>
            <p className="text-lg font-bold text-brand-navy">
              {budgetLeft.toLocaleString("fi-FI", {
                style: "currency",
                currency: "EUR",
              })}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-600">
              Maksuvalmius: ERINOMAINEN
            </span>
          </div>
          <div className="text-[10px] font-bold text-brand-emerald uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">
            Fennoa API
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
