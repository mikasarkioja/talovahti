import { prisma } from "@/lib/db";
import { fetchInvoicesAction } from "@/app/actions/invoice-actions";
import { DecisionQueue, DecisionItem } from "./DecisionQueue";
import { TriageLevel } from "@prisma/client";

export async function DecisionQueueServer({ housingCompanyId }: { housingCompanyId: string }) {
  // 1. Fetch Invoices from Fennoa Mock
  const invoicesResult = await fetchInvoicesAction();
  
  // 2. Fetch Critical/Escalated Tickets from DB
  const tickets = await prisma.ticket.findMany({
    where: {
      housingCompanyId,
      status: "OPEN",
      OR: [
        { triageLevel: TriageLevel.CRITICAL },
        { triageLevel: TriageLevel.ESCALATED }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  interface FennoaInvoice {
    id: string;
    invoiceNumber: string;
    vendorName: string;
    amount: number;
    dueDate: string;
    status: string;
  }

  // 3. Map to DecisionItem format
  const invoiceItems: DecisionItem[] = (invoicesResult.success && invoicesResult.data) 
    ? (invoicesResult.data as FennoaInvoice[]).map((inv) => ({
        id: inv.id,
        type: "INVOICE" as const,
        title: `Ostolasku #${inv.invoiceNumber}`,
        vendor: inv.vendorName,
        amount: inv.amount,
        dueDate: inv.dueDate,
        invoiceNumber: inv.invoiceNumber,
        xpReward: 50
      }))
    : [];

  const triageItems: DecisionItem[] = tickets.map(t => ({
    id: t.id,
    type: "TRIAGE" as const,
    title: t.title,
    vendor: "Huoltoeskalaatio",
    amount: t.triageLevel === TriageLevel.CRITICAL ? 1500 : 450, // Mocked assessment cost
    xpReward: t.triageLevel === TriageLevel.CRITICAL ? 300 : 150,
    description: t.description
  }));

  const allItems = [...invoiceItems, ...triageItems];

  return <DecisionQueue items={allItems} />;
}
