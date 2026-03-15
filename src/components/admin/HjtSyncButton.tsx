"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { triggerHjt2SyncAction } from "@/app/actions/mml-actions";
import { toast } from "sonner";
import { RefreshCw, CheckCircle2 } from "lucide-react";

interface HjtSyncButtonProps {
  housingCompanyId: string;
}

export function HjtSyncButton({ housingCompanyId }: HjtSyncButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [lastConfirmation, setLastConfirmation] = useState<string | null>(null);

  const handleSync = () => {
    startTransition(async () => {
      try {
        const res = await triggerHjt2SyncAction(housingCompanyId);
        if (res.success) {
          setLastConfirmation(res.confirmationId || null);
          toast.success("Osakasluettelon synkronointi aloitettu", {
            description: `HTJ-vahvistus: ${res.confirmationId}`,
          });
        } else {
          toast.error("Synkronointi epäonnistui", {
            description: res.error,
          });
        }
      } catch (err) {
        console.error("HJT Sync Error:", err);
        toast.error("Järjestelmävirhe", {
          description: "Yhteys HJT2-rajapintaan katkesi.",
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSync}
        disabled={isPending}
        className="bg-brand-navy hover:bg-slate-800 text-white gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Synkronoidaan..." : "Käynnistä HTJ-siirto"}
      </Button>

      {lastConfirmation && (
        <div className="flex items-center gap-2 text-xs text-brand-emerald bg-emerald-50 p-2 rounded-lg border border-emerald-100">
          <CheckCircle2 className="w-3 h-3" />
          <span>
            Viimeisin vahvistus: <strong>{lastConfirmation}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
