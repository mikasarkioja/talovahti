"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  KanbanItem,
  escalateTicketToObservation,
  submitTechnicalVerdict,
  createProjectFromObservation,
  completeProject,
} from "@/app/actions/ops-actions";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Hammer,
  ShoppingCart,
  UserCheck,
  Search,
  Info,
  MoreVertical,
  Box,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface OpsBoardProps {
  items: KanbanItem[];
}

const COLUMNS = [
  {
    id: "INBOX",
    title: "Vikailmoitukset",
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

export function OpsKanbanBoard({ items }: OpsBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [dialogMode, setDialogMode] = useState<"ASSESS" | null>(null);
  const [verdict, setVerdict] = useState("");
  const [severity, setSeverity] = useState<string>("3");
  const [loading, setLoading] = useState(false);

  const handleEscalate = async (id: string) => {
    setLoading(true);
    const result = await escalateTicketToObservation(id);
    if (result.success) {
      toast.success("Ilmoitus siirretty kuntoarvioon");
    } else {
      toast.error("Virhe siirrettäessä ilmoitusta");
    }
    setLoading(false);
  };

  const handleAssessment = (item: KanbanItem) => {
    setActiveItem(item);
    setDialogMode("ASSESS");
  };

  const submitAssessment = async () => {
    if (!activeItem) return;
    setLoading(true);
    const result = await submitTechnicalVerdict(activeItem.id, {
      verdict,
      severity: parseInt(severity),
      boardSummary: verdict.substring(0, 100),
    });

    if (result.success) {
      toast.success("Lausunto tallennettu");
      setDialogMode(null);
      setVerdict("");
      setSeverity("3");
    } else {
      toast.error("Virhe tallennettaessa lausuntoa");
    }
    setLoading(false);
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
    const config =
      {
        CRITICAL: "border-red-500/50 text-red-600 bg-red-50",
        HIGH: "border-orange-500/50 text-orange-600 bg-orange-50",
        MEDIUM: "border-blue-500/50 text-blue-600 bg-blue-50",
        LOW: "border-slate-300 text-slate-500 bg-slate-50",
      }[priority] || "border-slate-300 text-slate-500 bg-slate-50";

    return (
      <Badge
        variant="outline"
        className={`text-[10px] font-bold px-1.5 h-5 ${config}`}
      >
        {priority}
      </Badge>
    );
  };

  return (
    <div className="h-[calc(100vh-160px)] overflow-x-auto pb-4 custom-scrollbar">
      <div className="flex gap-6 h-full min-w-[1400px]">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.stage === col.id);
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
                {colItems.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-white border-slate-200 hover:border-brand-emerald/30 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-1.5">
                          {getPriorityBadge(item.priority)}
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
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
                                  onClick={() => handleEscalate(item.id)}
                                  disabled={loading}
                                >
                                  <ArrowRight
                                    size={14}
                                    className="text-blue-500"
                                  />
                                  <span>Edistä kuntoarvioon</span>
                                </Button>
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
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={dialogMode === "ASSESS"}
        onOpenChange={() => setDialogMode(null)}
      >
        <DialogContent className="bg-white border-slate-200 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Tekninen Lausunto
            </DialogTitle>
            <DialogDescription>
              Määritä havainnon kiireellisyys ja anna asiantuntija-arvio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="severity" className="text-slate-700">
                Kiireellisyys (1-4)
              </Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue placeholder="Valitse kiireellisyys" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="1">🔴 1 - Kriittinen (Heti)</SelectItem>
                  <SelectItem value="2">🟠 2 - Kiireellinen (PTS)</SelectItem>
                  <SelectItem value="3">
                    🟡 3 - Normaali (Suunniteltu)
                  </SelectItem>
                  <SelectItem value="4">🟢 4 - Matala (Seuranta)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verdict" className="text-slate-700">
                Tekninen Arvio
              </Label>
              <Textarea
                id="verdict"
                placeholder="Kirjoita lausunto..."
                className="bg-white border-slate-200 text-slate-900 min-h-[120px] resize-none"
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>
              Peruuta
            </Button>
            <Button
              className="bg-[#002f6c] hover:bg-blue-900"
              onClick={submitAssessment}
              disabled={loading || !verdict}
            >
              {loading ? "Tallennetaan..." : "Tallenna Lausunto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
