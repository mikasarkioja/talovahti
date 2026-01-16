import { HomeClient } from "@/components/dashboard/HomeClient";
import { getAnnualClockData } from "@/app/actions/governance";

export default async function Home() {
  // Mock company ID or fetch from session (e.g. auth())
  // For dev/mock purposes:
  const companyId = "default-company-id";
  const currentYear = new Date().getFullYear();

  const clockResult = await getAnnualClockData(companyId, currentYear);

  // Default empty data if fetch fails
  const annualClockData =
    clockResult.success && clockResult.data
      ? clockResult.data
      : {
          fiscalYearStart: 1,
          monthlyGroups: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            tasks: [],
          })),
          totalTasks: 0,
          completedTasks: 0,
        };

  return <HomeClient annualClockData={annualClockData} />;
}
