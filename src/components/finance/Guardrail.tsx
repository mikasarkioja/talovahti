"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Lock,
  ChevronRight,
  UserCheck,
  Scale,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

interface GuardrailProps {
  amount: number;
  onApprove: () => void;
  title: string;
  children: React.ReactNode;
  healthScore?: number;
}

/**
 * Smart Guardrail component to prevent unauthorized high-value board decisions
 * and provide motivational expert guidance.
 */
export function Guardrail({
  amount,
  onApprove,
  title,
  children,
  healthScore,
}: GuardrailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const AUTHORITY_LIMIT = 5000;
  const MAJOR_INVESTMENT_LIMIT = 20000;
  const isHighValue = amount >= AUTHORITY_LIMIT;
  const isMajorInvestment = amount >= MAJOR_INVESTMENT_LIMIT;
  const isLowHealth = healthScore !== undefined && healthScore < 60;

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (isHighValue) {
      e.preventDefault();
      setIsOpen(true);
    } else {
      onApprove();
    }
  };

  return (
    <>
      <div onClick={handleTriggerClick} className="w-full">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-white border-brand-navy/10 sm:max-w-[550px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
              <ShieldAlert className="text-amber-600 w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-center text-brand-navy">
              Smart Guardrail - Päätöksentuki
            </DialogTitle>
            <DialogDescription className="text-center pt-2 font-medium text-slate-600">
              Hanke: <span className="text-brand-navy font-bold">{title}</span>{" "}
              (
              {amount.toLocaleString("fi-FI", {
                style: "currency",
                currency: "EUR",
              })}
              )
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Health Warning Section */}
            {isLowHealth && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                  <Activity size={16} />
                  Kuntoindeksi-varoitus
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Taloyhtiön kuntoindeksi on laskenut hälyttävälle tasolle (
                  {healthScore}). Suosittelemme käyttämään tätä investointia
                  asiantuntijan ohjauksessa kiinteistön arvon säilyttämiseksi.
                </p>
              </div>
            )}

            {/* Regulatory Section */}
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                <Scale size={16} />
                Lakisääteinen huomautus (AsOYL)
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed">
                {isMajorInvestment
                  ? "Tämä hanke ylittää 20 000 € rajan. Huomioi, että suuret investoinnit vaativat yhtiökokouksen 2/3 enemmistöpäätöksen, jos ne eivät ole tavanomaista kunnossapitoa."
                  : `Summa ylittää hallituksen yleisen 5 000 € toimivallan. Varmista, että budjetissa on varattu tilaa tai yhtiökokous on myöntänyt valtuutuksen.`}
              </p>
            </div>

            {/* motivational Expert Section */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <UserCheck size={16} />
                Asiantuntijan suositus
              </div>
              <p className="text-[11px] text-blue-900 leading-relaxed">
                Tämä hanke on merkittävä. Suosittelemme tilaamaan riippumattoman
                valvojan tai asiantuntijan markkinapaikalta varmistaaksesi
                hallituksen vastuuvapauden ja laadunvarmistuksen.
              </p>
              <div className="pt-2">
                <Link href="/board/marketplace">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[10px] font-bold bg-white border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    Selaa asiantuntijoita
                    <ChevronRight size={12} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3 px-2">
              <div className="p-1 mt-0.5 bg-slate-100 rounded text-slate-500">
                <Lock size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Audit Trail
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Vahvistamalla hyväksynnän, merkintä lisätään hallituksen
                  viralliseen AuditLog-lokitiedostoon.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              className="flex-1 text-slate-500 hover:text-slate-700"
              onClick={() => setIsOpen(false)}
            >
              Peruuta
            </Button>
            <Button
              className="flex-1 bg-brand-navy hover:bg-brand-navy/90 text-white font-bold"
              onClick={() => {
                onApprove();
                setIsOpen(false);
              }}
            >
              Vahvista valtuutus & Hyväksy
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
