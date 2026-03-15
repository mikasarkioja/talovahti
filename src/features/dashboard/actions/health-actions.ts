"use server";

import { HealthScoreEngine } from "@/lib/engines/health";
import { prisma } from "@/lib/db";

export async function getHealthStatusAction(companyId: string) {
  try {
    const company = await prisma.housingCompany.findUnique({
      where: { id: companyId },
      include: {
        _count: {
          select: {
            observations: { where: { status: "OPEN" } },
          },
        },
      },
    });

    if (!company) throw new Error("Company not found");

    const technical =
      await HealthScoreEngine.calculateTechnicalScore(companyId);
    const financial =
      await HealthScoreEngine.calculateFinancialScore(companyId);

    // Calculate simple maintenance backlog based on observations (mocked value per observation)
    const openObsCount = company._count.observations;
    const maintenanceBacklog = openObsCount * 2500; // Mocked cost per observation

    return {
      success: true,
      data: {
        totalScore: company.healthScore,
        technicalScore: technical,
        financialScore: financial,
        unpaidCount: openObsCount,
        maintenanceBacklog,
      },
    };
  } catch (error) {
    console.error("Get Health Status Error:", error);
    return { success: false, error: "Kuntoindeksin haku epäonnistui." };
  }
}
