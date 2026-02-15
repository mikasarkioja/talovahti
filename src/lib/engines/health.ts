import { prisma } from "@/lib/db";

/**
 * HealthScoreEngine handles the building's physical and financial health.
 * Focuses on the STATE of the asset, regardless of who managed it.
 */
export const HealthScoreEngine = {
/**
 * Recalculates all building health metrics.
 */
export const HealthScoreEngine = {
  async recalculateBuildingHealth(companyId: string, tx?: any) {
    const technical = await this.calculateTechnicalScore(companyId, tx);
    const financial = await this.calculateFinancialScore(companyId, tx);
    const admin = await this.calculateAdminScore();

    const total = Math.round((technical + financial + admin) / 3);
    const client = tx || prisma;

    // Save history
    await client.healthHistory.create({
      data: {
        housingCompanyId: companyId,
        score: total,
        technicalScore: technical,
        financialScore: financial,
      },
    });

    // Update company with sub-scores
    await client.housingCompany.update({
      where: { id: companyId },
      data: {
        healthScore: total,
        healthScoreTechnical: technical,
        healthScoreFinancial: financial,
        healthScoreAdmin: admin,
      },
    });

    return { total, technical, financial, admin };
  },

  /**
   * Technical = 100 - (Open_Observations * Weight)
   */
  async calculateTechnicalScore(companyId: string, tx?: any): Promise<number> {
    const client = tx || prisma;
    const observations = await client.observation.findMany({
      where: { housingCompanyId: companyId, status: "OPEN" },
    });

    let penalty = 0;
    observations.forEach((obs) => {
      // Weight based on severity: Critical=10, Urgent=5, Routine=2
      if (obs.severityGrade === 1) penalty += 10;
      else if (obs.severityGrade === 2) penalty += 5;
      else penalty += 2;
    });

    return Math.max(0, 100 - penalty);
  },

  /**
   * Financial = (Cash / Monthly_Expenses) * Multiplier
   */
  async calculateFinancialScore(companyId: string, tx?: any): Promise<number> {
    const client = tx || prisma;
    const company = await client.housingCompany.findUnique({
      where: { id: companyId },
    });

    if (!company) return 0;

    // Monthly expenses mock (in real app, calculate from Invoice history)
    const avgMonthlyExpenses = 12000;
    const realTimeCash = company.realTimeCash || 0;
    const cashRatio = realTimeCash / avgMonthlyExpenses;

    // Score: 1.0 ratio = 50 pts, 2.0 ratio = 80 pts, 3.0+ = 100 pts
    let score = Math.min(100, Math.round(cashRatio * 30 + 20));

    // Bonus for no unpaid invoices
    if ((company.unpaidInvoicesCount || 0) === 0) score += 10;

    return Math.min(100, score);
  },

  /**
   * Admin = Meeting frequency, voting activity, compliance status.
   */
  async calculateAdminScore(): Promise<number> {
    // Mock logic for admin health
    return 85;
  },
};
