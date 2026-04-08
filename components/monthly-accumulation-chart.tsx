"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { MonthlyFinanceSummary } from "@/lib/types";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyAccumulationChartProps {
  data: MonthlyFinanceSummary[];
}

const chartConfig = {
  income: {
    label: "Ingresos",
    color: "var(--chart-2)",
  },
  expenses: {
    label: "Gastos",
    color: "var(--chart-3)",
  },
  accumulated: {
    label: "Acumulado",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function MonthlyAccumulationChart({
  data,
}: MonthlyAccumulationChartProps) {
  const accumulatedTotal = data.at(-1)?.accumulated ?? 0;
  const bestMonth = data.reduce(
    (best, current) => (current.net > best.net ? current : best),
    data[0] ?? { month: "", net: 0 },
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Acumulado anual</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ingresos, gastos y saldo acumulado mes a mes
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              Acumulado
            </p>
            <p className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">
              {formatCurrency(accumulatedTotal)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              Mejor mes
            </p>
            <p className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">
              {bestMonth.month}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              mensual top
            </p>
            <p className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">
              {formatCurrency(bestMonth.net)}
            </p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-64 w-full sm:h-85">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const label =
                      name === "income"
                        ? "Ingresos"
                        : name === "expenses"
                          ? "Gastos"
                          : "Acumulado";
                    return (
                      <div className="flex w-full items-center justify-between gap-8">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-medium tabular-nums">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    );
                  }}
                  indicator="dashed"
                />
              }
            />
            <ChartLegend
              content={<ChartLegendContent />}
              wrapperStyle={{ display: "none" }}
              className="sm:block"
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="var(--color-expenses)"
              radius={[8, 8, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="accumulated"
              stroke="var(--color-accumulated)"
              strokeWidth={3}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
