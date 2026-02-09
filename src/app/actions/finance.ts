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
        status: InvoiceStatus.PAID,
      },
      _sum: { amount: true },
    });

    // 2. Fetch Budgeted Amounts
    const budgetItems = await prisma.budgetLineItem.findMany({
      where: {
        housingCompanyId: companyId,
        year: year,
      },
    });

    // 3. Monthly Trend (Kept your normalization logic)
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

    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const found = monthlyTrendRaw.find((r) => r.month === m);
      return {
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        total: found ? Number(found.total) : 0,
      };
    });

    // 4. Formatting Categories (Merged logic)
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

    // Ensure categories with budget but 0 expenses appear (Crucial for UI)
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

    // 5. NEW: Strategic Health Score Logic (The "Wow Factor")
    const utilization =
      totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;
    let score: "A" | "B" | "C" | "D" | "E" = "A";

    if (utilization > 115)
      score = "E"; // Deeply over budget
    else if (utilization > 105)
      score = "D"; // Slightly over budget
    else if (utilization > 100)
      score = "C"; // On the edge
    else if (utilization > 90)
      score = "B"; // Good
    else score = "A"; // Excellent control

    return {
      success: true,
      data: {
        categories,
        monthlyTrend,
        totalActual,
        totalBudgeted,
        utilization,
        score, // Power the dashboard gauge with this
        reserveFund: 45000, // TODO: Pull from DB when schema supports it
        monthlyIncome: 12500,
        monthlyTarget: 12000,
      },
    };
  } catch (error) {
    console.error("Finance Aggregation Error:", error);
    return { success: false, error: "Failed to aggregate financial data." };
  }
}
