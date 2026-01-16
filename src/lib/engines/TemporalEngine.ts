import {
  FiscalConfiguration,
  FiscalQuarter,
  TaskCategory,
} from "@prisma/client";

export class TemporalEngine {
  /**
   * Calculates the relative quarter (Q1-Q4) for a given date based on the fiscal year start month.
   *
   * @param date The date to evaluate
   * @param config The fiscal configuration containing the start month
   * @returns FiscalQuarter (Q1, Q2, Q3, Q4)
   */
  static getRelativeQuarter(
    date: Date,
    config: FiscalConfiguration,
  ): FiscalQuarter {
    const month = date.getMonth() + 1; // 1-12
    const startMonth = config.startMonth;

    // Calculate month index relative to fiscal start (0-11)
    // If startMonth is 1 (Jan), month 1 (Jan) -> 0
    // If startMonth is 7 (July), month 7 (July) -> 0, month 1 (Jan) -> 6
    let relativeMonthIndex = month - startMonth;
    if (relativeMonthIndex < 0) {
      relativeMonthIndex += 12;
    }

    if (relativeMonthIndex < 3) return "Q1";
    if (relativeMonthIndex < 6) return "Q2";
    if (relativeMonthIndex < 9) return "Q3";
    return "Q4";
  }

  /**
   * Generates upcoming statutory deadlines based on the Finnish Housing Companies Act.
   *
   * @param config The fiscal configuration
   * @returns Array of task definitions
   */
  static getUpcomingStatutoryDeadlines(config: FiscalConfiguration) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startMonth = config.startMonth;

    // Calculate fiscal year end date
    // If start is Jan (1), end is Dec (12).
    // If start is July (7), end is June (6) of next year relative to when it started.

    // We need to determine the *current* fiscal year's end date relative to 'today'.
    // Logic:
    // 1. Determine current fiscal year start.
    // 2. Fiscal end is 12 months after start - 1 day.

    let fiscalStartYear = currentYear;
    if (today.getMonth() + 1 < startMonth) {
      fiscalStartYear = currentYear - 1;
    }

    const fiscalStartDate = new Date(fiscalStartYear, startMonth - 1, 1);
    const fiscalEndDate = new Date(fiscalStartYear + 1, startMonth - 1, 0); // Last day of previous month

    const deadlines = [];

    // 1. General Meeting (Yhtiökokous)
    // Requirement: Within 6 months of fiscal year end.
    const yhtiokokousDeadline = new Date(fiscalEndDate);
    yhtiokokousDeadline.setMonth(yhtiokokousDeadline.getMonth() + 6);

    deadlines.push({
      title: "Varsinainen yhtiökokous",
      description:
        "Pidettävä 6kk kuluessa tilikauden päättymisestä (Asunto-osakeyhtiölaki).",
      category: "GOVERNANCE" as TaskCategory,
      statutory: true,
      dueDate: yhtiokokousDeadline,
      quarter: TemporalEngine.getRelativeQuarter(yhtiokokousDeadline, config),
    });

    // 2. Financial Statements (Tilinpäätös)
    // Requirement: Board must sign before auditor checks, usually within 4 months to allow audit before meeting.
    // Let's set a soft deadline 4 months after fiscal end.
    const financialStatementDeadline = new Date(fiscalEndDate);
    financialStatementDeadline.setMonth(
      financialStatementDeadline.getMonth() + 4,
    );

    deadlines.push({
      title: "Tilinpäätöksen allekirjoitus",
      description: "Hallituksen allekirjoitettava ennen tilintarkastusta.",
      category: "FINANCE" as TaskCategory,
      statutory: true,
      dueDate: financialStatementDeadline,
      quarter: TemporalEngine.getRelativeQuarter(
        financialStatementDeadline,
        config,
      ),
    });

    return deadlines;
  }
}
