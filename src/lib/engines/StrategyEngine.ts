import {
  MockFinance,
  MockRenovation,
  MockObservation,
  MockTicket,
} from "@/lib/store";

export class StrategyEngine {
  /**
   * Calculates Energy Intensity (E-Value approximation)
   * @param totalConsumptionKwh Total annual energy consumption
   * @param totalAreaM2 Total heated floor area
   * @returns kWh/m²
   */
  static calculateEnergyIntensity(
    totalConsumptionKwh: number,
    totalAreaM2: number,
  ): number {
    if (totalAreaM2 === 0) return 0;
    return Math.round((totalConsumptionKwh / totalAreaM2) * 10) / 10;
  }

  /**
   * Calculates a Maintenance Backlog Score (0-100)
   * 100 = No backlog, perfect condition
   * < 50 = Critical backlog
   */
  static calculateMaintenanceBacklogScore(
    observations: any[],
    renovations: any[],
    tickets: any[],
  ): number {
    let score = 100;

    // 1. Open Observations (-2 per item, but higher penalty for critical severity)
    const openObservations = observations.filter((o) => o.status === "OPEN");
    openObservations.forEach((o) => {
      // Penalty based on severity grade (1: Critical, 4: Low)
      const severity = o.severityGrade || 3;
      const penalty = severity === 1 ? 15 : severity === 2 ? 8 : 2;
      score -= penalty;
    });

    // 2. Overdue Renovations (-15 per item)
    const currentYear = new Date().getFullYear();
    const overdueRenovations = renovations.filter(
      (r) =>
        r.status === "PLANNED" && r.plannedYear && r.plannedYear < currentYear,
    ).length;
    score -= overdueRenovations * 15;

    // 3. Active Critical Tickets (-10 per item)
    const criticalTickets = tickets.filter(
      (t) =>
        t.status !== "CLOSED" &&
        t.status !== "RESOLVED" &&
        (t.priority === "CRITICAL" || t.priority === "HIGH"),
    ).length;
    score -= criticalTickets * 10;

    return Math.max(0, score);
  }

  /**
   * Generates a Financial Health Grade (A-E)
   * Based on fee collection rate and relative indebtedness.
   */
  static calculateFinancialHealthScore(finance: any): {
    grade: string;
    score: number;
  } {
    // If the data is coming from getFinanceAggregates (real DB data)
    if (finance.score) {
      return { 
        grade: finance.score, 
        score: Math.round(finance.utilization || 0) 
      };
    }

    const { collectionPercentage, companyLoansTotal } = finance;

    // Simplistic Property Value Est: 2.6M (Hardcoded for mock context)
    const ESTIMATED_PROPERTY_VALUE = 2600000;
    const ltv = (companyLoansTotal / ESTIMATED_PROPERTY_VALUE) * 100;

    let baseScore = 0;

    // Collection Impact (0-50 pts)
    if (collectionPercentage >= 99) baseScore += 50;
    else if (collectionPercentage >= 95) baseScore += 40;
    else if (collectionPercentage >= 90) baseScore += 20;
    else baseScore += 0;

    // LTV Impact (0-50 pts)
    if (ltv < 20) baseScore += 50;
    else if (ltv < 40) baseScore += 40;
    else if (ltv < 60) baseScore += 20;
    else baseScore += 0;

    let grade = "E";
    if (baseScore >= 90) grade = "A";
    else if (baseScore >= 75) grade = "B";
    else if (baseScore >= 60) grade = "C";
    else if (baseScore >= 40) grade = "D";

    return { grade, score: baseScore };
  }

  // --- PHYSICS CONSTANTS ---
  static readonly KLOSS_CONSTANT = 0.85; // Heat loss coefficient (W/K) per m2 envelope (mock)
  static readonly WINTER_MODE_THRESHOLD = -5; // Degrees Celsius
  static readonly SNOW_ALERT_THRESHOLD = 5; // cm
}
