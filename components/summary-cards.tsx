"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SummaryCards({ totalIncome, totalExpenses, balance }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={cn(
                "text-2xl font-bold",
                balance >= 0 ? "text-success" : "text-destructive"
              )}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-full",
              balance >= 0 ? "bg-success/10" : "bg-destructive/10"
            )}>
              <Wallet className={cn(
                "h-5 w-5",
                balance >= 0 ? "text-success" : "text-destructive"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
