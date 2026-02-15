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
import { syncShareholdersAction } from "@/app/actions/mml-actions";
import { toast } from "sonner";

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

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncShareholdersAction(housingCompanyId, actorId);
      if (res.success) {
        toast.success("Osakasluettelo synkronoitu HJT2:n kanssa.");
      } else {
        toast.error(res.error || "Synkronointi epäonnistui.");
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Synkronointi epäonnistui.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            Lakisääteinen tila
          </CardTitle>
          <Badge
            variant={isShareholderRegisterUpToDate ? "outline" : "destructive"}
            className="text-[10px] font-bold uppercase"
          >
            {isShareholderRegisterUpToDate
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
            variant="outline"
            size="sm"
            className="w-full text-[10px] font-black uppercase gap-2 h-8"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCcw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Synkronoidaan..." : "Päivitä osakasluettelo (HJT2)"}
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
