"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Hammer,
  ArrowRight,
  ExternalLink,
  Mail,
  ShieldCheck,
  Clock,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ContractorDemoPage() {
  const [isSending, setIsSending] = useState(false);

  const simulateMagicLink = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast.success("Magic Link lähetetty urakoitsijan sähköpostiin!", {
        description: "matti.urakoitsija@example.com",
      });
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] font-black uppercase tracking-widest">
            Urakoitsijan näkymä (Demo)
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            Matti Urakoitsija
          </h1>
          <p className="text-slate-500 font-medium italic">
            &quot;Sujuvampaa urakointia digitaalisen kaksosen avulla.&quot;
          </p>
        </div>
        <div className="w-16 h-16 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-center shadow-sm">
          <Hammer className="text-orange-600" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-600" />
                Avoimet tarjouspyynnöt
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 font-bold"
              >
                1 Uusi
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            <div className="p-6 space-y-4 hover:bg-slate-50 transition-colors group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Vesivuodon korjaus (Kellarikerros)
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    As Oy Esimerkki • Helsinki
                  </p>
                </div>
                <Badge variant="destructive" className="animate-pulse">
                  KRIITTINEN
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>DL: 24h sisällä</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>YSE 1998 valmis</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Link href="/public/bid/demo-token-123" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs h-11 gap-2">
                    Avaa Tarjouslomake <ExternalLink size={14} />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={simulateMagicLink}
                  disabled={isSending}
                  className="px-4 h-11 border-slate-200 hover:bg-white text-slate-600"
                >
                  <Mail
                    size={18}
                    className={isSending ? "animate-bounce" : ""}
                  />
                </Button>
              </div>
            </div>

            <div className="p-6 flex flex-col items-center justify-center text-center space-y-2 opacity-40 grayscale">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">
                Aiemmat projektit
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Ei muita avoimia tarjouspyyntöjä tällä hetkellä.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-emerald-100 bg-emerald-50 shadow-none overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-emerald-700 tracking-widest flex items-center gap-2">
                <Zap size={14} className="fill-emerald-500" /> Magic Link
                -simulaatio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[11px] text-emerald-800/80 leading-relaxed font-medium">
                Magic Link mahdollistaa urakoitsijan pääsyn kohteeseen ja
                tarjouslomakkeelle ilman tunnusten luomista.
              </p>
              <Button
                variant="outline"
                onClick={simulateMagicLink}
                disabled={isSending}
                className="w-full bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-[10px] font-black uppercase h-10 gap-2 shadow-sm"
              >
                {isSending ? "Lähetetään..." : "Testaa Magic Linkkiä"}
                {!isSending && <ArrowRight size={12} />}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50 shadow-none overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle size={16} />
                <h3 className="text-xs font-bold uppercase tracking-tight">
                  Audit Trail
                </h3>
              </div>
              <p className="text-[10px] text-amber-800/70 font-medium leading-relaxed italic">
                &quot;Kaikki toimenpiteet ja sähköiset allekirjoitukset
                tallentuvat yhtiön lohkoketjuun.&quot;
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Zap({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 14.71L12 2.29l.61 7.11 7.39-1.39-8 12.42-.61-7.11-7.39 1.39z" />
    </svg>
  );
}
