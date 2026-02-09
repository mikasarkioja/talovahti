"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
    color: "text-red-400",
  },
  {
    id: "ASSESSMENT",
    title: "Kuntoarvio",
    icon: Search,
    color: "text-blue-400",
  },
  {
    id: "MARKETPLACE",
    title: "Palvelutori",
    icon: ShoppingCart,
    color: "text-purple-400",
  },
  {
    id: "EXECUTION",
    title: "Työn Alla",
    icon: Hammer,
    color: "text-orange-400",
  },
  {
    id: "VERIFICATION",
    title: "Tarkastus",
    icon: UserCheck,
    color: "text-emerald-400",
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
      boardSummary: verdict.substring(0, 100), // Simple auto-summary
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
      title: "", // Uses default in action
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

  return (
    <div className="h-[calc(100vh-120px)] overflow-x-auto">
      <div className="flex gap-4 h-full min-w-[1200px]">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.stage === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="flex-1 flex flex-col min-w-[280px] bg-slate-900/50 rounded-xl border border-slate-800"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${col.color}`} />
                  <h3 className="font-semibold text-slate-200">{col.title}</h3>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-slate-800 text-slate-400"
                >
                  {colItems.length}
                </Badge>
              </div>

              {/* Drop Zone / List */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colItems.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-slate-950 border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge
                          variant="outline"
                          className={`
                                                ${item.priority === "CRITICAL" ? "border-red-500 text-red-500" : "border-slate-700 text-slate-500"}
                                            `}
                        >
                          {item.type}
                        </Badge>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-medium text-white leading-tight">
                        {item.title}
                      </CardTitle>
                      <p className="text-xs text-slate-400 mt-1">
                        {item.subtitle}
                      </p>
                    </CardHeader>

                    <CardFooter className="p-3 pt-0 flex justify-end">
                      {/* Context Actions */}
                      {col.id === "INBOX" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 w-full"
                          onClick={() => handleEscalate(item.id)}
                          disabled={loading}
                        >
                          Siirrä Kuntoarvioon{" "}
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                      {col.id === "ASSESSMENT" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 w-full"
                          onClick={() => handleAssessment(item)}
                        >
                          Anna Lausunto{" "}
                          <ClipboardList className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                      {col.id === "MARKETPLACE" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20 w-full"
                          onClick={() => handleOrder(item.id)}
                        >
                          Tilaa Työ <ShoppingCart className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                      {col.id === "VERIFICATION" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20 w-full"
                          onClick={() => handleVerify(item.id)}
                        >
                          Hyväksy & Valmis{" "}
                          <CheckCircle2 className="w-3 h-3 ml-2" />
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      <Dialog
        open={dialogMode === "ASSESS"}
        onOpenChange={() => setDialogMode(null)}
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asiantuntijan Tekninen Lausunto</DialogTitle>
            <DialogDescription className="text-slate-400">
              Anna tekninen arvio havainnosta ja määritä sen kiireellisyys.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-200">
                Kohde: <span className="font-bold">{activeItem?.title}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity" className="text-slate-300">
                Kiireellisyys (Severity)
              </Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Valitse kiireellisyys" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="1">
                    🔴 1 - Kriittinen (Välitön korjaus)
                  </SelectItem>
                  <SelectItem value="2">
                    🟠 2 - Kiireellinen (Tänä vuonna)
                  </SelectItem>
                  <SelectItem value="3">
                    🟡 3 - Normaali (PTS-suunnitelmaan)
                  </SelectItem>
                  <SelectItem value="4">🟢 4 - Matala (Seuranta)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verdict" className="text-slate-300">
                Tekninen Arvio & Suositus
              </Label>
              <Textarea
                id="verdict"
                placeholder="Kirjoita tekninen arvio ja suositus toimenpiteistä..."
                className="bg-slate-950 border-slate-800 text-white min-h-[120px] resize-none"
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setDialogMode(null)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Peruuta
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
              onClick={submitAssessment}
              disabled={loading || !verdict}
            >
              {loading ? "Tallennetaan..." : "Tallenna & Siirrä Palvelutorille"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
