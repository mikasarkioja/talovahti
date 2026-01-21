import { prisma } from "@/lib/db";
import { HistoryView } from "@/components/maintenance/HistoryView";
import { RenovationStatus } from "@prisma/client";

// Force dynamic rendering - this page needs real-time database access
export const dynamic = "force-dynamic";

export default async function MaintenanceHistoryPage() {
  const renovations = await prisma.renovation.findMany({
    orderBy: { plannedYear: "asc" },
  });

  // Transform Prisma objects to Store objects (handling nulls)
  const mappedRenovations = renovations.map((r) => ({
    id: r.id,
    component: r.component,
    yearDone: r.yearDone || undefined,
    plannedYear: r.plannedYear || undefined,
    cost: r.cost,
    expectedLifeSpan: r.expectedLifeSpan,
    description: r.description,
    status: r.status as RenovationStatus, // Ensure enum match
  }));

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <HistoryView initialRenovations={mappedRenovations as any} />
  );
}
