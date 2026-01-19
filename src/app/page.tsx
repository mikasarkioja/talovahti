import { prisma } from "@/lib/db";
import { HomeClient } from "@/components/dashboard/HomeClient";
import { getAnnualClockData } from "@/app/actions/governance";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
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
      },
    });

    const companyId = company?.id || "default-company-id";

    // 2. Fetch User (Pekka)
    const user = await prisma.user.findFirst({
      where: { housingCompanyId: companyId, role: "BOARD" },
      include: { apartment: true },
    });

    const clockResult = await getAnnualClockData(companyId, currentYear);

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
            tickets: company.tickets.map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              status: t.status,
              priority: t.priority,
              type: t.type,
              apartmentId: t.apartment?.apartmentNumber || null,
              createdAt: t.createdAt,
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
            invoices: company.invoices.map((inv) => ({
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
            finance: {
              monthlyIncome: 12500,
              monthlyTarget: 12000,
              reserveFund: 45000,
              energyCostDiff: -150,
              collectionPercentage: 98.5,
              companyLoansTotal: 450000,
              energySavingsPct: 12.5,
            },
            renovations: [],
            observations: [],
            projects: [],
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
