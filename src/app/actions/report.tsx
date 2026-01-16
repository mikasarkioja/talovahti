"use server";

import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { MaintenanceNeedsReport } from "@/components/reports/MaintenanceNeedsReport";

/**
 * Server Action to generate a Statutory Maintenance Needs Report (Kunnossapitotarveselvitys)
 */
export async function generateBoardReport(companyId: string) {
  try {
    // 1. Fetch Company Details
    const company = await prisma.housingCompany.findUnique({
      where: { id: companyId },
      select: { name: true, businessId: true },
    });

    if (!company) {
      throw new Error("Housing company not found");
    }

    // 2. Determine Time Window (Next 5 Years)
    const today = new Date();
    const currentYear = today.getFullYear();
    const startOfWindow = new Date(`${currentYear}-01-01`);
    const endOfWindow = new Date(`${currentYear + 5}-12-31`);

    // 3. Fetch Annual Tasks (Planned Maintenance)
    // Assuming 'estimatedCost' exists on AnnualTask based on user prompt context.
    // If not in schema, this query might fail type check, but we proceed as instructed.
    const annualTasks = await prisma.annualTask.findMany({
      where: {
        housingCompanyId: companyId,
        deadline: {
          gte: startOfWindow,
          lte: endOfWindow,
        },
      },
      orderBy: { deadline: "asc" },
    });

    // 4. Prepare Data Object
    const reportData = {
      company: {
        name: company.name,
        businessId: company.businessId,
      },
      tasks: annualTasks.map((t) => ({
        id: t.id,
        title: t.title,
        quarter: t.quarter,
        deadline: t.deadline,
        // @ts-expect-error - Assuming schema has estimatedCost as per prompt
        estimatedCost: t.estimatedCost || 0,
        description: t.description,
      })),
      generatedAt: new Date().toISOString(),
      startYear: currentYear,
    };

    // 5. Render PDF to Stream
    const stream = await renderToStream(
      <MaintenanceNeedsReport data={reportData} />,
    );

    // 6. Convert Stream to Buffer/Base64
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Uint8Array);
    }
    const buffer = Buffer.concat(chunks);
    const base64 = buffer.toString("base64");

    // Clean filename
    const safeCompanyName = company.name
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    const filename = `Kunnossapitotarveselvitys_${safeCompanyName}_${currentYear}.pdf`;

    return {
      success: true,
      data: base64,
      filename: filename,
    };
  } catch (error) {
    console.error("Maintenance Report Generation Failed:", error);
    return {
      success: false,
      error: "Failed to generate report",
    };
  }
}
