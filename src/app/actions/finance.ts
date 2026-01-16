"use server";

import { prisma } from "@/lib/db";
import { InvoiceStatus } from "@prisma/client";

export async function getFinanceAggregates(companyId: string, year: number) {
  try {
    // 1. Aggregate Actual Expenses from Invoices
    const expenseStats = await prisma.invoice.groupBy({
      by: ["category"],
      where: {
        housingCompanyId: companyId,
        dueDate: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
        status: InvoiceStatus.PAID, // Only count realized expenses
      },
      _sum: {
        amount: true,
      },
    });

    // 2. Fetch Budgeted Amounts for Comparison
    const budgetItems = await prisma.budgetLineItem.findMany({
      where: {
        housingCompanyId: companyId,
        year: year,
      },
    });

    // 3. Monthly Trend Aggregation (for Bar Charts)
    // Note: Using "invoices" table name as per @@map in schema
    // and "housingCompanyId" column.
    const monthlyTrendRaw: { month: number; total: number }[] =
      await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "dueDate")::int as month,
        SUM(amount) as total
      FROM "invoices"
      WHERE "housingCompanyId" = ${companyId} 
        AND "status" = 'PAID'
        AND EXTRACT(YEAR FROM "dueDate") = ${year}
      GROUP BY EXTRACT(MONTH FROM "dueDate")
      ORDER BY month ASC
    `;

    // Normalize monthly trend (fill missing months)
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const found = monthlyTrendRaw.find((r) => r.month === m);
      return {
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        total: found ? Number(found.total) : 0,
      };
    });

    // 4. Formatting the data for the Frontend
    const categories = expenseStats.map((stat) => {
      const budget = budgetItems.find((b) => b.category === stat.category);
      const actual = Number(stat._sum.amount || 0);
      const budgeted = Number(budget?.budgetedAmount || 0);
      return {
        category: stat.category,
        actual,
        budgeted,
        variance: budgeted - actual,
      };
    });

    // Add categories that have budget but no expenses
    budgetItems.forEach((b) => {
      if (!categories.find((c) => c.category === b.category)) {
        categories.push({
          category: b.category,
          actual: 0,
          budgeted: Number(b.budgetedAmount),
          variance: Number(b.budgetedAmount),
        });
      }
    });

    const totalActual = categories.reduce((acc, curr) => acc + curr.actual, 0);
    const totalBudgeted = categories.reduce(
      (acc, curr) => acc + curr.budgeted,
      0,
    );

    return {
      success: true,
      data: {
        categories,
        monthlyTrend,
        totalActual,
        totalBudgeted,
      },
    };
  } catch (error) {
    console.error("Finance Aggregation Error:", error);
    return { success: false, error: "Failed to aggregate financial data." };
  }
}
