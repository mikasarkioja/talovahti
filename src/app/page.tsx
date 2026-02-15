import { prisma } from "@/lib/db";
import { HomeClient } from "@/components/dashboard/HomeClient";
import { getAnnualClockData } from "@/app/actions/governance";
import { getFinanceAggregates } from "@/app/actions/finance";
import { getHealthStatusAction } from "@/app/actions/health-actions";
import { fetchInvoicesAction } from "@/app/actions/invoice-actions";
import { RBAC } from "@/lib/auth/rbac";
import { headers } from "next/headers";
import { UserRole } from "@prisma/client";

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
    const company = await prisma.housingCompany.findFirst({
      include: {
        tickets: {
          include: { observation: true, apartment: true },
        },
        initiatives: {
          include: { votes: { include: { apartment: true } } },
        },
        budgetLines: true,
        invoices: true,
        fiscalConfig: true,
        strategicGoals: true,
        renovations: true,
        observations: {
          include: { project: { include: { milestones: true } } },
        },
        projects: {
          include: { milestones: true, siteReports: true, changeOrders: true },
        },
        boardProfile: true,
      },
    });

    const companyId = company?.id || "default-company-id";

    // 2. Fetch User (Dynamic Switcher)
    let user;
    if (userQuery) {
      user = await prisma.user.findFirst({
        where: {
          housingCompanyId: companyId,
          email: { contains: userQuery, mode: "insensitive" },
        },
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

    const clockResult = await getAnnualClockData(companyId, currentYear);
    const financeAggregates = await getFinanceAggregates(
      companyId,
      currentYear,
    );
    const healthResult = await getHealthStatusAction(companyId);
    const invoicesResult = await fetchInvoicesAction();

    // 2.5 Audit Log for Board Dashboard View
    if (
      user &&
      (user.role === UserRole.BOARD_MEMBER ||
        user.role === UserRole.ADMIN)
    ) {
      const headerList = await headers();
      const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
      await RBAC.auditAccess(
        user.id,
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
      company && user
        ? {
            currentUser: {
              id: user.id,
              name: user.name || "Unknown",
              role: user.role,
              apartmentId: user.apartment?.apartmentNumber || null,
              housingCompanyId: company.id,
              shareCount: user.apartment?.shareCount || 0,
              canApproveFinance: user.canApproveFinance,
              personalBalanceStatus: "OK",
              personalDebtShare: 0,
            },
            housingCompany: company,
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
              authorId: i.authorId,
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
              user.role === UserRole.BOARD_MEMBER ||
              user.role === UserRole.ADMIN
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
                timestamp: sr.createdAt,
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
