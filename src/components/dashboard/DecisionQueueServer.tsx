import { prisma } from "@/lib/db";
import { fetchInvoicesAction } from "@/app/actions/invoice-actions";
import { DecisionQueue, DecisionItem } from "./DecisionQueue";
import {
  TriageLevel,
  RenovationTriageStatus,
  RenovationCategory,
} from "@prisma/client";

export async function DecisionQueueServer({
  housingCompanyId,
}: {
  housingCompanyId: string;
}) {
  // 1. Fetch Invoices from Fennoa Mock
  const invoicesResult = await fetchInvoicesAction();

  // 2. Fetch Critical/Escalated Tickets from DB
  const tickets = await prisma.ticket.findMany({
    where: {
      housingCompanyId,
      status: "OPEN",
      OR: [
        { triageLevel: TriageLevel.CRITICAL },
        { triageLevel: TriageLevel.ESCALATED },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch Pending Renovation Notifications
  const renovations = await prisma.renovation.findMany({
    where: {
      housingCompanyId,
      triageStatus: {
        in: [
          RenovationTriageStatus.PENDING,
          RenovationTriageStatus.AUTO_APPROVE_READY,
          RenovationTriageStatus.REQUIRES_EXPERT,
        ],
      },
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  interface FennoaInvoice {
    id: string;
    invoiceNumber: string;
    vendorName: string;
    amount: number;
    dueDate: string;
    status: string;
  }

  // 4. Map to DecisionItem format
  const invoiceItems: DecisionItem[] =
    invoicesResult.success && invoicesResult.data
      ? (invoicesResult.data as FennoaInvoice[]).map((inv) => ({
          id: inv.id,
          type: "INVOICE" as const,
          title: `Ostolasku #${inv.invoiceNumber}`,
          vendor: inv.vendorName,
          amount: inv.amount,
          dueDate: inv.dueDate,
          invoiceNumber: inv.invoiceNumber,
          xpReward: 50,
        }))
      : [];

  const triageItems: DecisionItem[] = tickets.map((t) => ({
    id: t.id,
    type: "TRIAGE" as const,
    title: `Vikailmoitus: ${t.title} - ${t.unitIdentifier || "Yleiset tilat"}`,
    vendor: "Huoltoeskalaatio",
    amount: t.triageLevel === TriageLevel.CRITICAL ? 1500 : 450, // Mocked assessment cost
    xpReward: t.triageLevel === TriageLevel.CRITICAL ? 300 : 150,
    description: t.description,
    huoltoNotes: t.huoltoNotes || undefined,
  }));

  const renovationItems: DecisionItem[] = renovations.map((r) => {
    let recommendation = "Suositus: Tarkasta huolellisesti";
    if (r.category === RenovationCategory.SURFACE) {
      recommendation = "Suositus: Hyväksy (Matalan riskin pintaremontti)";
    } else if (
      r.category === RenovationCategory.LVI ||
      r.category === RenovationCategory.STRUCTURAL
    ) {
      recommendation = "Suositus: Vaatii asiantuntijatarkastuksen";
    }

    return {
      id: r.id,
      type: "RENOVATION" as const,
      title: `Muutostyö: ${r.component} (${r.user?.name || "Osakas"})`,
      amount: 0,
      xpReward: 50,
      description: r.description || "",
      recommendation: r.aiAssessment || recommendation,
    };
  });

  const allItems = [...invoiceItems, ...triageItems, ...renovationItems];

  return <DecisionQueue items={allItems} />;
}
