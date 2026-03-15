// src/app/digital-twin/page.tsx
import { prisma } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";
import { DigitalTwinClient } from "@/components/digital-twin/DigitalTwinClient";
import { UserRole } from "@prisma/client";
import {
  BuildingGenerator,
  BuildingConfig,
} from "@/features/building-model/lib/BuildingGenerator";

import { getSession } from "@/lib/auth/session";

export default async function DigitalTwinPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user: userEmail } = await searchParams;

  // Authentication: Prefer session cookie, fallback to userEmail for backwards compatibility
  const session = await getSession();
  const sessionUser = session?.user as { email?: string } | undefined;
  const targetEmail = sessionUser?.email || userEmail;

  // 1. Fetch Basic Housing Company & User
  let userByEmail = null;
  if (targetEmail) {
    userByEmail = await prisma.user.findFirst({
      where: { email: { contains: targetEmail, mode: "insensitive" } },
      include: { apartment: true },
    });
  }

  const companyBase = await prisma.housingCompany.findFirst({
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
    },
  });

  if (!companyBase) {
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

  const companyId = companyBase.id;

  // 2. Fetch User Context
  let user = userByEmail;
  if (!user) {
    user = await prisma.user.findFirst({
      where: { housingCompanyId: companyId, role: UserRole.BOARD_MEMBER },
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

  // 3. Fetch Relational Data in Parallel
  const [tickets, initiatives, renovations, observations, buildingComponents] =
    await Promise.all([
      prisma.ticket.findMany({
        where: { housingCompanyId: companyId },
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
      }),
      prisma.initiative.findMany({
        where: { housingCompanyId: companyId },
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
      }),
      prisma.renovation.findMany({
        where: { housingCompanyId: companyId },
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
      }),
      prisma.observation.findMany({
        where: { housingCompanyId: companyId },
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
      }),
      prisma.buildingComponent.findMany({
        where: { housingCompanyId: companyId },
        select: {
          id: true,
          meshId: true,
          name: true,
          type: true,
          responsibility: true,
        },
      }),
    ]);

  const initialData = {
    currentUser: {
      id: user.id,
      name: user.name || "Unknown",
      role: user.role,
      email: user.email || "",
      apartmentId: user.apartment?.apartmentNumber || null,
      housingCompanyId: companyId,
      shareCount: user.apartment?.shareCount || 0,
      canApproveFinance: user.canApproveFinance,
      personalBalanceStatus: "OK",
      personalDebtShare: 0,
    },
    housingCompany: {
      ...companyBase,
      healthScore: companyBase.healthScore ?? undefined,
      healthScoreTechnical: companyBase.healthScoreTechnical ?? undefined,
      healthScoreFinancial: companyBase.healthScoreFinancial ?? undefined,
      unpaidInvoicesCount: companyBase.unpaidInvoicesCount ?? undefined,
    },
    buildingLayout: BuildingGenerator.generateLayout(
      (companyBase.buildingConfig as unknown as BuildingConfig) || undefined,
    ),
    tickets: tickets.map((t) => ({
      ...t,
      date: t.createdAt,
      apartmentId: t.apartment?.apartmentNumber || null,
    })),
    initiatives: initiatives.map((i) => ({
      ...i,
      votes: i.votes.map((v) => ({
        ...v,
        apartment: { apartmentNumber: v.apartment.apartmentNumber },
      })),
    })),
    renovations,
    observations,
    buildingComponents,
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
