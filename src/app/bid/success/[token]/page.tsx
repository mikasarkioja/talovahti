// src/app/bid/success/[token]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ShieldCheck,
  FileText,
  Download,
  PenTool,
} from "lucide-react";
import { generateYSE1998 } from "@/app/actions/contract-actions";

interface SuccessPageProps {
  params: Promise<{ token: string }>;
}

export default async function BidSuccessPage({ params }: SuccessPageProps) {
  const { token } = await params;

  const invitation = await prisma.bidInvitation.findUnique({
    where: { token },
    include: {
      project: true,
      vendor: true,
    },
  });

  // Better way to find the accepted bid for this vendor and project
  const bid = await prisma.tenderBid.findFirst({
    where: {
      vendorId: invitation?.vendorId,
      tender: { projectId: invitation?.projectId },
      status: "ACCEPTED",
    },
  });

  if (!invitation || !bid) {
    notFound();
  }

  const contract = await generateYSE1998(bid.id);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full space-y-8">
        {/* Success Banner */}
        <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Tarjous hyväksytty!
              </h1>
              <p className="text-emerald-100 font-medium">
                Taloyhtiön hallitus on valinnut teidät toteuttajaksi.
              </p>
            </div>
          </div>
          <Badge className="bg-white text-emerald-600 hover:bg-white border-none font-black px-4 py-1">
            STATUS: SOPIMUSVAIHE
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Contract Document */}
          <Card className="lg:col-span-2 border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-400" />
                <span className="font-black uppercase tracking-widest text-sm">
                  Urakkasopimus
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-blue-400 text-blue-400 font-bold uppercase text-[10px]"
              >
                YSE 1998
              </Badge>
            </div>

            <CardContent className="p-10 space-y-10 font-serif text-slate-800">
              <div className="text-center space-y-2 border-b border-slate-100 pb-8">
                <h2 className="text-3xl font-bold uppercase tracking-tighter italic">
                  TALOVAHTI
                </h2>
                <p className="text-xs uppercase tracking-[0.2em] font-sans font-black text-slate-400">
                  Pienurakkasopimus
                </p>
              </div>

              <div className="grid grid-cols-2 gap-12 text-sm font-sans">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Tilaaja
                  </p>
                  <div>
                    <p className="font-bold text-lg">
                      {contract.parties.employer.name}
                    </p>
                    <p className="text-slate-500">
                      {contract.parties.employer.address}
                    </p>
                    <p className="text-slate-500">
                      Y-tunnus: {contract.parties.employer.id}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Urakoitsija
                  </p>
                  <div>
                    <p className="font-bold text-lg">
                      {contract.parties.contractor.name}
                    </p>
                    <p className="text-slate-500">
                      Y-tunnus: {contract.parties.contractor.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">
                  1. Urakan kohde
                </h3>
                <p className="leading-relaxed">{contract.scope}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">
                  2. Urakkahinta ja maksuehdot
                </h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3 font-sans">
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Urakoitsijan osuus (95%)</span>
                    <span>
                      {(
                        contract.financials.contractPrice * 0.95
                      ).toLocaleString("fi-FI")}{" "}
                      €
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Alustan palvelumaksu (5%)</span>
                    <span>
                      {(
                        contract.financials.contractPrice * 0.05
                      ).toLocaleString("fi-FI")}{" "}
                      €
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-2"></div>
                  <div className="flex justify-between text-lg font-black text-slate-900">
                    <span>Yhteensä (alv 0%)</span>
                    <span>
                      {contract.financials.contractPrice.toLocaleString(
                        "fi-FI",
                      )}{" "}
                      €
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-4">
                    {contract.financials.paymentTerms}
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 space-y-4">
                <h3 className="font-black uppercase text-xs tracking-widest text-slate-400">
                  3. Sopimusehdot
                </h3>
                <p className="text-sm italic">{contract.legal}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                  <PenTool size={16} className="text-blue-600" />
                  Allekirjoita
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hyväksymällä sopimuksen vahvistat sitoutumisesi urakan
                  toteuttamiseen annettujen ehtojen mukaisesti.
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-lg shadow-blue-200">
                  Vahvista ja Allekirjoita <ShieldCheck size={18} />
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold text-xs gap-2"
                >
                  Lataa PDF <Download size={16} />
                </Button>
              </CardContent>
            </Card>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-3">
              <h4 className="font-black text-[10px] uppercase text-blue-600 tracking-widest">
                Turvallisuus
              </h4>
              <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                Tämä on virallinen Talovahti-asiakirja. Digitaalinen
                allekirjoitus on juridisesti sitova ja vastaa kynällä tehtyä
                allekirjoitusta (eIDAS-asetus).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
