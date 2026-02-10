import { prisma } from "@/lib/db";
import { Suspense } from "react";
import { TicketsClient } from "./TicketsClient";

// Separate Server Component to fetch data
async function TicketsPageServer() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: { apartment: true },
  });

  const company = await prisma.housingCompany.findFirst();
  const boardUser = await prisma.user.findFirst({
    where: { role: "BOARD", housingCompanyId: company?.id },
  });

  return (
    <TicketsClient
      initialTickets={JSON.parse(JSON.stringify(tickets))}
      context={{ companyId: company?.id, userId: boardUser?.id }}
    />
  );
}

export default function TicketsPage() {
  return (
    <Suspense fallback={<div>Ladataan...</div>}>
      <TicketsPageServer />
    </Suspense>
  );
}
