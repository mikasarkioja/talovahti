"use client";

import React, { useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Guardrail } from "@/components/finance/Guardrail";
import { CreditCard, TrendingUp, Calendar, User, ArrowRight } from "lucide-react";
import { approveInvoiceAction } from "@/app/actions/invoice-actions";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface InvoiceApprovalCardProps {
  id: string;
  vendorName: string;
  amount: number;
  dueDate: string;
  invoiceNumber: string;
  xpReward?: number;
  onSuccess?: (id: string) => void;
}

export function InvoiceApprovalCard({
  id,
  vendorName,
  amount,
  dueDate,
  invoiceNumber,
  xpReward = 50,
  onSuccess,
}: InvoiceApprovalCardProps) {
  const [isPending, startTransition] = useTransition();
  const { currentUser, housingCompany } = useStore();

  const handleApprove = () => {
    if (!currentUser || !housingCompany) {
      toast.error("Käyttäjätiedot puuttuvat. Kirjaudu sisään uudelleen.");
      return;
    }

    startTransition(async () => {
      const result = await approveInvoiceAction(
        id,
        amount,
        housingCompany.id,
        currentUser.id
      );

      if (result.success) {
        toast.success("Lasku hyväksytty maksuunpanoon", {
          description: `${vendorName} - ${amount.toLocaleString("fi-FI")} €`,
        });
        if (onSuccess) onSuccess(id);
      } else {
        toast.error("Hyväksyntä epäonnistui", {
          description: result.error,
        });
      }
    });
  };

  return (
    <Card className={cn(
      "group transition-all duration-300 hover:shadow-md border-slate-100 bg-slate-50/50 hover:bg-white",
      isPending && "opacity-50 grayscale pointer-events-none"
    )}>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Info Section */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
              <CreditCard size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-brand-navy leading-tight">{vendorName}</h4>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider py-0 px-1.5 h-4 bg-white">
                  LASKU
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  Eräpäivä: {new Date(dueDate).toLocaleDateString("fi-FI")}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1">
                  <User size={12} />
                  No: {invoiceNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
            <div className="text-right">
              <p className="text-lg font-black text-brand-navy leading-none">
                {amount.toLocaleString("fi-FI")} €
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-emerald-600 font-bold text-[10px]">
                <TrendingUp size={10} />
                +{xpReward} XP
              </div>
            </div>

            <Guardrail amount={amount} title={`${vendorName} (${invoiceNumber})`} onApprove={handleApprove}>
              <Button
                size="sm"
                disabled={isPending}
                className="bg-brand-navy hover:bg-slate-800 text-white font-bold px-4 rounded-lg shadow-sm h-10 min-w-[160px]"
              >
                {isPending ? "Käsitellään..." : "Hyväksy maksuunpano"}
                {!isPending && <ArrowRight size={14} className="ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </Guardrail>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
