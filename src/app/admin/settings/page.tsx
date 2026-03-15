import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { HjtSyncButton } from "@/components/admin/HjtSyncButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminSettingsPage() {
  const session = await getSession();
  const userPayload = session?.user as { id: string; role: string } | undefined;

  if (
    !userPayload ||
    (userPayload.role !== "ADMIN" && userPayload.role !== "BOARD_MEMBER")
  ) {
    redirect("/");
  }

  // Fetch the current housing company (simplified for demo)
  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: { housingCompanyId: true },
  });

  if (!user) {
    return <div>Käyttäjää ei löytynyt.</div>;
  }

  const company = await prisma.housingCompany.findUnique({
    where: { id: user.housingCompanyId },
    select: { id: true, name: true, mmlBuildingId: true, businessId: true },
  });

  if (!company) {
    return <div>Taloyhtiötä ei löytynyt.</div>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-black text-brand-navy tracking-tight">
              Järjestelmäasetukset
            </h1>
            <p className="text-slate-500">
              Hallinnoi taloyhtiön {company.name} teknisiä integraatioita.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-brand-navy">
                  Maanmittauslaitos (HJT2)
                </CardTitle>
                <CardDescription>
                  Synkronoi osakasluettelo ja osakeryhmätiedot suoraan
                  Huoneistotietojärjestelmään (HTJ).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      MML Rakennustunnus
                    </span>
                    <span className="font-mono text-brand-navy">
                      {company.mmlBuildingId || "Ei asetettu"}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Y-Tunnus
                    </span>
                    <span className="font-mono text-brand-navy">
                      {company.businessId}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2">
                    Tiedonsiirto
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Käynnistämällä siirron lähetät nykyisen osakasluettelon
                    XML-muodossa Maanmittauslaitoksen HJT2-rajapintaan. Toiminto
                    vaatii voimassa olevan varmenteen (MML_CERTIFICATE).
                  </p>
                  <HjtSyncButton housingCompanyId={company.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
