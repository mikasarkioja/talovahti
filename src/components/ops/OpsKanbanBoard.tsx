"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  KanbanItem,
  janitorialCheckIn,
  submitTechnicalVerdict,
  createProjectFromObservation,
  completeProject,
} from "@/app/actions/ops-actions";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Hammer,
  ShoppingCart,
  UserCheck,
  Search,
  Info,
  MoreVertical,
  Box,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { BoardTriageCard } from "./BoardTriageCard";

interface OpsBoardProps {
  items: KanbanItem[];
}

const COLUMNS = [
  {
    id: "INBOX",
    title: "Uudet ilmoitukset",
    icon: AlertCircle,
    color: "text-red-500",
  },
  {
    id: "ASSESSMENT",
    title: "Kuntoarvio",
    icon: Search,
    color: "text-blue-500",
  },
  {
    id: "MARKETPLACE",
    title: "Palvelutori",
    icon: ShoppingCart,
    color: "text-purple-500",
  },
  {
    id: "EXECUTION",
    title: "Työn Alla",
    icon: Hammer,
    color: "text-orange-500",
  },
  {
    id: "VERIFICATION",
    title: "Tarkastus",
    icon: UserCheck,
    color: "text-emerald-500",
  },
];

export function OpsKanbanBoard({ items: initialItems }: OpsBoardProps) {
  const [boardItems, setBoardItems] = useState(initialItems);
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [dialogMode, setDialogMode] = useState<"ASSESS" | "CHECKIN" | null>(
    null,
  );
  const [verdict, setVerdict] = useState("");
  const [severity, setSeverity] = useState<string>("3");
  const [huoltoNotes, setHuoltoNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync boardItems when props change (but avoid overwriting during transition)
  React.useEffect(() => {
    setBoardItems(initialItems);
  }, [initialItems]);

  const handleActionComplete = (id: string) => {
    // Optimistic UI: remove item from board immediately
    setBoardItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCheckInOpen = (item: KanbanItem) => {
    setActiveItem(item);
    setDialogMode("CHECKIN");
    setHuoltoNotes(item.huoltoNotes || "");
  };

  const submitCheckIn = async (action: "RESOLVE" | "ESCALATE") => {
    if (!activeItem) return;
    setLoading(true);
    const result = await janitorialCheckIn(activeItem.id, {
      notes: huoltoNotes,
      action,
    });

    if (result.success) {
      toast.success(
        action === "RESOLVE"
          ? "Vika kuitattu korjatuksi"
          : "Eskaloitu asiantuntijalle",
      );
      handleActionComplete(activeItem.id);
      setDialogMode(null);
      setHuoltoNotes("");
    } else {
      toast.error(result.error || "Virhe kirjauksessa");
    }
    setLoading(false);
  };

  const handleAssessment = (item: KanbanItem) => {
    setActiveItem(item);
    setDialogMode("ASSESS");
  };

  const handleOrder = async (id: string) => {
    setLoading(true);
    const result = await createProjectFromObservation(id, {
      title: "",
      type: "MAINTENANCE",
    });
    if (result.success) {
      toast.success("Projekti luotu");
    } else {
      toast.error("Virhe luotaessa projektia");
    }
    setLoading(false);
  };

  const handleVerify = async (id: string) => {
    setLoading(true);
    const result = await completeProject(id);
    if (result.success) {
      toast.success("Tehtävä kuitattu valmiiksi");
    } else {
      toast.error("Virhe kuittauksessa");
    }
    setLoading(false);
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, string> = {
      CRITICAL: "border-red-500/50 text-red-600 bg-red-50",
      HIGH: "border-orange-500/50 text-orange-600 bg-orange-50",
      MEDIUM: "border-blue-500/50 text-blue-600 bg-blue-50",
      LOW: "border-slate-300 text-slate-500 bg-slate-50",
    };

    const labels: Record<string, string> = {
      CRITICAL: "KRIITTINEN",
      HIGH: "KORKEA",
      MEDIUM: "NORMAALI",
      LOW: "MATALA",
    };

    return (
      <Badge
        variant="outline"
        className={`text-[10px] font-bold px-1.5 h-5 ${config[priority] || "border-slate-300 text-slate-500 bg-slate-50"}`}
      >
        {labels[priority] || priority}
      </Badge>
    );
  };

  return (
    <div className="h-[calc(100vh-160px)] overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-6 h-full min-w-[1400px]">
        {COLUMNS.map((col) => {
          const colItems = boardItems.filter(
            (i: KanbanItem) => i.stage === col.id,
          );
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="flex-1 flex flex-col min-w-[280px] bg-slate-50/50 rounded-2xl border border-slate-200"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/50 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-slate-100 shadow-sm">
                    <Icon className={`w-4 h-4 ${col.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    {col.title}
                  </h3>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-slate-200 text-slate-600 font-bold"
                >
                  {colItems.length}
                </Badge>
              </div>

              <div className="flex-1 p-3 space-y-4 overflow-y-auto">
                {colItems.map((item: KanbanItem) =>
                  col.id === "INBOX" ? (
                    <BoardTriageCard
                      key={item.id}
                      item={item}
                      onActionComplete={handleActionComplete}
                    />
                  ) : (
                    <Card
                      key={item.id}
                      className={`bg-white border-slate-200 hover:border-brand-emerald/30 hover:shadow-md transition-all group relative overflow-hidden ${
                        item.category === "PROJECT"
                          ? "border-l-4 border-l-blue-500 shadow-sm"
                          : ""
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex gap-1.5 items-center">
                            {getPriorityBadge(item.priority)}
                            {item.category === "PROJECT" && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[9px] h-5 font-bold uppercase">
                                Projekti
                              </Badge>
                            )}
                            {(item.meta?.hasLocation as boolean) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                      <Box size={12} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs font-medium">
                                      Sisältää 3D-koordinaatit
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>

                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-600"
                              >
                                <MoreVertical size={16} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-56 p-2">
                              <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-slate-400">
                                Toiminnot
                              </div>
                              <div className="h-px bg-slate-100 my-1" />

                              <div className="space-y-1">
                                {col.id === "INBOX" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
                                      onClick={() => handleCheckInOpen(item)}
                                      disabled={loading}
                                    >
                                      <Stethoscope
                                        size={14}
                                        className="text-blue-500"
                                      />
                                      <span>Huoltotarkastus</span>
                                    </Button>
                                  </>
                                )}

                                {col.id === "ASSESSMENT" && (
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
                                    onClick={() => handleAssessment(item)}
                                  >
                                    <ClipboardList
                                      size={14}
                                      className="text-purple-500"
                                    />
                                    <span>Anna tekninen lausunto</span>
                                  </Button>
                                )}

                                {col.id === "MARKETPLACE" && (
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
                                    onClick={() => handleOrder(item.id)}
                                    disabled={loading}
                                  >
                                    <ShoppingCart
                                      size={14}
                                      className="text-orange-500"
                                    />
                                    <span>Kilpailuta toimittajat</span>
                                  </Button>
                                )}

                                {col.id === "VERIFICATION" && (
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
                                    onClick={() => handleVerify(item.id)}
                                    disabled={loading}
                                  >
                                    <CheckCircle2
                                      size={14}
                                      className="text-emerald-500"
                                    />
                                    <span>Hyväksy työ valmiiksi</span>
                                  </Button>
                                )}

                                <div className="h-px bg-slate-100 my-1" />

                                <Link
                                  href={
                                    item.type === "PROJECT"
                                      ? `/projects/${item.id}`
                                      : "#"
                                  }
                                  className="block"
                                >
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal text-slate-500"
                                  >
                                    <Info size={14} />
                                    <span>Näytä yksityiskohdat</span>
                                  </Button>
                                </Link>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <CardTitle className="text-sm font-bold text-brand-navy leading-tight mb-1">
                          {item.title}
                        </CardTitle>

                        <p className="text-[11px] text-slate-500 font-medium">
                          {item.subtitle}
                        </p>

                        {item.meta?.bidCount !== undefined && (
                          <div className="mt-3">
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-bold"
                            >
                              {item.meta.bidCount as number} tarjousta
                            </Badge>
                          </div>
                        )}
                      </CardHeader>

                      <div className="px-4 pb-4 mt-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium border-t border-slate-50 pt-3">
                          <span>
                            {new Date(item.date).toLocaleDateString("fi-FI")}
                          </span>
                          <span className="uppercase tracking-tighter opacity-50">
                            {(
                              {
                                TICKET: "TIKETTI",
                                OBSERVATION: "HAVAINTO",
                                PROJECT: "PROJEKTI",
                              } as Record<string, string>
                            )[item.type] || item.type}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={dialogMode === "ASSESS"}
        onOpenChange={() => setDialogMode(null)}
      >
        {/* ... existing ASSESS dialog ... */}
      </Dialog>

      <Dialog
        open={dialogMode === "CHECKIN"}
        onOpenChange={() => setDialogMode(null)}
      >
        <DialogContent className="bg-white border-slate-200 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Huoltotarkastus (Janitorial Check-in)
            </DialogTitle>
            <DialogDescription>
              Kirjaa huoltoyhtiön huomiot ja päätä jatkotoimenpiteistä.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="huoltoNotes" className="text-slate-700">
                Huollon huomiot / Tehdyt toimenpiteet
              </Label>
              <Textarea
                id="huoltoNotes"
                placeholder="Esim. Vuoto paikallistettu, vaatii putkiasentajan..."
                className="bg-white border-slate-200 text-slate-900 min-h-[120px] resize-none"
                value={huoltoNotes}
                onChange={(e) => setHuoltoNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => submitCheckIn("RESOLVE")}
              disabled={loading}
            >
              <CheckCircle2 size={14} className="mr-2 text-emerald-500" />
              Kuitattu korjatuksi
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => submitCheckIn("ESCALATE")}
              disabled={loading || !huoltoNotes}
            >
              <ChevronRight size={14} className="mr-2" />
              Eskaloi asiantuntijalle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
