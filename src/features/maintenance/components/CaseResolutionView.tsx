"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Trophy,
  TrendingUp,
  FileDown,
  ArrowRight,
  ShieldCheck,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CaseResolutionViewProps {
  onClose: () => void;
  projectName?: string;
  totalCost?: number;
  savingsManagement?: number;
  savingsAutomation?: number;
  xpReward?: number;
  healthBoost?: [number, number]; // [old, new]
}

export function CaseResolutionView({
  onClose,
  savingsManagement = 850,
  savingsAutomation = 210,
  xpReward = 250,
  healthBoost = [72, 78],
}: CaseResolutionViewProps) {
  const [showXP, setShowXP] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowXP(true), 500);
    const timer2 = setTimeout(() => setShowSummary(true), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden"
      >
        <div className="relative h-32 bg-brand-navy flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-500/20" />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="z-10 flex flex-col items-center"
          >
            <CheckCircle2 className="text-emerald-400 w-12 h-12 mb-2 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
            <h2 className="text-white font-black uppercase tracking-widest text-xl">
              Hanke Päätetty
            </h2>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="p-8 space-y-8">
          <AnimatePresence>
            {showXP && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center space-y-2"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-700 font-black text-sm shadow-sm"
                >
                  <Trophy size={16} className="fill-amber-500" />+ {xpReward} XP
                  ANSAITTU
                </motion.div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Oikeaoppisesta urakkakilpailutuksesta (YSE 1998)
                </p>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="mt-2"
                >
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-bold text-slate-500">
                      LEVEL 3
                    </span>
                    <Badge className="bg-brand-navy text-white text-[8px] font-black uppercase px-2 h-4">
                      Sertifioitu hallitusammattilainen
                    </Badge>
                  </div>
                  <Progress
                    value={85}
                    className="h-1.5 bg-slate-100"
                    indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-600"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {showSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-slate-100 bg-slate-50/50 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-slate-500">
                      <DollarSign size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Taloudellinen säästö
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Perinteinen isännöinti:</span>
                        <span className="line-through">
                          {savingsManagement} €
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-brand-navy">
                        <span>Talovahti-automaatio:</span>
                        <span className="text-emerald-600">
                          {savingsAutomation} €
                        </span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-[10px] font-medium text-slate-500 italic">
                        Platform-säästö tälle hankkeelle:{" "}
                        <span className="text-emerald-600 font-bold">
                          {(savingsManagement - savingsAutomation).toFixed(0)} €
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-100 bg-emerald-50/30 shadow-none">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <TrendingUp size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Yhtiön Kuntoindeksi
                      </span>
                    </div>
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-black text-slate-900">
                        {healthBoost[1]}
                      </span>
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs pb-1">
                        <TrendingUp size={12} />+
                        {healthBoost[1] - healthBoost[0]}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Huoltovelka pieneni ja kiinteistön arvo nousi suoritetun
                      korjauksen myötä.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-900">
                      Digital Compliance 100%
                    </p>
                    <p className="text-[10px] text-blue-700/70 font-medium">
                      Tämä hanke täyttää kaikki sääntöjenmukaisuuden
                      vaatimukset.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-100 gap-2 h-9 px-3"
                >
                  <FileDown size={16} />
                  <span className="text-[10px] font-black uppercase">
                    Pöytäkirja
                  </span>
                </Button>
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-brand-navy hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-12 shadow-lg"
                >
                  Sulje Yhteenveto
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] h-12"
                >
                  Arkistoi Hanke <ArrowRight size={14} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
