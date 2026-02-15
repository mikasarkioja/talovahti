// src/components/bid/BidForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Euro, FileText, Loader2, AlertTriangle } from "lucide-react";
import { submitBidAction } from "@/app/actions/bid-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BidFormProps {
  token: string;
}

export function BidForm({ token }: BidFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const res = await submitBidAction(formData);
      if (res.success) {
        toast.success("Tarjous lähetetty!");
        router.refresh(); // Refresh to show the success state in the server component
      } else {
        toast.error("Tarjouksen lähetys epäonnistui.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Jokin meni vikaan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="token" value={token} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="flex items-center gap-2">
            <Euro size={16} className="text-slate-400" />
            Urakkahinta (€, alv 0%)
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="Esim. 2500"
            required
            className="text-lg py-6"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            Arvioitu kesto
          </Label>
          <Input
            id="duration"
            name="duration"
            placeholder="Esim. 3 työpäivää"
            required
            className="text-lg py-6"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="flex items-center gap-2">
          <FileText size={16} className="text-slate-400" />
          Lisätiedot ja poikkeamat
        </Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Kuvaa lyhyesti työn sisältö tai mahdolliset poikkeamat urakkapyyntöön..."
          className="min-h-[120px]"
        />
      </div>

      <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
        <p className="text-xs text-amber-800">
          Painamalla &quot;Lähetä tarjous&quot;, jätät juridisesti sitovan
          tarjouksen yllä mainituilla ehdoilla. Tarjouksen on oltava voimassa
          vähintään 30 vrk. Noudatamme YSE 1998 vakioehtoja, ellei muuta ole
          mainittu.
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
        Lähetä tarjous
      </Button>
    </form>
  );
}
