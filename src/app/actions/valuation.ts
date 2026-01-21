"use server";

import { prisma } from "@/lib/db";

export async function getBuildingValueMetrics(
  companyId: string,
  areaAvgSqmPrice: number,
) {
  const company = await prisma.housingCompany.findUnique({
    where: { id: companyId },
    include: {
      buildingComponents: true,
      annualTasks: true, // Needed for KAI (Maintenance Activity Index)
    },
  });

  if (!company) return { success: false, error: "Company not found" };

  const currentYear = new Date().getFullYear();
  const totalBuildingSqm = (company.totalSqm as number | null) || 2500;

  // 1. Basic Valuation
  const marketValueEstimate = totalBuildingSqm * areaAvgSqmPrice;

  // 2. PKI (Peruskorjausindeksi) & PH (PTS Horizon)
  // We look specifically for the LVIS/Plumbing component
  const lvisComp = company.buildingComponents.find(
    (c) => c.type === "PLUMBING",
  );
  const pki =
    currentYear -
    (lvisComp?.lastRenovatedYear || company.constructionYear || 1985);
  const ph = Math.max(0, 50 - pki); // 50 years is the standard LVIS cycle

  // 3. KAI (Korjausaktiivisuusindeksi)
  const completedRepairs = company.annualTasks.filter(
    (t) => t.isCompleted,
  ).length;
  const buildingAge = currentYear - (company.constructionYear || 1985);
  const kai = buildingAge > 0 ? (completedRepairs / buildingAge) * 10 : 0;

  // 4. Renovation Metrics & RDR (Renovation Debt Ratio)
  const renovationMetrics = company.buildingComponents.map((comp) => {
    const lastRenovated =
      comp.lastRenovatedYear || company.constructionYear || 1985;
    const expectedLifespan = comp.expectedLifespan || 40;
    const age = currentYear - lastRenovated;
    const remainingLife = expectedLifespan - age;
    const status =
      remainingLife <= 5
        ? "CRITICAL"
        : remainingLife <= 10
          ? "PLANNING"
          : "HEALTHY";

    // Future Investment Need
    const costSqm = comp.estimatedCostSqm || 0;
    const futureCost = costSqm * totalBuildingSqm;

    return {
      name: comp.name,
      age,
      remainingLife,
      status,
      potentialInvestment: futureCost,
      utilityPercentage: Math.max(0, (remainingLife / expectedLifespan) * 100),
    };
  });

  const totalRenovationDebt = renovationMetrics
    .filter((m) => m.status === "CRITICAL")
    .reduce((acc, curr) => acc + curr.potentialInvestment, 0);

  const rdr = (totalRenovationDebt / marketValueEstimate) * 100;

  return {
    success: true,
    data: {
      marketValueEstimate,
      riskAdjustedValue: marketValueEstimate - totalRenovationDebt,
      pki,
      ph,
      kai: parseFloat(kai.toFixed(2)),
      rdr: parseFloat(rdr.toFixed(1)),
      totalRenovationDebt,
      renovationUrgency: renovationMetrics.filter(
        (m) => m.status === "CRITICAL",
      ),
      overallLifeCycleScore:
        renovationMetrics.reduce(
          (acc, curr) => acc + curr.utilityPercentage,
          0,
        ) / renovationMetrics.length,
    },
  };
}
