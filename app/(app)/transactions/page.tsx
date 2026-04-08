import { createClient } from "@/lib/supabase/server";
import { MonthSelector } from "@/components/month-selector";
import { TransactionsList } from "@/components/transactions-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import type { TransactionWithCategory } from "@/lib/types";
import { buildPeriodHref } from "@/lib/period";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: transactions } = (await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })) as {
    data: TransactionWithCategory[] | null;
  };

  const safeTransactions = transactions || [];

  const totalIncome = safeTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = safeTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Transacciones</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Administra tus ingresos y gastos
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <MonthSelector
            month={month}
            year={year}
            syncStore={Boolean(params.month || params.year)}
          />
          <Button asChild className="hidden sm:flex">
            <Link href={buildPeriodHref("/transactions/new", month, year)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Transaccion
            </Link>
          </Button>
        </div>
      </div>

      <section className="space-y-3">
        <div className="space-y-1 px-1">
          <h2 className="text-base font-semibold sm:text-lg">
            Resumen del periodo
          </h2>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Totales de ingresos, egresos y balance del mes seleccionado.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Card>
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px] sm:tracking-[0.14em]">
                    Total ingresos
                  </p>
                  <p className="truncate text-sm font-bold text-success tabular-nums sm:text-2xl">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="hidden rounded-full bg-success/10 p-2 sm:block sm:p-3">
                  <TrendingUp className="h-4 w-4 text-success sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px] sm:tracking-[0.14em]">
                    Total egresos
                  </p>
                  <p className="truncate text-sm font-bold text-destructive tabular-nums sm:text-2xl">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div className="hidden rounded-full bg-destructive/10 p-2 sm:block sm:p-3">
                  <TrendingDown className="h-4 w-4 text-destructive sm:h-5 sm:w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:text-[11px] sm:tracking-[0.14em]">
                    Balance
                  </p>
                  <p
                    className={cn(
                      "truncate text-sm font-bold tabular-nums sm:text-2xl",
                      balance >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div
                  className={cn(
                    "hidden rounded-full p-2 sm:block sm:p-3",
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
      </section>

      <TransactionsList
        transactions={safeTransactions}
        month={month}
        year={year}
      />
    </div>
  );
}
