import { prisma } from "@/lib/db";
import { InitiativeCard } from "@/components/governance/InitiativeCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GovernancePage() {
  const housingCompanyId = "default-company-id"; // In production, get from session/context

  // 1. Fetch Company Totals for "Power Circle" calculations
  // We need total shares to calculate quorum and percentages
  const company = await prisma.housingCompany.findUnique({
    where: { id: housingCompanyId },
    select: {
      apartments: {
        select: {
          shareCount: true,
        },
      },
    },
  });

  // Fallback if totalShares not set, sum from apartments
  const calculatedTotalShares =
    company?.apartments.reduce(
      (sum: number, apt: { shareCount: number }) => sum + apt.shareCount,
      0,
    ) || 0;
  const totalShares = calculatedTotalShares || 10000;
  const totalApartments = company?.apartments.length || 0;

  // 2. Fetch Initiatives with Votes
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
      <header className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Päätöksenteko</h1>
          <p className="text-slate-500 mt-1">
            Hallitse yhtiökokousasioita ja äänestä osakemääräisellä
            äänivallalla.
          </p>
        </div>
        <Button className="bg-[#002f6c] hover:bg-blue-900">
          <Plus className="w-4 h-4 mr-2" />
          Uusi Aloite
        </Button>
      </header>

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
            />
          ))
        )}
      </div>
    </div>
  );
}
