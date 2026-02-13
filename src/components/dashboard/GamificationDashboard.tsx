"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy, Award, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  name: string;
  description: string;
}

interface GamificationDashboardProps {
  totalXP?: number;
  level?: number;
  achievements?: Achievement[];
}

export function GamificationDashboard({
  totalXP = 1250,
  level = 2,
  achievements = [],
}: GamificationDashboardProps) {
  const currentLevelXP = totalXP % 1000;
  const progress = (currentLevelXP / 1000) * 100;

  return (
    <Card className="border-brand-navy/10 bg-white shadow-soft">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Zap size={16} className="text-brand-emerald" />
              Hallituksen aktiviteetti (XP)
            </CardTitle>
            <CardDescription className="text-[10px] text-slate-400">
              Mittaus hallituksen päätöksenteon laadusta ja nopeudesta
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <Badge className="bg-brand-navy text-white text-[10px] font-bold">
              LEVEL {level}
            </Badge>
            <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Vaikutusvalta-taso
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
            <span className="text-slate-500">{totalXP} Kokonais-XP</span>
            <span className="text-brand-navy">{currentLevelXP} / 1000 XP</span>
          </div>
          <Progress
            value={progress}
            className="h-2 bg-slate-100"
            indicatorClassName="bg-brand-emerald"
          />
        </div>

        {/* Achievements / Medals */}
        <div className="space-y-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-1">
            Viimeisimmät saavutukset
          </p>
          <div className="grid grid-cols-1 gap-2">
            {achievements.length > 0 ? (
              achievements.slice(0, 2).map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Trophy size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-brand-navy">
                      {a.name}
                    </p>
                    <p className="text-[9px] text-slate-500">{a.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Award className="mx-auto text-slate-300 mb-1" size={20} />
                <p className="text-[9px] text-slate-400 font-medium italic">
                  Ei vielä mitaleita.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <TrendingUp size={12} className="text-emerald-500" />
              <span>+150 XP viimeisen 7 vrk aikana</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[9px] font-bold text-brand-navy p-0 hover:bg-transparent"
            >
              KAIKKI SAAVUTUKSET
              <ChevronRight size={12} className="ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
