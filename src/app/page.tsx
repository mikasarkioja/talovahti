import { prisma } from "@/lib/db";
import { HomeClient } from "@/components/dashboard/HomeClient";
import { getAnnualClockData } from "@/app/actions/governance";
import { getFinanceAggregates } from "@/app/actions/finance";
import { getHealthStatusAction } from "@/app/actions/health-actions";
import { fetchInvoicesAction } from "@/app/actions/invoice-actions";
import { RBAC } from "@/lib/auth/rbac";
import { headers } from "next/headers";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

/**
 * UI/Feature Audit Report - Talovahti MVP
 * --------------------------------------
 * Hidden or Hard-to-Find Features Identified:
 * 1. GDPR Audit Logs: Located at /admin/privacy/audit. Essential for compliance.
 * 2. Ops Board: Located at /admin/ops. The primary workflow tool for management.
 * 3. Building Physics / Energy ROI: Located at /board/roi. Advanced board-level analytics.
 * 4. Technical Verdicts: Currently mixed into generic Observation cards; needs dedicated focus.
 * 5. Strategic Health Grades (A-E): Calculated in StrategyEngine but under-surfaced in dashboard.
 * 6. Annual Clock Management: Currently dashboard-only; may need full-screen admin view.
 */

export const dynamic = "force-dynamic";

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  try {
    if (process.env.NODE_ENV === "development") {
      const dbUrl = process.env.DATABASE_URL;
      const maskedUrl = dbUrl
        ? dbUrl.includes("@")
          ? `...${dbUrl.split("@")[1]}`
          : "Invalid URL format"
        : "Undefined";
      console.log("---------------------------------------------------");
      console.log("🔍 Next.js Database Connection Debug:");
      console.log("   URL Host:", maskedUrl);
      console.log("---------------------------------------------------");
    }

    const currentYear = new Date().getFullYear();

    // 1. Fetch Housing Company
    // If userQuery is an email, first find the user to get their companyId
    let userByEmail = null;
    if (userQuery) {
      userByEmail = await prisma.user.findFirst({
        where: { email: { contains: userQuery, mode: "insensitive" } },
        include: { apartment: true, housingCompany: true },
      });
    }

    const company = await prisma.housingCompany.findFirst({
      where: userByEmail ? { id: userByEmail.housingCompanyId } : {},
      select: {
        id: true,
        name: true,
        businessId: true,
        address: true,
        maintenanceFeePerShare: true,
        financeFeePerShare: true,
        healthScore: true,
        healthScoreTechnical: true,
        healthScoreFinancial: true,
        unpaidInvoicesCount: true,
        realTimeCash: true,
        buildingConfig: true,
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
        budgetLines: {
          select: {
            id: true,
            category: true,
            budgetedAmount: true,
            actualSpent: true,
            year: true,
          },
        },
        invoices: {
          select: {
            id: true,
            amount: true,
            vendorName: true,
            category: true,
            status: true,
            dueDate: true,
            description: true,
            externalId: true,
            yTunnus: true,
            projectId: true,
            approvedById: true,
            imageUrl: true,
            createdAt: true,
          },
        },
        fiscalConfig: true,
        strategicGoals: true,
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
        projects: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            description: true,
            createdAt: true,
            warrantyEndDate: true,
            estimatedCost: true,
            milestones: {
              select: {
                id: true,
                projectId: true,
                title: true,
                amount: true,
                dueDate: true,
                status: true,
              },
            },
            siteReports: {
              select: {
                id: true,
                projectId: true,
                authorId: true,
                content: true,
                timestamp: true,
                imageUrl: true,
              },
            },
            changeOrders: {
              select: {
                id: true,
                projectId: true,
                title: true,
                costImpact: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
        boardProfile: true,
      },
    });

    const companyId = company?.id || "default-company-id";

    // 2. Fetch User (Dynamic Switcher)
    let user: unknown = userByEmail;
    if (!user && userQuery) {
      user = await prisma.user.findFirst({
        where: {
          housingCompanyId: companyId,
          email: { contains: userQuery, mode: "insensitive" },
        },
        include: { apartment: true },
      });
    } else if (user) {
      // Include apartment for the user we already found
      user = await prisma.user.findUnique({
        where: { id: (user as { id: string }).id },
        include: { apartment: true },
      });
    }

    // Fallback to default Board Member if no query or user not found
    if (!user) {
      user = await prisma.user.findFirst({
        where: { housingCompanyId: companyId, role: UserRole.BOARD_MEMBER },
        include: { apartment: true },
      });
    }

    interface UserTyped {
      id: string;
      role: UserRole;
      name: string | null;
      email: string;
      apartment: {
        apartmentNumber: string;
        shareCount: number;
      } | null;
      canApproveFinance: boolean;
      housingCompanyId: string;
    }
    const typedUser = user as UserTyped;

    if (typedUser?.role === UserRole.RESIDENT) {
      const url = userQuery ? `/resident?user=${userQuery}` : "/resident";
      redirect(url);
    }

    const [clockResult, financeAggregates, healthResult, invoicesResult] =
      await Promise.all([
        getAnnualClockData(companyId, currentYear),
        getFinanceAggregates(companyId, currentYear),
        getHealthStatusAction(companyId),
        fetchInvoicesAction(),
      ]);

    // 2.5 Audit Log for Board Dashboard View
    if (
      typedUser &&
      (typedUser.role === UserRole.BOARD_MEMBER ||
        typedUser.role === UserRole.ADMIN)
    ) {
      const headerList = await headers();
      const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
      await RBAC.auditAccess(
        typedUser.id,
        "READ",
        `HousingCompany:${companyId}`,
        "Hallituksen päätöksenteko (Dashboard näkymä)",
        ip,
      );
    }

    // Default empty data if fetch fails
    const annualClockData =
      clockResult.success && clockResult.data
        ? clockResult.data
        : {
            fiscalYearStart: 1,
            monthlyGroups: Array.from({ length: 12 }, (_, i) => ({
              month: i + 1,
              tasks: [],
            })),
            totalTasks: 0,
            completedTasks: 0,
          };

    const financeData =
      financeAggregates.success && financeAggregates.data
        ? financeAggregates.data
        : {
            monthlyIncome: 12500,
            monthlyTarget: 12000,
            reserveFund: 45000,
            energyCostDiff: -150,
            collectionPercentage: 98.5,
            companyLoansTotal: 450000,
            energySavingsPct: 12.5,
          };

    // 3. Prepare Initial Data for Store
    const initialData =
      company && typedUser
        ? {
            currentUser: {
              id: typedUser.id,
              name: typedUser.name || "Unknown",
              role: typedUser.role,
              email: typedUser.email || "",
              apartmentId: typedUser.apartment?.apartmentNumber || null,
              housingCompanyId: company.id,
              shareCount: typedUser.apartment?.shareCount || 0,
              canApproveFinance: typedUser.canApproveFinance,
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
              id: t.id,
              title: t.title,
              description: t.description,
              status: t.status,
              category: t.category,
              triageLevel: t.triageLevel,
              priority: t.priority,
              type: t.type,
              apartmentId: t.apartment?.apartmentNumber || null,
              createdAt: t.createdAt,
              date: t.createdAt,
              createdById: t.createdById,
              observationId: t.observationId,
            })),
            initiatives: company.initiatives.map((i) => ({
              id: i.id,
              title: i.title,
              description: i.description,
              status: i.status,
              userId: i.userId,
              votes: i.votes.map((v) => ({
                userId: v.userId,
                choice: v.choice,
                shares: v.shares,
                apartmentId: v.apartmentId,
                apartment: { apartmentNumber: v.apartment.apartmentNumber },
              })),
              createdAt: i.createdAt,
            })),
            invoices: [
              ...company.invoices.map((inv) => ({
                id: inv.id,
                amount: Number(inv.amount),
                vendorName: inv.vendorName,
                category: inv.category,
                status: inv.status,
                dueDate: inv.dueDate,
                description: inv.description,
                externalId: inv.externalId,
                yTunnus: inv.yTunnus,
                projectId: inv.projectId,
                approvedById: inv.approvedById,
                imageUrl: inv.imageUrl,
                createdAt: inv.createdAt,
              })),
              ...(invoicesResult.success && invoicesResult.data
                ? invoicesResult.data.map((inv) => ({
                    id: inv.id,
                    amount: inv.amount,
                    vendorName: inv.vendorName,
                    status: inv.status,
                    dueDate: new Date(inv.dueDate),
                    invoiceNumber: inv.invoiceNumber,
                    isExternal: true,
                  }))
                : []),
            ],
            budgetLines: company.budgetLines.map((bl) => ({
              id: bl.id,
              category: bl.category,
              budgetedAmount: Number(bl.budgetedAmount),
              actualSpent: Number(bl.actualSpent),
              year: bl.year,
            })),
            fiscalConfig: company.fiscalConfig
              ? { ...company.fiscalConfig }
              : null,
            strategicGoals: company.strategicGoals,
            finance: financeData,
            health: healthResult.success ? healthResult.data : null,
            boardProfile:
              typedUser.role === UserRole.BOARD_MEMBER ||
              typedUser.role === UserRole.ADMIN
                ? company.boardProfile
                : null,
            // Ensure MockStore required fields are present (empty arrays if not fetched)
            renovations: company.renovations.map((r) => ({
              id: r.id,
              component: r.component,
              yearDone: r.yearDone || undefined,
              plannedYear: r.plannedYear || undefined,
              cost: r.cost,
              expectedLifeSpan: r.expectedLifeSpan,
              description: r.description,
              status: r.status,
            })),
            observations: company.observations.map((o) => ({
              id: o.id,
              component: o.component,
              description: o.description,
              status: o.status,
              severityGrade: o.severityGrade,
              technicalVerdict: o.technicalVerdict,
              boardSummary: o.boardSummary,
              projectId: o.projectId,
              createdAt: o.createdAt,
            })),
            projects: company.projects.map((p) => ({
              id: p.id,
              title: p.title,
              type: p.type,
              status: p.status,
              description: p.description,
              createdAt: p.createdAt,
              milestones: p.milestones.map((m) => ({
                id: m.id,
                projectId: m.projectId,
                title: m.title,
                amount: m.amount,
                dueDate: m.dueDate,
                status: m.status,
              })),
              warrantyEndDate: p.warrantyEndDate,
              siteReports: p.siteReports.map((sr) => ({
                id: sr.id,
                projectId: sr.projectId,
                authorId: sr.authorId,
                content: sr.content,
                timestamp: sr.timestamp,
                imageUrl: sr.imageUrl,
              })),
              changeOrders: p.changeOrders.map((co) => ({
                id: co.id,
                projectId: co.projectId,
                title: co.title,
                costImpact: co.costImpact,
                status: co.status,
                createdAt: co.createdAt,
              })),
              tenders: [],
            })),
            valuation: null, // Will be fetched client-side by ValueIntelligenceCard
            feed: [],
          }
        : null;

    return (
      <HomeClient
        annualClockData={annualClockData}
        initialData={JSON.parse(JSON.stringify(initialData))}
      />
    );
  } catch (error) {
    console.error("Database Connection Failed:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-xl">
          <h2 className="mb-2 text-xl font-bold text-red-600">
            Tietokantayhteys Epäonnistui
          </h2>
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-800 font-mono break-all">
            {String(error)}
          </div>
          <p className="mb-4 text-sm text-slate-600">Varmista, että:</p>
          <ul className="mb-4 list-disc pl-5 text-xs text-slate-500 space-y-1">
            <li>Tietokantapalvelin on käynnissä</li>
            <li>
              .env -tiedoston <code>DATABASE_URL</code> on oikein
            </li>
            <li>
              Jos käytät <code>.env.local</code> tiedostoa, se ei sisällä vanhaa
              URLia
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
