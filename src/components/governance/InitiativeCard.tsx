"use client";

import React, { useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeightedResultBar } from "./WeightedResultBar";
import { useParticipationMap } from "@/hooks/useParticipationMap";
import { Vote, Apartment, GovernanceStatus, VoteChoice } from "@prisma/client";
import { cn } from "@/lib/utils";
import { castVote } from "@/app/actions/governance";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface InitiativeWithVotes {
  id: string;
  title: string;
  status: GovernanceStatus;
  description: string;
  votes: (Vote & { apartment: Apartment })[];
}

interface InitiativeCardProps {
  initiative: InitiativeWithVotes;
  totalShares: number;
  totalApartments: number;
  currentUserId?: string;
}

export function InitiativeCard({
  initiative,
  totalShares,
  totalApartments,
  currentUserId,
}: InitiativeCardProps) {
  const [isPending, startTransition] = useTransition();
  const { highlightParticipation, clearParticipation, getStaircaseStats } =
    useParticipationMap();

  const handleMouseEnter = () => {
    const apartmentIds = initiative.votes.map(
      (v) => v.apartment.apartmentNumber,
    );
    highlightParticipation(apartmentIds);
  };

  const handleMouseLeave = () => {
    clearParticipation();
  };

  const totalVotedShares = initiative.votes.reduce(
    (sum, v) => sum + v.shares,
    0,
  );
  // Default quorum 50%
  const quorumMet = totalVotedShares >= totalShares * 0.5;

  const isActive = initiative.status === "VOTING";
  const staircaseStats = getStaircaseStats(
    initiative.votes.map((v) => ({ name: v.apartment.apartmentNumber })),
  );

  const userVote = initiative.votes.find((v) => v.userId === currentUserId);
  const hasVoted = !!userVote;

  const handleVote = async (choice: "YES" | "NO" | "ABSTAIN") => {
    if (!currentUserId) {
      toast.error("Sinun on oltava kirjautunut äänestääksesi.");
      return;
    }

    startTransition(async () => {
      const result = await castVote(initiative.id, choice, currentUserId);
      if (result.success) {
        toast.success("Äänesi on rekisteröity!");
      } else {
        toast.error(result.error || "Äänestys epäonnistui.");
      }
    });
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md border-slate-200",
        isActive ? "border-l-4 border-l-brand-emerald" : "",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {isActive && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
            {initiative.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasVoted && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Äänestetty
              </Badge>
            )}
            <Badge variant={isActive ? "default" : "secondary"}>
              {initiative.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2">
          {initiative.description}
        </p>
      </CardHeader>

      <CardContent>
        <WeightedResultBar
          votes={initiative.votes}
          totalShares={totalShares}
          totalApartments={totalApartments}
          quorumPercentage={50}
        />

        {isActive && !hasVoted && currentUserId && (
          <div className="mt-6 flex flex-col gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">
              Annatko kannatuksesi tälle aloitteelle?
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className="bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                onClick={() => handleVote("YES")}
                disabled={isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                JAA
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                onClick={() => handleVote("NO")}
                disabled={isPending}
              >
                <XCircle className="w-4 h-4 mr-2 text-rose-500" />
                EI
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-100"
                onClick={() => handleVote("ABSTAIN")}
                disabled={isPending}
              >
                <MinusCircle className="w-4 h-4 mr-2 text-slate-400" />
                TYHJÄ
              </Button>
            </div>
          </div>
        )}

        {hasVoted && userVote && (
          <div className="mt-4 p-3 bg-emerald-50/50 rounded border border-emerald-100 text-xs text-emerald-800 flex items-center gap-2">
             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
             <span>Sinun valintasi: <strong>{userVote.choice === 'YES' ? 'KYLLÄ' : userVote.choice === 'NO' ? 'EI' : 'TYHJÄ'}</strong></span>
          </div>
        )}

        {staircaseStats && (
          <div className="mt-2 text-[10px] text-slate-400 font-medium">
            {staircaseStats}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-50 bg-slate-50/50 text-xs text-slate-500 flex justify-between">
        <span>
          Äänet painotettu: <strong>{totalVotedShares.toLocaleString()}</strong>{" "}
          / {totalShares.toLocaleString()} osaketta
        </span>
        <span
          className={cn(
            "font-bold",
            quorumMet ? "text-emerald-600" : "text-rose-600",
          )}
        >
          Yhtiökokouskunto: {quorumMet ? "KYLLÄ" : "EI"}
        </span>
      </CardFooter>
    </Card>
  );
}
