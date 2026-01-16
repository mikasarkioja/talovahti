import { getFinanceAggregates } from "@/app/actions/finance";
import { ExpensesPieChart, ExpensesBarChart } from "./FinanceCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  Euro,
  PieChart as PieIcon,
  BarChart3,
} from "lucide-react";

export async function FinanceDashboard({
  companyId,
  year = new Date().getFullYear(),
}: {
  companyId: string;
  year?: number;
}) {
  const { success, data, error } = await getFinanceAggregates(companyId, year);

  if (!success || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Virhe ladattaessa taloustietoja: {error}
      </div>
    );
  }

  const { categories, monthlyTrend, totalActual, totalBudgeted } = data;
  const utilization =
    totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;
  const isOverBudget = totalActual > totalBudgeted;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toteutuneet Kulut
            </CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalActual.toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground">{year} (ALV 0%)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budjetin Käyttö
            </CardTitle>
            {isOverBudget ? (
              <ArrowUpRight className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-green-600"}`}
            >
              {utilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Budjetoitu: {totalBudgeted.toLocaleString()} €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5" />
              Kulut Kategorioittain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesPieChart data={categories} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Kuukausittainen Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesBarChart data={monthlyTrend} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
