"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  accumulatedBalance: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  balance,
  accumulatedBalance,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Ingresos
              </p>
              <p className="text-base font-bold text-success sm:text-2xl">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="rounded-full bg-success/10 p-2.5 sm:p-3">
              <TrendingUp className="h-4 w-4 text-success sm:h-5 sm:w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Acumulado año
              </p>
              <p
                className={cn(
                  "text-base font-bold tabular-nums sm:text-2xl",
                  accumulatedBalance >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {formatCurrency(accumulatedBalance)}
              </p>
            </div>
            <div
              className={cn(
                "rounded-full p-2.5 sm:p-3",
                accumulatedBalance >= 0 ? "bg-success/10" : "bg-destructive/10",
              )}
            >
              <Wallet
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  accumulatedBalance >= 0 ? "text-success" : "text-destructive",
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">Gastos</p>
              <p className="text-base font-bold text-destructive sm:text-2xl">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="rounded-full bg-destructive/10 p-2.5 sm:p-3">
              <TrendingDown className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Balance
              </p>
              <p
                className={cn(
                  "text-base font-bold sm:text-2xl",
                  balance >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {formatCurrency(balance)}
              </p>
            </div>
            <div
              className={cn(
                "rounded-full p-2.5 sm:p-3",
                balance >= 0 ? "bg-success/10" : "bg-destructive/10",
              )}
            >
              <Wallet
                className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5",
                  balance >= 0 ? "text-success" : "text-destructive",
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
