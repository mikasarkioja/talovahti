/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type CategoryData = {
  category: string;
  actual: number;
  budgeted: number;
  variance: number;
};

type MonthlyData = {
  month: string;
  total: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  HEATING: "Lämmitys",
  WATER: "Vesi",
  MAINTENANCE: "Huolto",
  ADMIN: "Hallinto",
  CLEANING: "Siivous",
  ELECTRICITY: "Sähkö",
  WASTE: "Jätehuolto",
  REPAIR: "Korjaukset",
  OTHER: "Muut",
};

export function ExpensesPieChart({ data }: { data: CategoryData[] }) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const translatedData = data.map((d) => ({
    ...d,
    categoryName: CATEGORY_LABELS[d.category] || d.category,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={translatedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) =>
            `${props.categoryName} ${((props.percent || 0) * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="actual"
          nameKey="categoryName"
        >
          {translatedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) =>
            `${Number(value).toLocaleString("fi-FI")} €`
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ExpensesBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip
          formatter={(value: any) =>
            `${Number(value).toLocaleString("fi-FI")} €`
          }
        />
        <Legend />
        <Bar
          dataKey="total"
          name="Kuukausikulut"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
