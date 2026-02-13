"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hammer, AlertCircle, TrendingUp } from "lucide-react";
import { escalateToExpert } from "@/app/actions/triage-actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";

import { InvoiceApprovalCard } from "./InvoiceApprovalCard";
import { useState } from "react";

export type DecisionItem = {
  id: string;
  type: "INVOICE" | "TRIAGE";
  title: string;
  vendor?: string;
  amount: number;
  dueDate?: string;
  invoiceNumber?: string;
  xpReward: number;
  description?: string;
};

interface DecisionQueueProps {
  items: DecisionItem[];
}

export function DecisionQueue({ items: initialItems }: DecisionQueueProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const { currentUser, housingCompany } = useStore();

  const handleOptimisticRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleTriageAction = (item: DecisionItem) => {
    if (!currentUser || !housingCompany) return;

    startTransition(async () => {
      const result = await escalateToExpert(item.id);

      if (result.success) {
        toast.success("Eskaloitu asiantuntijalle. Uusi havainto luotu.", {
          description: `Ansaitsit +${item.xpReward} XP:tä hallitusprofiiliisi.`,
        });
        handleOptimisticRemove(item.id);
      } else {
        toast.error("Toiminto epäonnistui", { description: result.error });
      }
    });
  };

  return (
    <Card className="shadow-soft border-surface-greige/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-brand-navy flex items-center gap-2">
          <AlertCircle size={20} className="text-brand-emerald" />
          Päätösjono
        </CardTitle>
        <Badge variant="secondary" className="bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20 font-bold">
          {items.length} ODOTTAA
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm italic">Päätösjono on tyhjä. Kaikki ajan tasalla!</p>
          </div>
        ) : (
          items.map((item) => {
            if (item.type === "INVOICE") {
              return (
                <InvoiceApprovalCard
                  key={item.id}
                  id={item.id}
                  vendorName={item.vendor || "Tuntematon toimittaja"}
                  amount={item.amount}
                  dueDate={item.dueDate || ""}
                  invoiceNumber={item.invoiceNumber || item.id}
                  xpReward={item.xpReward}
                  onSuccess={handleOptimisticRemove}
                />
              );
            }

            return (
              <div
                key={item.id}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                    <Hammer size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-brand-navy">{item.title}</p>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider py-0 px-1.5 h-4">
                        ESKALAATIO
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Asiantuntija-arvio tarvitaan
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="text-lg font-black text-brand-navy leading-none">
                      {item.amount.toLocaleString('fi-FI')} €
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-emerald-600 font-bold text-[10px]">
                      <TrendingUp size={10} />
                      +{item.xpReward} XP
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    disabled={isPending}
                    className="bg-brand-emerald hover:bg-emerald-600 text-white font-bold px-4 rounded-lg shadow-sm h-10"
                    onClick={() => handleTriageAction(item)}
                  >
                    {isPending ? "Käsitellään..." : 'Tilaa asiantuntija'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
