// src/app/digital-twin/page.tsx
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { DigitalTwinClient } from "@/components/digital-twin/DigitalTwinClient";
import { UserRole } from "@prisma/client";

export default async function DigitalTwinPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user: userEmail } = await searchParams;

  // Find user and company
  let userByEmail = null;
  if (userEmail) {
    userByEmail = await prisma.user.findFirst({
      where: { email: { contains: userEmail, mode: "insensitive" } },
      include: { apartment: true },
    });
  }

  // Fallback to first company if no user context, otherwise use user's company
  const company = await prisma.housingCompany.findFirst({
    where: userByEmail ? { id: userByEmail.housingCompanyId } : {},
    select: {
      id: true,
      name: true,
      businessId: true,
      address: true,
      buildingConfig: true,
      healthScore: true,
      healthScoreTechnical: true,
      healthScoreFinancial: true,
      unpaidInvoicesCount: true,
      tickets: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          category: true,
          triageLevel: true,
          priority: true,
          type: true,
          createdAt: true,
          createdById: true,
          observationId: true,
          apartment: { select: { apartmentNumber: true } },
        },
      },
      initiatives: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          userId: true,
          createdAt: true,
          votes: {
            select: {
              userId: true,
              choice: true,
              shares: true,
              apartmentId: true,
              apartment: { select: { apartmentNumber: true } },
            },
          },
        },
      },
      renovations: {
        select: {
          id: true,
          component: true,
          yearDone: true,
          plannedYear: true,
          cost: true,
          expectedLifeSpan: true,
          description: true,
          status: true,
        },
      },
      observations: {
        select: {
          id: true,
          component: true,
          description: true,
          status: true,
          severityGrade: true,
          technicalVerdict: true,
          boardSummary: true,
          projectId: true,
          createdAt: true,
        },
      },
      buildingComponents: {
        select: {
          id: true,
          meshId: true,
          name: true,
          type: true,
          responsibility: true,
        },
      },
    },
  });

  if (!company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-10">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Taloyhtiötä ei löytynyt
          </h1>
          <p className="text-slate-500">
            Ole hyvä ja valitse käyttäjä testityökalusta.
          </p>
        </div>
      </div>
    );
  }

  // Fallback user if not provided or not found
  let user = userByEmail;
  if (!user) {
    user = await prisma.user.findFirst({
      where: { housingCompanyId: company.id, role: UserRole.BOARD_MEMBER },
      include: { apartment: true },
    });
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-10">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Käyttäjää ei löytynyt
          </h1>
          <p className="text-slate-500">
            Ole hyvä ja valitse käyttäjä testityökalusta.
          </p>
        </div>
      </div>
    );
  }

  const initialData = {
    currentUser: {
      id: user.id,
      name: user.name || "Unknown",
      role: user.role,
      email: user.email || "",
      apartmentId: user.apartment?.apartmentNumber || null,
      housingCompanyId: company.id,
      shareCount: user.apartment?.shareCount || 0,
      canApproveFinance: user.canApproveFinance,
      personalBalanceStatus: "OK",
      personalDebtShare: 0,
    },
    housingCompany: {
      ...company,
      healthScore: company.healthScore ?? undefined,
      healthScoreTechnical: company.healthScoreTechnical ?? undefined,
      healthScoreFinancial: company.healthScoreFinancial ?? undefined,
      unpaidInvoicesCount: company.unpaidInvoicesCount ?? undefined,
    },
    tickets: company.tickets.map((t) => ({
      ...t,
      date: t.createdAt,
      apartmentId: t.apartment?.apartmentNumber || null,
    })),
    initiatives: company.initiatives.map((i) => ({
      ...i,
      votes: i.votes.map((v) => ({
        ...v,
        apartment: { apartmentNumber: v.apartment.apartmentNumber },
      })),
    })),
    renovations: company.renovations,
    observations: company.observations,
    buildingComponents: company.buildingComponents,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        <DigitalTwinClient
          initialData={JSON.parse(JSON.stringify(initialData))}
        />
      </main>
    </div>
  );
}
