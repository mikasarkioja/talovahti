"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeightedResultBar } from "./WeightedResultBar";
import { useParticipationMap } from "@/hooks/useParticipationMap";
import { Vote, Apartment, GovernanceStatus, VoteChoice } from "@prisma/client";
import { cn } from "@/lib/utils";

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
}

export function InitiativeCard({
  initiative,
  totalShares,
  totalApartments,
}: InitiativeCardProps) {
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
          <Badge variant={isActive ? "default" : "secondary"}>
            {initiative.status}
          </Badge>
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
