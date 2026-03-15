// src/components/dashboard/LegalHealthWidget.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  AlertCircle,
  RefreshCcw,
  Database,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { triggerHjt2SyncAction } from "@/app/actions/mml-actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LegalHealthProps {
  housingCompanyId: string;
  actorId: string;
  lastSyncDate?: string;
  isShareholderRegisterUpToDate: boolean;
  statutoryDocsCount: number;
}

export function LegalHealthWidget({
  housingCompanyId,
  actorId,
  lastSyncDate = new Date().toLocaleDateString("fi-FI"),
  isShareholderRegisterUpToDate,
  statutoryDocsCount,
}: LegalHealthProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate HJT2 Proof for Demo
    setTimeout(async () => {
      try {
        const res = await triggerHjt2SyncAction(housingCompanyId);
        if (res.success) {
          setIsConfirmed(true);
          toast.success("Osakasluettelon siirto HTJ-järjestelmään onnistui.", {
            description: "Vahvistettu Maanmittauslaitokselta (MML)",
          });
        } else {
          toast.error(res.error || "Synkronointi epäonnistui.");
        }
      } catch (error) {
        console.error("Sync error:", error);
        toast.error("Synkronointi epäonnistui.");
      } finally {
        setIsSyncing(false);
      }
    }, 1500);
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck
              size={16}
              className={cn(
                isConfirmed ? "text-emerald-500" : "text-emerald-600",
              )}
            />
            Lakisääteinen tila
          </CardTitle>
          <Badge
            variant={
              isShareholderRegisterUpToDate || isConfirmed
                ? "outline"
                : "destructive"
            }
            className={cn(
              "text-[10px] font-bold uppercase",
              isConfirmed &&
                "bg-emerald-50 text-emerald-700 border-emerald-200",
            )}
          >
            {isConfirmed
              ? "Vahvistettu MML"
              : isShareholderRegisterUpToDate
                ? "Vaatimustenmukainen"
                : "Huomiota vaaditaan"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <Database size={18} className="text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900">
              HJT2 Synkronointi
            </p>
            <p className="text-[10px] text-slate-500">
              Viimeisin tarkistus:{" "}
              <span className="font-mono">{lastSyncDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
            <FileText size={18} className="text-emerald-600" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900">Pysyväisarkisto</p>
            <p className="text-[10px] text-slate-500">
              <span className="font-bold text-emerald-700">
                {statutoryDocsCount}
              </span>{" "}
              lakisääteistä asiakirjaa arkistoitu.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant={isConfirmed ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full text-[10px] font-black uppercase gap-2 h-10 transition-all",
              isConfirmed &&
                "bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20",
            )}
            onClick={handleSync}
            disabled={isSyncing || isConfirmed}
          >
            {isConfirmed ? (
              <ShieldCheck size={14} />
            ) : (
              <RefreshCcw
                size={12}
                className={isSyncing ? "animate-spin" : ""}
              />
            )}
            {isSyncing
              ? "Synkronoidaan..."
              : isConfirmed
                ? "Vahvistettu Maanmittauslaitokselta"
                : "Simuloi HTJ-siirto"}
          </Button>
        </div>

        {!isShareholderRegisterUpToDate && (
          <div className="p-2 bg-red-50 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={14} className="text-red-600 shrink-0" />
            <p className="text-[9px] font-bold text-red-800">
              Osakasluettelossa on 2 vahvistamatonta muutosta.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
