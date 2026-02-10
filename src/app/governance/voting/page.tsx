import { prisma } from "@/lib/db";
import { InitiativeCard } from "@/components/governance/InitiativeCard";
import { VotingClient } from "./VotingClient";

export const dynamic = "force-dynamic";

export default async function GovernancePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  const firstCompany = await prisma.housingCompany.findFirst();
  const housingCompanyId = firstCompany?.id || "default-company-id";

  // 1. Fetch Company Totals for "Power Circle" calculations
  const company = await prisma.housingCompany.findUnique({
    where: { id: housingCompanyId },
    include: {
      apartments: {
        select: {
          id: true,
          shareCount: true,
        },
      },
    },
  });

  // 2. Fetch User (Dynamic Switcher pattern)
  let user = null;
  if (userQuery) {
    user = await prisma.user.findFirst({
      where: {
        housingCompanyId: housingCompanyId,
        email: { contains: userQuery, mode: "insensitive" },
      },
    });
  }

  // Fallback to default Board Member if no query or user not found
  if (!user && !userQuery) {
    user = await prisma.user.findFirst({
      where: { housingCompanyId: housingCompanyId, role: "BOARD" },
    });
  }

  // Final fallback for development
  if (!user) {
    user = await prisma.user.findFirst({
      where: { housingCompanyId: housingCompanyId },
    });
  }

  // Fallback if totalShares not set, sum from apartments
  const calculatedTotalShares =
    company?.apartments.reduce(
      (sum: number, apt: { shareCount: number }) => sum + apt.shareCount,
      0,
    ) || 0;
  const totalShares = calculatedTotalShares || 10000;
  const totalApartments = company?.apartments.length || 0;

  // 3. Fetch Initiatives with Votes
  const initiatives = await prisma.initiative.findMany({
    where: { housingCompanyId },
    include: {
      votes: {
        include: {
          apartment: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <VotingClient housingCompanyId={housingCompanyId} userId={user?.id} />

      <div className="grid gap-6">
        {initiatives.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500">Ei avoimia aloitteita.</p>
          </div>
        ) : (
          initiatives.map((initiative) => (
            <InitiativeCard
              key={initiative.id}
              initiative={initiative}
              totalShares={totalShares}
              totalApartments={totalApartments}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
