"use server";

import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { getFinanceAggregates } from "./finance";
import { BoardReportTemplate } from "@/components/reports/BoardReportTemplate";

/**
 * Server Action to generate a Board Strategy Report (PDF)
 */
export async function generateBoardReport(companyId: string) {
  try {
    // 1. Fetch Company Details
    const company = await prisma.housingCompany.findUnique({
      where: { id: companyId },
      select: { name: true },
    });

    if (!company) {
      throw new Error("Housing company not found");
    }

    // 2. Fetch Financial Data
    const currentYear = new Date().getFullYear();
    const financeResult = await getFinanceAggregates(companyId, currentYear);

    // 3. Fetch Annual Tasks (Maintenance & Statutory)
    const annualTasks = await prisma.annualTask.findMany({
      where: {
        companyId: companyId,
        // We could filter by year if AnnualTask has a year field, but schema has 'deadline'.
        // Let's assume we want active tasks or tasks for this fiscal cycle.
        // For simplicity, fetching all non-completed or recently completed.
      },
      orderBy: { deadline: "asc" },
    });

    // Filter Statutory
    const statutoryTasks = annualTasks.filter(
      (t) => t.isStatutory && !t.completedAt,
    );

    // Filter Upcoming (Active, not statutory per se, or just next steps)
    // Let's just take tasks that are not completed.
    const upcomingTasks = annualTasks
      .filter((t) => !t.completedAt)
      .map((t) => ({
        title: t.title,
        quarter: t.quarter,
        category: t.category,
      }));

    // 4. Prepare Data Object
    const reportData = {
      companyName: company.name,
      generatedAt: new Date().toISOString(),
      finance: {
        totalActual:
          financeResult.success && financeResult.data
            ? financeResult.data.totalActual
            : 0,
        totalBudgeted:
          financeResult.success && financeResult.data
            ? financeResult.data.totalBudgeted
            : 0,
        categories:
          financeResult.success && financeResult.data
            ? financeResult.data.categories
            : [],
      },
      maintenance: {
        statutory: statutoryTasks.map((t) => ({
          title: t.title,
          dueDate: t.deadline ? t.deadline.toISOString() : null,
          description: t.description,
        })),
        upcoming: upcomingTasks,
      },
    };

    // 5. Render PDF to Stream
    const stream = await renderToStream(
      <BoardReportTemplate data={reportData} />,
    );

    // 6. Convert Stream to Buffer/Base64
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString("base64");

    return {
      success: true,
      data: base64,
      filename: `hallitusraportti-${currentYear}.pdf`,
    };
  } catch (error) {
    console.error("Board Report Generation Failed:", error);
    return {
      success: false,
      error: "Failed to generate report",
    };
  }
}
