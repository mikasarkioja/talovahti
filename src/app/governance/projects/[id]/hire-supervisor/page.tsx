// src/app/governance/projects/[id]/hire-supervisor/page.tsx
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { BiddingComparisonUI } from "@/components/governance/BiddingComparisonUI";
import { notFound } from "next/navigation";

export default async function HireSupervisorPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id: projectId } = await props.params;
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  // 1. Fetch Board User (Support Dev Switcher)
  const company = await prisma.housingCompany.findFirst();
  if (!company)
    return <div className="p-10 text-center">Taloyhtiötä ei löytynyt.</div>;

  let user;
  if (userQuery) {
    user = await prisma.user.findFirst({
      where: { email: { contains: userQuery, mode: "insensitive" } },
    });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: UserRole.BOARD_MEMBER, housingCompanyId: company.id },
    });
  }

  if (
    !user ||
    (user.role !== UserRole.BOARD_MEMBER && user.role !== UserRole.ADMIN)
  ) {
    return (
      <div className="p-20 text-center text-red-600 font-bold">
        Pääsy evätty. Vain hallituksen jäsenillä on pääsy tarjousvertailuun.
      </div>
    );
  }

  // 2. Fetch Project and Tenders
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tenders: {
        where: { type: "SUPERVISOR" },
        include: { bids: { orderBy: { aiScore: "desc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  // 3. Get the active supervisor tender
  const tender = project.tenders[0];

  if (!tender) {
    return (
      <div className="p-20 text-center space-y-4">
        <h2 className="text-2xl font-black uppercase text-slate-900">
          Ei aktiivisia tarjouskilpailuja
        </h2>
        <p className="text-slate-500">
          Tälle projektille ei ole vielä luotu valvojakilpailutusta.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <BiddingComparisonUI tender={tender} userId={user.id} />
    </div>
  );
}
