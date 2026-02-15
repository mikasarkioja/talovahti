"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  KanbanItem,
  getTicketHistoryForLocation,
  requestTicketInfo,
} from "@/app/actions/ops-actions";
import {
  escalateToExpert,
  markAsRoutine,
  toggleTicketPublic,
} from "@/app/actions/triage-actions";
import {
  AlertTriangle,
  Box,
  ChevronRight,
  ClipboardList,
  Eye,
  EyeOff,
  History,
  Info,
  Loader2,
  MessageSquare,
  Wrench,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BoardTriageCardProps {
  item: KanbanItem;
  onActionComplete: (id: string) => void;
}

interface HistoryItem {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
}

export function BoardTriageCard({
  item,
  onActionComplete,
}: BoardTriageCardProps) {
  const [isPending, startTransition] = useTransition();
  const [activeAction, setActiveAction] = useState<
    "ROUTINE" | "EXPERT" | "INFO" | null
  >(null);
  const [notes, setNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPublic, setIsPublic] = useState(item.meta?.isPublic as boolean);

  // High Risk Detection
  const isHighRisk =
    item.description?.toLowerCase().includes("vettä") ||
    item.description?.toLowerCase().includes("halkeama") ||
    item.priority === "CRITICAL";

  const triageColors = {
    ROUTINE: "border-blue-200",
    ESCALATED: "border-amber-200",
    CRITICAL: "border-red-200",
  };

  const handleAction = () => {
    if (!activeAction) return;

    startTransition(async () => {
      let result;
      if (activeAction === "ROUTINE") {
        result = await markAsRoutine(item.id, notes);
      } else if (activeAction === "EXPERT") {
        result = await escalateToExpert(item.id);
      } else if (activeAction === "INFO") {
        result = await requestTicketInfo(item.id, notes);
      }

      if (result?.success) {
        toast.success(
          activeAction === "ROUTINE"
            ? "Merkitty rutiinihuolloksi"
            : activeAction === "EXPERT"
              ? "Eskaloitu asiantuntijalle"
              : "Lisätietopyyntö lähetetty",
        );
        onActionComplete(item.id);
      } else {
        toast.error(
          "Virhe tallennuksessa: " + (result?.error || "Tuntematon virhe"),
        );
      }
    });
  };

  const toggleHistory = async () => {
    if (!showHistory && item.apartmentId) {
      setLoadingHistory(true);
      const history = await getTicketHistoryForLocation(item.apartmentId);
      setHistoryItems(history);
      setLoadingHistory(false);
    }
    setShowHistory(!showHistory);
  };

  const handlePublicToggle = async (val: boolean) => {
    setIsPublic(val);
    const result = await toggleTicketPublic(item.id, val);
    if (result.success) {
      toast.success(val ? "Asetettu julkiseksi" : "Asetettu yksityiseksi");
    } else {
      toast.error("Virhe päivityksessä");
      setIsPublic(!val);
    }
  };

  return (
    <Card
      className={cn(
        "bg-white transition-all shadow-sm overflow-hidden",
        triageColors[item.triageLevel as keyof typeof triageColors] ||
          "border-slate-200",
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-900">
                {item.title}
              </CardTitle>
              {(item.meta?.apartmentNumber as string) && (
                <Badge variant="outline" className="text-[9px] h-4 px-1">
                  Asunto {item.meta?.apartmentNumber as string}
                </Badge>
              )}
              {isHighRisk && (
                <Badge
                  variant="destructive"
                  className="text-[9px] h-4 px-1 animate-pulse"
                >
                  <AlertTriangle size={10} className="mr-1" />
                  KORKEA RISKI
                </Badge>
              )}
            </div>
            <CardDescription className="text-[10px] flex items-center gap-1">
              <Info size={10} />
              {item.subtitle}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-[9px]">
              {item.priority}
            </Badge>
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-1.5 py-0.5 border border-slate-200">
              {isPublic ? (
                <Eye size={10} className="text-blue-500" />
              ) : (
                <EyeOff size={10} className="text-slate-400" />
              )}
              <Switch
                checked={isPublic}
                onCheckedChange={handlePublicToggle}
                className="h-3 w-6"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed italic">
          &quot;{item.description}&quot;
        </p>

        <div className="flex items-center gap-2">
          {!!item.meta?.hasLocation && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] gap-1.5 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
              onClick={() => toast.info("3D-näkymä avautuu...")}
            >
              <Box size={12} />
              Katso 3D-sijainti
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] gap-1.5 text-slate-500"
            onClick={toggleHistory}
          >
            <History size={12} />
            {showHistory ? "Piilota historia" : "Sijaintihistoria (12kk)"}
          </Button>
        </div>

        {showHistory && (
          <div className="bg-slate-50 rounded-lg p-2 text-[10px] space-y-2 border border-slate-100 animate-in slide-in-from-top-2">
            <p className="font-bold text-slate-400 uppercase tracking-tighter">
              Viimeisimmät tapaukset
            </p>
            {loadingHistory ? (
              <p className="text-slate-400">Ladataan...</p>
            ) : historyItems.length > 0 ? (
              historyItems.map((h) => (
                <div
                  key={h.id}
                  className="flex justify-between items-center border-b border-white pb-1 last:border-0"
                >
                  <span className="truncate max-w-[120px]">{h.title}</span>
                  <span className="text-slate-400">
                    {new Date(h.createdAt).toLocaleDateString("fi-FI")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Ei aiempia merkintöjä.</p>
            )}
          </div>
        )}

        {activeAction && activeAction !== "EXPERT" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <Label
              htmlFor="notes"
              className="text-[10px] font-bold uppercase text-slate-400"
            >
              {activeAction === "ROUTINE"
                ? "Ohjeet huollolle"
                : "Viesti asukkaalle"}
            </Label>
            <Textarea
              id="notes"
              placeholder="Kirjoita tähän..."
              className="text-xs min-h-[80px] bg-slate-50 border-slate-200"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-2 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-1">
        {!activeAction ? (
          <div className="grid grid-cols-3 gap-1 w-full">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[9px] font-bold flex flex-col gap-0.5 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => {
                setActiveAction("ROUTINE");
                setNotes("");
              }}
            >
              <Wrench size={12} />
              RUTIINI
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[9px] font-bold flex flex-col gap-0.5 hover:bg-amber-50 hover:text-amber-700"
              onClick={() => {
                // For expert escalation, we might not need notes according to the constraint,
                // so we just set the action and it will trigger immediately or show confirmation.
                setActiveAction("EXPERT");
                setNotes("");
              }}
            >
              <ClipboardList size={12} />
              PROJEKTI
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[9px] font-bold flex flex-col gap-0.5 hover:bg-slate-100"
              onClick={() => {
                setActiveAction("INFO");
                setNotes("");
              }}
            >
              <MessageSquare size={12} />
              LISÄTIETOJA
            </Button>
          </div>
        ) : (
          <div className="flex gap-1 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-[10px]"
              onClick={() => setActiveAction(null)}
              disabled={isPending}
            >
              Peruuta
            </Button>
            <Button
              className={cn(
                "flex-1 h-8 text-[10px] text-white",
                activeAction === "ROUTINE"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : activeAction === "EXPERT"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-amber-600 hover:bg-amber-700",
              )}
              disabled={
                isPending || (activeAction === "INFO" && notes.length === 0)
              }
              onClick={handleAction}
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <ChevronRight size={12} className="mr-1" />
              )}
              Vahvista{" "}
              {activeAction === "ROUTINE"
                ? "Huolto"
                : activeAction === "EXPERT"
                  ? "Eskalointi"
                  : "Kysely"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
