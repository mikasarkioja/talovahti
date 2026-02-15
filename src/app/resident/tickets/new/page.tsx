// src/app/resident/tickets/new/page.tsx
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { ResidentTicketForm } from "@/components/resident/ResidentTicketForm";

export default async function NewTicketPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  const company = await prisma.housingCompany.findFirst();
  if (!company)
    return (
      <div className="p-10 text-center text-white">
        Taloyhtiötä ei löytynyt.
      </div>
    );

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
      where: { housingCompanyId: company.id, role: UserRole.RESIDENT },
    });
  }

  if (!user) {
    return (
      <div className="p-10 text-center text-white">Käyttäjää ei löytynyt.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8 bg-white min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">
          Uusi vikailmoitus
        </h1>
        <p className="text-slate-500 font-medium italic">
          Kuvaile vika mahdollisimman tarkasti minimoidaksesi asiantuntijan
          käynnit.
        </p>
      </div>

      <div className="bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 md:p-8">
        <ResidentTicketForm
          userId={user.id}
          housingCompanyId={company.id}
          apartmentNumber={user.apartmentNumber || "Yleiset tilat"}
        />
      </div>
    </div>
  );
}
