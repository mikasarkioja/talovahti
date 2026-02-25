// src/app/digital-twin/page.tsx
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { DigitalTwinClient } from "@/components/digital-twin/DigitalTwinClient";

export default async function DigitalTwinPage({
  searchParams,
}: {
  searchParams: { user?: string };
}) {
  const userEmail = searchParams.user;

  // Find user and company
  let user = null;
  if (userEmail) {
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { apartment: true },
    });
  }

  const company = await prisma.housingCompany.findFirst({
    where: user ? { id: user.housingCompanyId } : {},
    include: {
      tickets: true,
      initiatives: {
        include: { votes: { include: { apartment: true } } },
      },
    },
  });

  if (!user || !company) {
    // Fallback or error
    return <div>Ladataan...</div>;
  }

  const initialData = {
    currentUser: {
      id: user.id,
      name: user.name || "Unknown",
      role: user.role,
      apartmentId: user.apartment?.apartmentNumber || null,
      housingCompanyId: company.id,
    },
    housingCompany: company,
    tickets: company.tickets,
    initiatives: company.initiatives,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <DigitalTwinClient initialData={JSON.parse(JSON.stringify(initialData))} />
      </main>
    </div>
  );
}
