import { getFinanceAggregates } from "@/app/actions/finance";
import { FinanceScore } from "@/components/finance/FinanceScore";
import { BudgetMirror } from "@/components/finance/BudgetMirror";
import { InvestmentSection } from "@/components/finance/InvestmentSection";
import { PurchaseInvoices } from "@/components/finance/PurchaseInvoices";
import { OrderCertificate } from "@/components/finance/OrderCertificate";
import { Wallet } from "lucide-react";

import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Force dynamic rendering - this page needs real-time database access
export const dynamic = "force-dynamic";

export default async function FinancePage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const userQuery =
    typeof searchParams.user === "string" ? searchParams.user : undefined;

  // 1. Fetch User (Support Dev Switcher)
  let user;
  if (userQuery) {
    user = await prisma.user.findFirst({
      where: {
        email: { contains: userQuery, mode: "insensitive" },
      },
    });
  }

  if (!user) {
    user = await prisma.user.findFirst({
      where: { role: UserRole.BOARD_MEMBER },
    });
  }

  if (!user || (user.role !== "BOARD_MEMBER" && user.role !== "ADMIN")) {
    return (
      <div className="p-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Pääsy kielletty</h1>
        <p className="text-slate-500">
          Vain hallituksella on pääsy talousnäkymään.
        </p>
      </div>
    );
  }

  const companyId = user.housingCompanyId;
  const currentYear = 2026;

  const result = await getFinanceAggregates(companyId, currentYear);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Virhe tietojen latauksessa
        </h2>
        <p className="text-slate-500">Yritä myöhemmin uudelleen.</p>
      </div>
    );
  }

  const { data } = result;

  const financeScoreData = {
    ...data,
    monthlyTrend: data.monthlyTrend.map((m, i) => ({
      month: i + 1,
      actual: m.total,
      budgeted: 0,
    })),
  };

  // Transform for BudgetMirror
  const budgetLines = data.categories.map((c, i) => ({
    id: `cat-${i}`,
    category: c.category,
    budgetedAmount: c.budgeted,
    actualSpent: c.actual,
    year: currentYear,
  }));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-[#002f6c]" />
            Talous & Budjetti
          </h1>
          <p className="text-slate-500 mt-1">
            Seuraa vastikkeita ja budjetin toteumaa reaaliajassa.
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Operational Finance */}
        <div className="space-y-8">
          {/* Resident Self-Service: Order Certificate */}
          <OrderCertificate />

          {/* Bills Waiting for Approval */}
          <PurchaseInvoices />

          {/* New Strategic Gauge */}
          <FinanceScore data={financeScoreData} />

          {/* Detailed Breakdown */}
          <BudgetMirror items={budgetLines} />
        </div>

        {/* Right Column: Strategic Investment */}
        <InvestmentSection />
      </div>
    </div>
  );
}
