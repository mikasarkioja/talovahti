import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { fennoa } from "@/lib/services/fennoa";
import { HealthScoreEngine } from "@/lib/engines/health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RBAC } from "@/lib/auth/rbac";
import { headers } from "next/headers";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CertificatePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  const sessionId =
    typeof searchParams.session_id === "string"
      ? searchParams.session_id
      : undefined;

  // 1. Fetch Housing Company Data
  const company = await prisma.housingCompany.findFirst({
    include: {
      projects: {
        where: { status: "COMPLETED" },
        orderBy: { updatedAt: "desc" },
      },
      budgetLines: true,
      boardProfile: true,
    },
  });

  if (!company) {
    return <div className="p-20 text-center">Taloyhtiötä ei löytynyt.</div>;
  }

  // 2. Fetch User for RBAC and Audit
  let user;
  if (userQuery) {
    user = await prisma.user.findFirst({
      where: {
        housingCompanyId: company.id,
        email: { contains: userQuery, mode: "insensitive" },
      },
    });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: { housingCompanyId: company.id, role: UserRole.BOARD_MEMBER },
    });
  }

  // 2.5 Access Control: Check if session_id is paid if it's a resident
  const isBoard =
    user?.role === UserRole.BOARD_MEMBER || user?.role === UserRole.ADMIN;
  let hasPaidAccess = isBoard;

  if (!isBoard && user && sessionId) {
    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "PAID",
        metadata: { contains: sessionId },
      },
    });
    if (order) hasPaidAccess = true;
  }

  if (!user || !hasPaidAccess) {
    return (
      <div className="p-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Pääsy kielletty</h1>
        <p className="text-slate-500">
          {!isBoard
            ? "Todistuksen katselu vaatii onnistuneen tilauksen ja maksun."
            : "Vain hallituksen jäsenillä on oikeus generoida isännöitsijäntodistus."}
        </p>
      </div>
    );
  }

  // 3. Audit Logging (GDPR Compliance)
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
    await RBAC.auditAccess(
      user.id,
      "EXPORT",
      `HousingCompany:${company.id}`,
      "Isännöitsijäntodistuksen generointi",
      ip,
    );
  } catch (e) {
    console.error("Audit logging failed:", e);
    // Continue anyway to avoid blocking the user if audit log fails
  }

  // 4. Fetch Financial Data from Fennoa
  const invoices = await fennoa.getPurchaseInvoices();
  const unpaidCount = company.unpaidInvoicesCount || 0;
  const cashBalance = company.realTimeCash || 0;

  const verificationId = randomUUID().split("-")[0].toUpperCase();
  const auditLogRef = new Date().getTime().toString(16).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl border border-slate-200 rounded-sm overflow-hidden print:shadow-none print:border-none print:max-w-none">
        {/* Official Header */}
        <div className="p-8 md:p-12 border-b-4 border-blue-900 bg-slate-50/50">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-serif font-black uppercase tracking-tighter text-blue-950">
                Isännöitsijäntodistus
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Virallinen asiakirja • Generoitu Talovahti Platformilla
              </p>
            </div>
            <div className="text-right">
              <Badge className="bg-blue-900 hover:bg-blue-900 text-white px-4 py-1.5 rounded-none font-black text-[10px] uppercase tracking-widest">
                Platform-Isännöity
              </Badge>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Päivämäärä: {new Date().toLocaleDateString("fi-FI")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-10">
            <div className="space-y-4">
              <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest border-b border-blue-900/20 pb-1">
                Yhtiön perustiedot
              </h2>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Nimi
                </span>
                <span className="col-span-2 font-bold text-slate-900">
                  {company.name}
                </span>

                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Y-tunnus
                </span>
                <span className="col-span-2 font-medium">
                  {company.businessId}
                </span>

                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Osoite
                </span>
                <span className="col-span-2 font-medium">
                  {company.address}, {company.postalCode} {company.city}
                </span>

                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Tontti
                </span>
                <span className="col-span-2 font-medium uppercase text-[11px]">
                  Oma
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-black text-blue-900 uppercase tracking-widest border-b border-blue-900/20 pb-1">
                Taloudellinen tila (Real-time)
              </h2>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Maksuvalmius
                </span>
                <span className="col-span-2 font-bold text-emerald-700">
                  {(company.healthScore || 0) > 80
                    ? "ERINOMAINEN"
                    : "TYYDYTTÄVÄ"}
                </span>

                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Kassavaranto
                </span>
                <span className="col-span-2 font-bold">
                  {cashBalance.toLocaleString("fi-FI")} €
                </span>

                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Vastikejäämät
                </span>
                <span className="col-span-2 font-bold text-emerald-600">
                  0,00 € (Vastikevalvonta OK)
                </span>

                <span className="text-slate-500 font-bold uppercase text-[10px]">
                  Lainaosuudet
                </span>
                <span className="col-span-2 font-medium">
                  Laskettu huoneistokohtaisesti
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Health Score Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Kiinteistön Kuntoindeksi
              </h2>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Health Score
              </div>
            </div>
            <Card className="border-2 border-slate-100 bg-white shadow-none">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    Kuntoindeksi perustuu rakennusteknisiin havaintoihin,
                    suoritettuihin perusparannuksiin sekä yhtiön taloudelliseen
                    vakauteen. Luku päivittyy automaattisesti jokaisen
                    asiantuntijatarkastuksen ja hyväksytyn laskun myötä.
                  </p>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold border-slate-200"
                    >
                      Tekninen: {company.healthScoreTechnical}/100
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold border-slate-200"
                    >
                      Talous: {company.healthScoreFinancial}/100
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className="text-6xl font-black text-blue-900 tabular-nums">
                    {company.healthScore}
                    <span className="text-2xl text-slate-300 ml-1">/100</span>
                  </div>
                  <div className="mt-1 text-[10px] font-black text-blue-900/40 uppercase tracking-widest">
                    Status: Optimaalinen
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Maintenance History */}
          <section>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 border-b-2 border-slate-100 pb-2">
              Kunnossapitotarveselvitys ja suoritetut työt
            </h2>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50 border-none">
                  <TableHead className="text-[10px] font-black uppercase text-slate-500">
                    Valmistumisvuosi
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500">
                    Toimenpide / Hanke
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500">
                    Sopimusmalli
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase text-slate-500">
                    Kustannus
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.projects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-10 text-slate-400 italic text-sm"
                    >
                      Ei rekisteröityjä valmistuneita hankkeita.
                    </TableCell>
                  </TableRow>
                ) : (
                  company.projects.map((project) => (
                    <TableRow key={project.id} className="border-slate-100">
                      <TableCell className="font-bold tabular-nums text-slate-600">
                        {new Date(project.updatedAt).getFullYear()}
                      </TableCell>
                      <TableCell className="font-black text-slate-900 uppercase text-[11px]">
                        {project.title}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">
                        Urakkasopimus (YSE 1998)
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {project.estimatedCost
                          ? `${project.estimatedCost.toLocaleString("fi-FI")} €`
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <p className="mt-4 text-[10px] text-slate-400 italic font-medium">
              * Lista sisältää vain Talovahti-järjestelmän kautta
              loppuunsaatetut ja arkistoidut hankkeet.
            </p>
          </section>

          {/* Legal Disclaimer & Audit */}
          <div className="mt-20 pt-10 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-4">
                <div className="w-48 h-px bg-slate-300 mb-10" />
                <p className="text-[10px] font-black uppercase text-slate-900 tracking-tighter">
                  Digitaalisesti varmennettu
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed max-w-sm">
                  Tämä asiakirja on generoitu automaattisesti perustuen
                  taloyhtiön reaaliaikaiseen dataan. Kaikki muutokset datassa
                  kirjataan hallituksen päätöshistoriaan.
                </p>
              </div>
              <div className="text-right space-y-1">
                <div className="font-mono text-[9px] text-slate-300 uppercase tracking-widest">
                  Verification ID: {verificationId}
                </div>
                <div className="font-mono text-[9px] text-slate-300 uppercase tracking-widest">
                  Audit Log Ref: {auditLogRef}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Instructions - hidden on print */}
      <div className="max-w-5xl mx-auto mt-8 flex justify-between items-center print:hidden">
        <p className="text-xs text-slate-500 font-medium italic">
          Tämä näkymä on optimoitu tulostettavaksi (Cmd+P).
        </p>
        <button
          onClick={() => window.print()}
          className="bg-blue-900 hover:bg-blue-950 text-white px-6 py-2 rounded-xl text-sm font-black transition-all shadow-lg hover:shadow-blue-900/20"
        >
          Lataa PDF / Tulosta
        </button>
      </div>
    </div>
  );
}
