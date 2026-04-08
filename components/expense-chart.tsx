"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { Category } from "@/lib/types";

interface CategoryData {
  category: Category;
  total: number;
  percentage: number;
}

interface ExpenseChartProps {
  categoryData: CategoryData[];
}

const COLORS = [
  "oklch(0.55 0.18 250)",
  "oklch(0.65 0.2 145)",
  "oklch(0.55 0.22 25)",
  "oklch(0.7 0.15 80)",
  "oklch(0.6 0.15 300)",
  "oklch(0.65 0.15 200)",
  "oklch(0.7 0.18 30)",
  "oklch(0.55 0.2 180)",
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function ExpenseChart({ categoryData }: ExpenseChartProps) {
  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-52 sm:h-64">
          <p className="text-muted-foreground">No hay gastos en este periodo</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = categoryData.map((item, index) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color || COLORS[index % COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-52 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={62}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                className="hidden sm:block"
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {chartData.slice(0, 4).map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 py-1.5"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-xs text-foreground/85">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
