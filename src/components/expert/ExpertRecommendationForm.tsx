// src/components/expert/ExpertRecommendationForm.tsx
"use client";

import { useState } from "react";
import { Tender, TenderBid } from "@prisma/client";
import { updateExpertRecommendation } from "@/app/actions/tender-actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldCheck, Loader2 } from "lucide-react";

interface Props {
  tender: Tender & { bids: TenderBid[] };
  userId: string;
}

export function ExpertRecommendationForm({ tender, userId }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [vendorName, setVendorName] = useState(
    tender.expertRecommendationId || "",
  );
  const [reason, setReason] = useState(tender.expertRecommendationReason || "");

  const handleSubmit = async () => {
    if (!vendorName || !reason) {
      toast.error("Täytä molemmat kentät.");
      return;
    }

    setIsPending(true);
    try {
      const res = await updateExpertRecommendation({
        tenderId: tender.id,
        vendorName,
        reason,
        userId,
      });

      if (res.success) {
        toast.success("Suositus tallennettu.");
      } else {
        toast.error(res.error || "Tallennus epäonnistui.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Jokin meni vikaan.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-slate-900 text-white">
        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" /> Valvojan
          virallinen suositus
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
          Asiantuntijana tehtäväsi on suositella parasta vastinetta
          taloyhtiölle. Tämä suositus näkyy suoraan hallituksen
          tarjousvertailussa.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Suositeltava urakoitsija
            </label>
            <Select value={vendorName} onValueChange={setVendorName}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Valitse urakoitsija" />
              </SelectTrigger>
              <SelectContent>
                {tender.bids.map((bid) => (
                  <SelectItem key={bid.id} value={bid.companyName}>
                    {bid.companyName} ({bid.price.toLocaleString()} €)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Perustelu hallitukselle
            </label>
            <Textarea
              placeholder="Miksi suosittelet tätä urakoitsijaa? (esim. paras hinta-laatusuhde, aiemmat referenssit...)"
              className="min-h-[100px] rounded-xl resize-none"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full h-12 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Tallennetaan...
              </>
            ) : (
              "Tallenna suositus"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
