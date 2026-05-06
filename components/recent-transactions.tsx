"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn, parseLocalDate } from "@/lib/utils";
import type { TransactionWithCategory } from "@/lib/types";
import { buildPeriodHref } from "@/lib/period";
import { usePeriodStore } from "@/lib/stores/period-store";

interface RecentTransactionsProps {
  transactions: TransactionWithCategory[];
  month?: number;
  year?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-US", {
    day: "2-digit",
    month: "short",
  }).format(parseLocalDate(dateString));
}

export function RecentTransactions({
  transactions,
  month,
  year,
}: RecentTransactionsProps) {
  const storeMonth = usePeriodStore((state) => state.month);
  const storeYear = usePeriodStore((state) => state.year);
  const activeMonth = month ?? storeMonth;
  const activeYear = year ?? storeYear;

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={buildPeriodHref("/transactions", activeMonth, activeYear)}
            >
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">
            No hay transacciones en este periodo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={buildPeriodHref("/transactions", activeMonth, activeYear)}
          >
            Ver todas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full",
                  transaction.type === "income"
                    ? "bg-success/10"
                    : "bg-destructive/10",
                )}
              >
                {transaction.type === "income" ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.category?.name} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "font-semibold",
                transaction.type === "income"
                  ? "text-success"
                  : "text-destructive",
              )}
            >
              {transaction.type === "income" ? "+" : "-"}
              {formatCurrency(Number(transaction.amount))}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
