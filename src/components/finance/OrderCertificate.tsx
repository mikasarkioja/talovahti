"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, CreditCard, Loader2, CheckCircle, Download } from "lucide-react";
import { createCertificateCheckoutAction } from "@/app/actions/certificate-actions";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import Link from "next/link";

export function OrderCertificate() {
  const { currentUser } = useStore();
  const [isPending, startTransition] = useTransition();
  const [isOrdered, setIsOrdered] = useState(false);

  const handleOrder = () => {
    if (!currentUser) return;

    startTransition(async () => {
      const res = await createCertificateCheckoutAction(currentUser.id, currentUser.housingCompanyId);
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res.error || "Tilauksen luonti epäonnistui.");
      }
    });
  };

  const isResident = currentUser?.role === "RESIDENT";

  if (!isResident) return null;

  return (
    <Card className="border-brand-navy/10 bg-white shadow-soft overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-tight text-brand-navy flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Isännöitsijäntodistus
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Tilaa virallinen isännöitsijäntodistus reaaliaikaisella datalla.
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-brand-navy">45,00 €</span>
            <p className="text-[8px] text-slate-400 uppercase font-bold">Sis. ALV 25,5%</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 relative z-10">
        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                <CheckCircle size={12} className="text-emerald-500" />
                Välitön toimitus sähköisesti (PDF)
              </li>
              <li className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                <CheckCircle size={12} className="text-emerald-500" />
                Reaaliaikainen talous- ja remonttidata
              </li>
              <li className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
                <CheckCircle size={12} className="text-emerald-500" />
                Virallinen allekirjoitus ja varmenne
              </li>
            </ul>
          </div>

          <Button 
            onClick={handleOrder}
            disabled={isPending}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white font-black py-6 rounded-xl transition-all shadow-lg hover:shadow-blue-900/20"
          >
            {isPending ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <CreditCard className="mr-2" size={18} />
            )}
            Tilaa ja maksa (45€)
          </Button>
          
          <p className="text-[9px] text-center text-slate-400 italic">
            Maksun jälkeen todistus on heti ladattavissa ja se tallentuu omaan arkistoosi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
