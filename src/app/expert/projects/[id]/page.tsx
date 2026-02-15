// src/app/expert/projects/[id]/page.tsx
import { prisma } from "@/lib/db";
import { RBAC } from "@/lib/auth/rbac";
import { UserRole } from "@prisma/client";
import { ShieldAlert, MapPinned, Activity, Camera, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpertRecommendationForm } from "@/components/expert/ExpertRecommendationForm";
import { Button } from "@/components/ui/button";

export default async function ExpertProjectPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id: ticketId } = await props.params;
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  // 1. Fetch Expert User (Support Dev Switcher)
  const company = await prisma.housingCompany.findFirst();
  if (!company)
    return <div className="p-10 text-center">Taloyhtiötä ei löytynyt.</div>;

  let expert;
  if (userQuery) {
    expert = await prisma.user.findFirst({
      where: { email: { contains: userQuery, mode: "insensitive" } },
    });
  }

  if (!expert) {
    expert = await prisma.user.findFirst({
      where: { role: UserRole.EXPERT },
    });
  }

  if (!expert || expert.role !== UserRole.EXPERT) {
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        Pääsy evätty. Vain asiantuntijoilla on pääsy tähän näkymään.
      </div>
    );
  }

  // 2. Project Isolation: Fetch ONLY this ticket and its context
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      apartment: true,
      housingCompany: true,
      createdBy: true,
      observation: {
        include: {
          project: {
            include: {
              tenders: {
                where: { status: "OPEN" },
                include: { bids: true },
              },
            },
          },
        },
      },
    },
  });

  if (!ticket || ticket.housingCompanyId !== company.id) {
    return (
      <div className="p-20 text-center">
        Tehtävää ei löytynyt tai sinulla ei ole oikeutta siihen.
      </div>
    );
  }

  // 3. Log Interaction: "Asiantuntija katsoi kuvat" (and the task)
  await RBAC.auditAccess(
    expert.id,
    "READ",
    `Ticket:${ticket.id}`,
    "Asiantuntija tarkasteli tehtävän tietoja ja kuvia",
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black text-[10px] uppercase tracking-widest">
            Asiantuntijatoimeksianto
          </Badge>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
            {ticket.title}
          </h1>
          <p className="text-slate-500 font-medium">
            Kohde: {ticket.unitIdentifier} • {ticket.housingCompany.name}
          </p>
        </div>
        <div className="flex gap-3">
          <Badge
            variant="outline"
            className="h-8 border-slate-200 bg-white font-bold px-3"
          >
            ID: {ticket.id.slice(-6).toUpperCase()}
          </Badge>
          <Badge className="h-8 bg-blue-900 font-bold px-3">
            {ticket.triageLevel}
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photos and Description */}
          <Card className="border-slate-200 shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Camera size={18} className="text-blue-600" /> Tekninen
                oirekuvaus ja kuvat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 relative overflow-hidden group">
                {ticket.imageUrl ? (
                  <img
                    src={ticket.imageUrl}
                    alt="Vikakuva"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center gap-2">
                    <Camera size={48} />
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Ei kuvaa saatavilla
                    </p>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs font-black uppercase tracking-widest">
                    Klikkaa nähdäksesi täysi koko
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest">
                  Kuvaus
                </h3>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {ticket.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                    <Key size={14} className="text-blue-600" /> Pääsy
                    huoneistoon
                  </h3>
                  <p className="text-sm text-slate-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    {ticket.accessInfo || "Ei annettuja ohjeita."}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-600" />{" "}
                    Järjestelmän huomiot
                  </h3>
                  <p className="text-sm text-red-700 bg-red-50/50 p-4 rounded-xl border border-red-100 italic">
                    {ticket.huoltoNotes || "Ei erityisiä huomioita."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spatial Metadata (3D Location) */}
          <Card className="border-slate-200 shadow-lg rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <MapPinned size={18} className="text-emerald-600" />{" "}
                Sijaintitieto (Spatial Metadata)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-48 h-48 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-2xl relative">
                  <div className="absolute inset-0 border border-emerald-500/10 rounded-2xl animate-pulse" />
                  <Activity size={48} className="opacity-50" />
                  <p className="absolute bottom-4 text-[8px] font-mono uppercase tracking-tighter text-emerald-500/60">
                    BIM Layer Active
                  </p>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Kerros
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {ticket.apartment?.floor || "3"}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase">
                        Linja
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        B-linja (Vesi)
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    Sijainti on mapattu digitaaliseen kaksoseen. Tämä auttaa
                    hahmottamaan vian yhteyden talon teknisiin järjestelmiin.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Recommendation Form if there is a tender */}
          {ticket.observation?.project?.tenders[0] && (
            <ExpertRecommendationForm
              tender={ticket.observation.project.tenders[0]}
              userId={expert.id}
            />
          )}
        </div>

        {/* Sidebar Context */}
        <div className="space-y-8">
          {/* Building Health Context */}
          <Card className="border-slate-200 shadow-lg rounded-3xl overflow-hidden bg-slate-900 text-white">
            <CardHeader className="border-b border-white/10">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-emerald-400">
                <Activity size={16} /> Kiinteistön kuntoindeksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-400 uppercase">
                  Yleisarvosana
                </p>
                <p className="text-2xl font-black text-emerald-400">
                  {ticket.housingCompany.healthScore}/100
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Tekninen kunto</span>
                    <span>{ticket.housingCompany.healthScoreTechnical}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${ticket.housingCompany.healthScoreTechnical}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>Taloudellinen tila</span>
                    <span>{ticket.housingCompany.healthScoreFinancial}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${ticket.housingCompany.healthScoreFinancial}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic leading-relaxed">
                Tämä tehtävä vaikuttaa suoraan tekniseen kuntoindeksiin.
                Nopealla reagoinnilla minimoidaan huoltovelan kasvu.
              </p>
            </CardContent>
          </Card>

          {/* Isolation Notice */}
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-widest">
              <ShieldAlert size={16} /> Projektieristys
            </div>
            <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
              Näet vain tämän nimenomaisen tehtävän tiedot. Pääsy muuhun
              taloyhtiön dataan on rajattu GDPR-vaatimusten mukaisesti.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <Button className="w-full h-14 bg-brand-navy hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">
              Anna kustannusarvio
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest border-slate-200 text-slate-600"
            >
              Pyydä lisätietoja
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
