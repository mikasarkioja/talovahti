// src/components/governance/BiddingComparisonUI.tsx
"use client";

import { useState } from "react";
import { Tender, TenderBid, TenderStatus } from "@prisma/client";
import {
  CheckCircle2,
  Star,
  Clock,
  TrendingUp,
  ShieldCheck,
  FileSignature,
  Info,
} from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { selectWinningBid, runAIAnalysis } from "@/app/actions/tender-actions";
import { Brain, ShieldAlert, Loader2 } from "lucide-react";

interface Props {
  tender: Tender & { bids: TenderBid[] };
  userId: string;
}

export function BiddingComparisonUI({ tender, userId }: Props) {
  const [isPending, setIsPending] = useState(false);
  const [isAiPending, setIsAiPending] = useState(false);
  const [, setSelectedBidId] = useState<string | null>(
    tender.bids.find((b) => b.isWinner)?.id || null,
  );

  const handleRunAI = async () => {
    setIsAiPending(true);
    try {
      const res = await runAIAnalysis(tender.id, userId);
      if (res.success) {
        toast.success("AI-analyysi valmis!", { description: res.summary });
      } else {
        toast.error(res.error || "AI-analyysi epäonnistui.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Jokin meni vikaan.");
    } finally {
      setIsAiPending(false);
    }
  };

  const handleSelectBid = async (bidId: string) => {
    setIsPending(true);
    try {
      const res = await selectWinningBid({
        tenderId: tender.id,
        bidId,
        userId,
        reason: "Hallituksen valinta hinnan ja laadun perusteella.",
      });

      if (res.success) {
        toast.success("Tarjous valittu!", {
          description:
            "Digitaalinen allekirjoitusprosessi käynnistetty (Visma Sign). +100 XP ansaittu hyvästä hallintotavasta.",
        });
        setSelectedBidId(bidId);
      } else {
        toast.error(res.error || "Valinta epäonnistui.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Jokin meni vikaan.");
    } finally {
      setIsPending(false);
    }
  };

  const lowestPrice = Math.min(...tender.bids.map((b) => b.price));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-black text-[10px] uppercase tracking-widest mb-2">
            Vaihe: Kilpailutus
          </Badge>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Tarjousvertailu
          </h2>
          <p className="text-slate-500 font-medium">
            Urakoitsijoiden ja valvojien tarjousten vertailu
          </p>
        </div>
        {tender.bids.length >= 3 && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
            <TrendingUp size={20} />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase leading-none">
                Hyvä hallintotapa
              </p>
              <p className="text-xs font-bold">+100 XP Saatavilla</p>
            </div>
          </div>
        )}
        <Button
          onClick={handleRunAI}
          disabled={isAiPending || tender.bids.length === 0}
          className="bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-xs gap-2"
        >
          {isAiPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Brain size={16} />
          )}
          Aja AI-vertailu
        </Button>
      </div>

      {/* AI Summary Notice */}
      {tender.aiAnalysisSummary && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3 items-start">
          <Brain className="text-indigo-600 shrink-0" size={20} />
          <div>
            <p className="text-[10px] font-black uppercase text-indigo-400">
              AI Analyysin yhteenveto
            </p>
            <p className="text-sm text-indigo-900 font-medium italic">
              {tender.aiAnalysisSummary}
            </p>
          </div>
        </div>
      )}

      {/* Expert Recommendation */}
      {tender.expertRecommendationId && (
        <Card className="border-brand-navy shadow-xl bg-brand-navy text-white overflow-hidden rounded-3xl">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="bg-brand-emerald p-6 flex items-center justify-center shrink-0">
                <ShieldCheck size={48} />
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">
                  Valvojan suositus
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black">
                    {tender.expertRecommendationId}
                  </span>
                  <Badge className="bg-white/10 text-white border-none text-[10px]">
                    PARAS VASTINE
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 italic">
                  &quot;Perustelu: {tender.expertRecommendationReason}&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      <Card className="border-slate-200 shadow-2xl rounded-3xl overflow-hidden bg-white">
        <TableHeader className="bg-slate-50">
          <TableRow className="border-none">
            <TableHead className="w-[200px] text-xs font-black uppercase tracking-widest text-slate-500 p-6">
              Tarjoaja
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 p-6 text-right">
              Kiinteä urakkahinta
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 p-6">
              AI Score
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 p-6">
              Kesto
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 p-6">
              Luottoluokitus
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 p-6">
              Arvio (1-5★)
            </TableHead>
            <TableHead className="text-xs font-black uppercase tracking-widest text-slate-500 p-6 text-right">
              Toimenpide
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tender.bids.map((bid) => (
            <TableRow
              key={bid.id}
              className={`hover:bg-slate-50 transition-colors ${bid.isWinner ? "bg-blue-50/50" : ""}`}
            >
              <TableCell className="p-6">
                <div className="space-y-1">
                  <p className="font-black text-slate-900">{bid.companyName}</p>
                  {bid.price === lowestPrice && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[8px] font-black uppercase">
                      Edullisin
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="p-6 text-right">
                <div className="space-y-1">
                  <p className="text-xl font-black text-slate-900">
                    {bid.price.toLocaleString("fi-FI")} €
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Sis. Palvelumaksu 5%
                  </p>
                </div>
              </TableCell>
              <TableCell className="p-6">
                {bid.aiScore ? (
                  <div className="space-y-1">
                    <Badge
                      className={`${(bid.aiScore || 0) > 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} border-none text-[10px] font-black`}
                    >
                      {bid.aiScore}/100
                    </Badge>
                    {bid.aiRiskNote && (
                      <div className="flex items-center gap-1 text-red-600 animate-pulse">
                        <ShieldAlert size={10} />
                        <span className="text-[8px] font-bold uppercase">
                          Riski
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-300 text-[10px] font-bold uppercase">
                    Odottaa
                  </span>
                )}
              </TableCell>
              <TableCell className="p-6">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock size={14} />
                  <span>
                    {bid.durationDays
                      ? `${Math.round(bid.durationDays / 30)} kk`
                      : "N/A"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="p-6">
                <Badge variant="outline" className="font-bold border-slate-200">
                  {bid.creditRating}
                </Badge>
              </TableCell>
              <TableCell className="p-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={
                          star <= (bid.supervisorRating || 0)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 italic line-clamp-1">
                    {bid.supervisorComments || "Ei kommentteja"}
                  </p>
                </div>
                {bid.aiRiskNote && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-[9px] text-red-700 font-medium italic">
                      {bid.aiRiskNote}
                    </p>
                  </div>
                )}
              </TableCell>
              <TableCell className="p-6 text-right">
                <Button
                  onClick={() => handleSelectBid(bid.id)}
                  disabled={isPending || bid.isWinner}
                  className={`h-10 px-6 rounded-xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg transition-all ${
                    bid.isWinner
                      ? "bg-brand-emerald text-white"
                      : "bg-brand-navy hover:bg-slate-800 text-white"
                  }`}
                >
                  {bid.isWinner ? (
                    <>
                      Valittu <CheckCircle2 size={16} />
                    </>
                  ) : (
                    <>
                      Valitse tarjous <FileSignature size={16} />
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Card>

      {/* Info Notice */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex gap-4 items-center">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
          <Info size={20} />
        </div>
        <p className="text-xs text-slate-600 leading-relaxed italic">
          Hallituksen valintapäätös ja sen perusteet tallentuvat automaattisesti
          yhtiökokouksen AuditLog-tauluun. Valinnan jälkeen valitulle
          urakoitsijalle lähetetään automaattinen kutsu digitaaliseen
          allekirjoitukseen.
        </p>
      </div>
    </div>
  );
}
