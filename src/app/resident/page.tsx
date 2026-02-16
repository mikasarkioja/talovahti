// src/app/resident/page.tsx
import { prisma } from "@/lib/db";
import {
  Bell,
  PenTool,
  CalendarClock,
  Hammer,
  Info,
  ChevronRight,
  ShieldCheck,
  Users,
  Box,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { UserRole, ResidentTaskStatus } from "@prisma/client";

export default async function ResidentDashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  // 1. Fetch User and Company
  const company = await prisma.housingCompany.findFirst();
  if (!company)
    return <div className="p-10 text-center">Taloyhtiötä ei löytynyt.</div>;

  let user;
  if (userQuery) {
    user = await prisma.user.findFirst({
      where: {
        housingCompanyId: company.id,
        email: { contains: userQuery, mode: "insensitive" },
      },
      include: { apartment: true },
    });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: {
        housingCompanyId: company.id,
        role: UserRole.RESIDENT,
      },
      include: { apartment: true },
    });
  }

  if (!user) {
    return <div className="p-10 text-center">Käyttäjää ei löytynyt.</div>;
  }

  // Ensure isolation: Resident can only see their own data
  // 2. Fetch User Data
  const isBoard = user.role === UserRole.BOARD_MEMBER || user.role === UserRole.ADMIN;

  const [tickets, renovations, volunteerTasks, announcements] =
    await Promise.all([
      prisma.ticket.findMany({
        where: isBoard ? {} : { createdById: user.id },
        include: { createdBy: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.renovation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Mocking bookings for now as model is generic
      prisma.volunteerTask.findMany({
        where: { status: ResidentTaskStatus.OPEN },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Announcements from AuditLog or Initiatives
      prisma.initiative.findMany({
        where: {
          housingCompanyId: company.id,
          status: { in: ["OPEN_FOR_SUPPORT", "APPROVED"] },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  // Fetch fees if user is a shareholder/board member
  let financialInfo = null;
  if (
    user.role === UserRole.BOARD_MEMBER ||
    user.role === UserRole.SHAREHOLDER
  ) {
    const apartment = await prisma.apartment.findUnique({
      where: { id: user.apartmentId || undefined },
    });
    if (apartment) {
      const maintenanceFee =
        Number(company.maintenanceFeePerShare) * apartment.shareCount;
      const capitalFee =
        Number(company.financeFeePerShare) * apartment.shareCount;
      financialInfo = {
        maintenanceFee,
        capitalFee,
        total: maintenanceFee + capitalFee,
        shareCount: apartment.shareCount,
      };
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <Badge
            variant="outline"
            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-50"
          >
            {user.role === UserRole.BOARD_MEMBER
              ? "Hallituksen jäsen"
              : user.role === UserRole.SHAREHOLDER
                ? "Osakasportaali"
                : "Asukasportaali"}
          </Badge>
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
            Hei, {user.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 font-medium">
            Tervetuloa kotisi digitaaliseen hallintapaneeliin.
          </p>
        </div>
        <div className="flex items-center gap-6">
          {financialInfo && (
            <div className="hidden xl:flex items-center gap-4 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <div className="text-right">
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                  Kuukausivastike yhteensä
                </p>
                <p className="text-lg font-black text-emerald-900">
                  {financialInfo.total.toFixed(2)} €
                </p>
              </div>
              <div className="h-8 w-px bg-emerald-200" />
              <div className="text-[10px] text-emerald-700 font-bold">
                <p>Hoito: {financialInfo.maintenanceFee.toFixed(2)} €</p>
                <p>Rahoitus: {financialInfo.capitalFee.toFixed(2)} €</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Oma asunto
              </p>
              <p className="text-sm font-bold text-slate-900">
                {user.apartmentNumber || (user as any).apartment?.apartmentNumber || "Ei määritetty"}
              </p>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
              <ShieldCheck className="text-emerald-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Announcements & Tickets */}
        <div className="lg:col-span-2 space-y-8">
          {/* Announcements */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Bell size={14} /> Tiedotteet ja Aloitteet
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {announcements.map((ann) => (
                <Card
                  key={ann.id}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Info size={20} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {format(ann.createdAt, "d. MMMM yyyy", {
                            locale: fi,
                          })}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase font-bold"
                        >
                          {ann.status}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-slate-900">{ann.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {ann.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {announcements.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm italic">
                  Ei uusia tiedotteita.
                </div>
              )}
            </div>
          </section>

          {/* Maintenance Tickets */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <PenTool size={14} /> {isBoard ? "Kaikki vikailmoitukset" : "Omat vikailmoitukset"}
              </h2>
              <Link href="/resident/tickets/new">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] font-black uppercase tracking-widest gap-1"
                >
                  Uusi ilmoitus <ChevronRight size={12} />
                </Button>
              </Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2 h-2 rounded-full ${t.status === "OPEN" ? "bg-amber-400" : "bg-emerald-400"}`}
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {t.title} {isBoard && t.unitIdentifier && `- ${t.unitIdentifier}`}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-medium">
                        Päivitetty {format(t.createdAt, "d.M.yyyy")} {isBoard && t.createdBy?.name && `• ${t.createdBy.name}`}
                      </p>
                    </div>
                  </div>
                  <Badge className="text-[9px] font-bold">{t.status}</Badge>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                  Ei aiempia vikailmoituksia.
                </div>
              )}
            </div>
          </section>

          {/* Renovations - Hide for RESIDENT */}
          {user.role !== UserRole.RESIDENT && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Hammer size={14} /> Omat muutostyöilmoitukset
                </h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y">
                {renovations.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 flex flex-col gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Hammer size={16} />
                        </div>
                        <p className="font-bold text-slate-900">{r.component}</p>
                      </div>
                      <Badge
                        className={`text-[9px] font-bold ${
                          r.triageStatus === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.triageStatus === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.triageStatus === "APPROVED"
                          ? "HYVÄKSYTTY"
                          : r.triageStatus === "REJECTED"
                            ? "HYLJÄTTY"
                            : r.triageStatus === "AUTO_APPROVE_READY"
                              ? "VALMIS HYVÄKSYTTÄVÄKSI"
                              : r.triageStatus === "REQUIRES_EXPERT"
                                ? "VAATII ASIANTUNTIJAN"
                                : "ODOTTAA"}
                      </Badge>
                    </div>

                    {r.aiAssessment && (
                      <div className="bg-slate-100/50 p-3 rounded-xl border border-slate-200/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                          <ShieldCheck size={10} /> Järjestelmän vastaus
                        </p>
                        <p className="text-xs text-slate-600 font-medium italic">
                          &quot;{r.aiAssessment}&quot;
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Ilmoitettu {format(r.createdAt, "d.M.yyyy")}</span>
                      <span>
                        {r.category === "SURFACE"
                          ? "Pintamateriaalit"
                          : r.category === "LVI"
                            ? "LVI-työ"
                            : r.category === "ELECTRICAL"
                              ? "Sähkötyö"
                              : r.category === "STRUCTURAL"
                                ? "Rakenteellinen"
                                : r.category}
                      </span>
                    </div>
                  </div>
                ))}
                {renovations.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm italic">
                    Ei aiempia muutostyöilmoituksia.
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Bookings & Tasks */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
              Pikavalinnat
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <Link href="/digital-twin">
                <Button className="w-full justify-start gap-3 h-14 bg-gradient-to-r from-blue-600 to-brand-navy hover:from-blue-700 hover:to-slate-900 text-white rounded-xl shadow-lg shadow-blue-900/20">
                  <Box size={20} className="text-brand-emerald" />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest leading-none">
                      Digitaalinen Kaksonen
                    </p>
                    <p className="text-[10px] opacity-70 font-medium">
                      Tutki taloa 3D-muodossa
                    </p>
                  </div>
                </Button>
              </Link>
              <Link href="/resident/initiatives">
                <Button className="w-full justify-start gap-3 h-14 bg-brand-navy hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200">
                  <Users size={20} />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest leading-none">
                      Osakasaloitteet
                    </p>
                    <p className="text-[10px] opacity-70 font-medium">
                      Tee aloite tai kannata muita
                    </p>
                  </div>
                </Button>
              </Link>
              <Link href="/booking">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-14 rounded-xl border-slate-200 hover:bg-slate-50"
                >
                  <CalendarClock size={20} className="text-slate-600" />
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest leading-none text-slate-900">
                      Varaa sauna
                    </p>
                    <p className="text-[10px] opacity-70 font-medium text-slate-500">
                      Tai pesutupa / kerhotila
                    </p>
                  </div>
                </Button>
              </Link>
              <Link href="/resident/renovations/new">
                <Button
                  variant="outline"
                  disabled={user.role === UserRole.RESIDENT}
                  className="w-full justify-start gap-3 h-14 rounded-xl border-slate-200 hover:bg-slate-50"
                >
                  <Hammer size={20} className="text-slate-600" />
                  <div className="text-left text-slate-900">
                    <p className="text-xs font-black uppercase tracking-widest leading-none">
                      Muutostyöilmoitus
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {user.role === UserRole.RESIDENT
                        ? "Vain osakkaille"
                        : "Tee ilmoitus remontista"}
                    </p>
                  </div>
                </Button>
              </Link>
            </div>
          </section>

          {/* Volunteer Tasks */}
          <section className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Hammer size={14} /> Talkoot ja Yhteisö
            </h2>
            <Card className="border-emerald-100 bg-emerald-50/50 shadow-none">
              <CardContent className="p-4 space-y-3">
                {volunteerTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between group"
                  >
                    <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                      {task.title}
                    </p>
                    <Link href={`/tasks`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-emerald-600"
                      >
                        <ChevronRight size={14} />
                      </Button>
                    </Link>
                  </div>
                ))}
                {volunteerTasks.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">
                    Ei avoimia talkootehtäviä.
                  </p>
                )}
                <Separator className="bg-emerald-100 my-2" />
                <Link href="/tasks">
                  <Button
                    variant="link"
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 p-0 h-auto"
                  >
                    Katso kaikki tehtävät
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* Support Widget */}
          <Card className="border-slate-200 bg-slate-900 text-white">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Info size={20} className="text-blue-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold uppercase text-xs tracking-widest">
                  Tarvitsetko apua?
                </h3>
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Huoltoyhtiö palvelee 24/7 kiireellisissä tapauksissa
                  numerossa:
                  <span className="block text-white font-bold mt-1">
                    010 123 4567
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={`h-px w-full ${className}`} />;
}
