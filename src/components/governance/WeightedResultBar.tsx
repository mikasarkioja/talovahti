"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { VoteChoice } from "@prisma/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeightedResultBarProps {
  votes: { choice: VoteChoice; shares: number }[];
  totalShares: number;
  totalApartments: number;
  quorumPercentage?: number; // e.g. 50 or 66.6
}

export function WeightedResultBar({
  votes,
  totalShares,
  totalApartments,
  quorumPercentage = 50,
}: WeightedResultBarProps) {
  // 1. Calculate weighted sums
  const yesShares = votes
    .filter((v) => v.choice === "YES")
    .reduce((sum, v) => sum + v.shares, 0);
  const noShares = votes
    .filter((v) => v.choice === "NO")
    .reduce((sum, v) => sum + v.shares, 0);
  const abstainShares = votes
    .filter((v) => v.choice === "ABSTAIN")
    .reduce((sum, v) => sum + v.shares, 0);

  const totalVotedShares = yesShares + noShares + abstainShares;

  // Percentages relative to COMPANY TOTAL SHARES (Power Circle)
  // or relative to VOTED shares? Prompt says: "Share Power percentages ... vs. sum(weight) of cast votes"
  // Wait. "Calculate percentages based on totalShares of the company vs. sum(weight) of cast votes."
  // Usually result is % of CAST votes.
  // But "Quorum Marker... at 50%". Quorum is usually % of TOTAL shares (or shares present).
  // If I show bar filling up to 100% of TOTAL shares, that visualizes Quorum well.
  // If I show bar filling 100% width = 100% of TOTAL shares.
  // Then YES/NO segments show how much power is cast.
  // I'll assume the bar represents the TOTAL SHARE POOL (100%).

  const yesPercent = (yesShares / totalShares) * 100;
  const noPercent = (noShares / totalShares) * 100;
  const abstainPercent = (abstainShares / totalShares) * 100;
  const emptyPercent = 100 - yesPercent - noPercent - abstainPercent;

  // Headcount logic
  const votesCastCount = votes.length;
  // If we don't know unique apartments (one vote per apt), length is fine.

  return (
    <div className="w-full space-y-2">
      {/* Layer 2: Headcount Indicator */}
      <div className="flex justify-between items-end text-xs text-slate-500 px-0.5">
        <span className="font-medium flex items-center gap-1">
          Huoneistot:{" "}
          <span className="text-slate-900">
            {votesCastCount}/{totalApartments}
          </span>
        </span>
        <span>Yhtiöjärjestys: Yli {quorumPercentage}% osakkeista</span>
      </div>

      {/* Layer 1: Share Power Bar */}
      <div className="relative h-6 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
        {/* YES Segment */}
        {yesPercent > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="h-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-help"
                  style={{ width: `${yesPercent}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-emerald-600">
                  JAA: {yesShares.toLocaleString()} osaketta (
                  {yesPercent.toFixed(1)}%)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* NO Segment */}
        {noPercent > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="h-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-help"
                  style={{ width: `${noPercent}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-rose-600">
                  EI: {noShares.toLocaleString()} osaketta (
                  {noPercent.toFixed(1)}%)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* ABSTAIN Segment */}
        {abstainPercent > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="h-full bg-slate-400 hover:bg-slate-500 transition-colors cursor-help"
                  style={{ width: `${abstainPercent}%` }}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-bold text-slate-500">
                  TYHJÄÄ: {abstainShares.toLocaleString()} osaketta (
                  {abstainPercent.toFixed(1)}%)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* Quorum Marker Overlay */}
        <div
          className="absolute top-0 bottom-0 border-l-2 border-dashed border-slate-900/40 z-10 pointer-events-none"
          style={{ left: `${quorumPercentage}%` }}
        >
          <span className="absolute -top-6 -left-3 text-[10px] font-bold text-slate-500 bg-white/80 px-1 rounded shadow-sm">
            Q
          </span>
        </div>
      </div>

      {/* Legend / Status */}
      <div className="flex justify-between text-[10px] text-slate-400">
        <div className="flex gap-3">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> JAA
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" /> EI
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-400" /> TYHJÄÄ
          </span>
        </div>
        <div>
          {totalVotedShares.toLocaleString()} / {totalShares.toLocaleString()}{" "}
          osaketta
        </div>
      </div>
    </div>
  );
}
