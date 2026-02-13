interface StrategyObservation {
  status: string;
  severityGrade?: number;
}

interface StrategyRenovation {
  status: string;
  plannedYear?: number;
}

interface StrategyTicket {
  status: string;
  priority: string;
}

interface StrategyFinance {
  score?: string;
  utilization?: number;
  collectionPercentage?: number;
  companyLoansTotal?: number;
}

export class StrategyEngine {
  /**
   * Calculates a Maintenance Backlog Score (0-100)
   * 100 = No backlog, perfect condition
   * < 50 = Critical backlog
   */
  static calculateMaintenanceBacklogScore(
    observations: StrategyObservation[],
    renovations: StrategyRenovation[],
    tickets: StrategyTicket[],
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
}
