// src/app/resident/renovations/new/page.tsx
import { prisma } from "@/lib/db";
import { RenovationNotificationForm } from "@/components/resident/RenovationNotificationForm";
import { UserRole } from "@prisma/client";

export default async function NewRenovationPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  const company = await prisma.housingCompany.findFirst();

  if (!company) {
    return <div className="p-10 text-center">Taloyhtiötä ei löytynyt.</div>;
  }

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
      where: {
        housingCompanyId: company.id,
        role: UserRole.RESIDENT,
      },
    });
  }

  if (!user) {
    // Fallback to any user if no resident found
    user = await prisma.user.findFirst({
      where: { housingCompanyId: company.id },
    });
  }

  if (!user) {
    return <div className="p-10 text-center">Käyttäjää ei löytynyt.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
          Uusi muutostyöilmoitus
        </h1>
        <p className="text-slate-500 font-medium">
          Ilmoita suunnitellusta remontista taloyhtiölle. Järjestelmä tekee
          automaattisen riskianalyysin ja ohjaa ilmoituksen hallitukselle.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <RenovationNotificationForm
            userId={user.id}
            housingCompanyId={user.housingCompanyId}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4 items-start">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-blue-600 font-bold">i</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-blue-900 uppercase text-xs tracking-widest">
            Tarkastusvelvollisuus
          </h3>
          <p className="text-sm text-blue-800/80 leading-relaxed">
            Asunto-osakeyhtiölain mukaan osakkaan on ilmoitettava kunnossapito-
            tai muutostyöstä yhtiölle etukäteen, jos se voi vaikuttaa yhtiön tai
            toisen osakkeenomistajan hallinnassa olevien tilojen käyttämiseen.
          </p>
        </div>
      </div>
    </div>
  );
}
