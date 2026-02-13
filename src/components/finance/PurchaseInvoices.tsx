"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  fetchInvoicesAction,
  approveInvoiceAction,
} from "@/app/actions/invoice-actions";
import { useStore } from "@/lib/store";
import { Guardrail } from "./Guardrail";
import { toast } from "sonner";

interface Invoice {
  id: string;
  vendorName: string;
  amount: number;
  description?: string;
  dueDate: string | Date;
  pdfUrl?: string;
  invoiceNumber?: string;
}

export function PurchaseInvoices() {
  const { currentUser, housingCompany } = useStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const healthScore = housingCompany?.healthScore;

  useEffect(() => {
    async function load() {
      const res = await fetchInvoicesAction();
      if (res.success) {
        setInvoices(res.data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleApprove = (invoice: Invoice) => {
    if (!currentUser) {
      toast.error("Sinun on oltava kirjautunut sisään.");
      return;
    }

    startTransition(async () => {
      const res = await approveInvoiceAction(
        invoice.id,
        invoice.amount,
        currentUser.housingCompanyId,
        currentUser.id,
      );

      if (res.success) {
        toast.success(`Lasku hyväksytty maksuun: ${invoice.vendorName}`);
        setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));
      } else {
        toast.error(res.error || "Virhe hyväksynnässä");
      }
    });
  };

  if (loading)
    return (
      <Card className="border-brand-navy/10 bg-white shadow-soft">
        <CardContent className="flex justify-center p-12">
          <Loader2 className="animate-spin text-slate-300" />
        </CardContent>
      </Card>
    );

  return (
    <Card className="border-brand-navy/10 bg-white shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Hyväksyttävät ostolaskut
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400">
              Vahvista laskut Fennoa-järjestelmään maksua varten
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-100 font-bold"
          >
            {invoices.length} ODOTTAA
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle className="mx-auto text-emerald-400 mb-2" size={24} />
            <p className="text-xs text-slate-500 font-medium">
              Kaikki laskut on käsitelty.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-4 rounded-xl border border-slate-100 bg-white hover:border-brand-emerald/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">
                        {invoice.vendorName}
                      </span>
                      {invoice.amount > 5000 && (
                        <Badge
                          variant="destructive"
                          className="text-[8px] h-4 px-1 uppercase tracking-tighter"
                        >
                          Korkea arvo
                        </Badge>
                      )}
                    </div>
                    {invoice.description && (
                      <p className="text-xs text-slate-500 italic mb-2">
                        &quot;{invoice.description}&quot;
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                        <Clock size={12} className="text-amber-500" />
                        Eräpäivä:{" "}
                        {new Date(invoice.dueDate).toLocaleDateString("fi-FI")}
                      </div>
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase"
                        >
                          <FileText size={12} />
                          Näytä PDF
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50">
                    <div className="text-lg font-black text-brand-navy">
                      {invoice.amount.toLocaleString("fi-FI", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </div>

                    <Guardrail
                      amount={invoice.amount}
                      title={invoice.vendorName}
                      onApprove={() => handleApprove(invoice)}
                      healthScore={healthScore}
                    >
                      <Button
                        size="sm"
                        className="h-8 px-4 text-[10px] font-bold bg-brand-emerald hover:bg-brand-emerald/90 text-white shadow-sm"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 size={12} className="animate-spin mr-2" />
                        ) : (
                          <CheckCircle size={12} className="mr-2" />
                        )}
                        Hyväksy maksuunpano
                      </Button>
                    </Guardrail>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
