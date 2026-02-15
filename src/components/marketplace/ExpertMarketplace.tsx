"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import { orderExpertAction } from "@/app/actions/marketplace-actions";
import { useStore } from "@/lib/store";

interface Expert {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  hourlyRate: number;
  verified: boolean;
  type: "EXPERT" | "CONTRACTOR";
}

const EXPERTS: Expert[] = [
  {
    id: "exp-1",
    name: "Insinööritoimisto Laatu Oy",
    category: "Valvoja (KSA 2013)",
    description:
      "Riippumaton valvoja suurille putkiremonteille ja LVI-hankkeille.",
    rating: 4.9,
    hourlyRate: 125,
    verified: true,
    type: "EXPERT",
  },
  {
    id: "exp-2",
    name: "Asianajotoimisto Laki & Järjestys",
    category: "Taloyhtiölakimies",
    description: "Erikoistunut asunto-osakeyhtiölakiin ja urakkasopimuksiin.",
    rating: 4.8,
    hourlyRate: 250,
    verified: true,
    type: "EXPERT",
  },
  {
    id: "con-1",
    name: "Helsingin Julkisivuremontti Oy",
    category: "Urakoitsija (YSE 1998)",
    description: "Laadukkaat julkisivu- ja parvekeremontit takuutyönä.",
    rating: 4.7,
    hourlyRate: 55000, // Total project price mock
    verified: true,
    type: "CONTRACTOR",
  },
];

export function ExpertMarketplace() {
  const { currentUser, projects, updateProjectStatus } = useStore();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = React.useState<"EXPERT" | "CONTRACTOR">("EXPERT");

  // Logic: Show contractors only if a project is in PLANNING phase
  const activePlanningProject = projects.find(p => p.status === "PLANNING");
  const canShowContractors = !!activePlanningProject;

  const handleOrder = (expert: Expert) => {
    if (!currentUser) return;

    startTransition(async () => {
      const result = await orderExpertAction({
        expertId: expert.id,
        expertName: expert.name,
        housingCompanyId: currentUser.housingCompanyId,
        userId: currentUser.id,
        amount: expert.hourlyRate, // Using total for contractors, or 2h deposit for experts
        contractType: expert.type === "EXPERT" ? "KSA_2013" : "YSE_1998",
        projectId: activePlanningProject?.id
      });

      if (result.success) {
        toast.success(
          expert.type === "EXPERT" 
            ? `Valvontasopimus (KSA 2013) hyväksytty: ${expert.name}.` 
            : `Uurakkasopimus (YSE 1998) hyväksytty: ${expert.name}.`,
          { description: "Sopimus on allekirjoitettu digitaalisesti ja arkistoitu." }
        );
        
        // Move project forward if applicable
        if (activePlanningProject && expert.type === "CONTRACTOR") {
          updateProjectStatus(activePlanningProject.id, "EXECUTION");
        } else if (activePlanningProject && expert.type === "EXPERT") {
          // Stay in PLANNING but with supervisor assigned
        }
      } else {
        toast.error("Tilauksen tekeminen epäonnistui.");
      }
    });
  };

  const filteredExperts = EXPERTS.filter(e => e.type === view);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
            <Briefcase className="text-brand-emerald" />
            {view === "EXPERT" ? "Asiantuntijoiden markkinapaikka" : "Urakoitsijoiden markkinapaikka"}
          </h2>
          <p className="text-sm text-slate-500">
            {view === "EXPERT" 
              ? "Tilaa riippumattomat valvojat ja asiantuntijat (KSA 2013)." 
              : "Kilpailuta ja tilaa urakoitsijat (YSE 1998)."}
          </p>
        </div>
        <div className="flex gap-2">
          {canShowContractors && view === "EXPERT" && (
            <Button 
              variant="outline" 
              className="border-brand-emerald text-brand-emerald hover:bg-brand-emerald/10 font-bold"
              onClick={() => setView("CONTRACTOR")}
            >
              Kilpailuta urakka <ArrowRight size={14} className="ml-2" />
            </Button>
          )}
          {view === "CONTRACTOR" && (
            <Button 
              variant="ghost" 
              className="text-slate-500"
              onClick={() => setView("EXPERT")}
            >
              Palaa asiantuntijoihin
            </Button>
          )}
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold"
          >
            <ShieldCheck size={12} className="mr-1" />
            Varmennettuja kumppaneita
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert) => (
          <Card
            key={expert.id}
            className="border-brand-navy/10 bg-white hover:shadow-soft transition-all overflow-hidden flex flex-col"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 text-[10px] font-bold uppercase">
                  {expert.category}
                </Badge>
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  {expert.rating}
                </div>
              </div>
              <CardTitle className="text-lg font-bold text-brand-navy mt-2">
                {expert.name}
              </CardTitle>
              <CardDescription className="text-xs italic">
                {expert.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 py-4">
              <div className="space-y-3">
                <div className="flex justify-between text-xs border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Palkkio</span>
                  <span className="font-bold text-brand-navy">
                    {expert.hourlyRate.toLocaleString("fi-FI")} € {expert.type === "EXPERT" ? "/ h" : " (yhteensä)"}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-b border-slate-50 pb-2">
                  <span className="text-slate-400">Talovahti-komissio (5 %)</span>
                  <span className="font-bold text-brand-emerald">
                    {(expert.hourlyRate * 0.05).toLocaleString("fi-FI")} €
                  </span>
                </div>
                <div className="space-y-1 mt-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Check size={12} className="text-emerald-500" />
                    Vastuuvakuutettu toimija
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Check size={12} className="text-emerald-500" />
                    Riippumaton neuvonantaja
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 p-4 pt-4 border-t border-slate-100">
                <Button
                  className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white font-bold h-9 text-xs"
                  onClick={() => handleOrder(expert)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 size={14} className="animate-spin mr-2" />
                  ) : (
                    <CreditCard size={14} className="mr-2" />
                  )}
                  {expert.type === "EXPERT" ? "Tilaa valvoja" : "Tilaa urakoitsija"}
                  <ArrowRight size={14} className="ml-auto" />
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center py-4">
        <p className="text-[10px] text-slate-400 font-medium">
          Kaikki tilaukset noudattavat rakennusalan standardeja (KSA 2013 / YSE 1998). 
          Sisältää 5 % välityspalkkion. Audit trail tallentaa tilauksen hallituksen virallisena päätöksenä.
        </p>
      </div>
    </div>
  );
}
