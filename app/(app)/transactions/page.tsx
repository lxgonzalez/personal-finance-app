import { createClient } from "@/lib/supabase/server";
import { MonthSelector } from "@/components/month-selector";
import { TransactionsList } from "@/components/transactions-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { TransactionWithCategory } from "@/lib/types";
import { buildPeriodHref } from "@/lib/period";

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

      <TransactionsList
        transactions={transactions || []}
        month={month}
        year={year}
      />
    </div>
  );
}
