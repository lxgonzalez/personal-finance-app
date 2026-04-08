import { createClient } from "@/lib/supabase/server";
import { MonthSelector } from "@/components/month-selector";
import { TransactionsList } from "@/components/transactions-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { TransactionWithCategory } from "@/lib/types";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false }) as { data: TransactionWithCategory[] | null };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transacoes</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <MonthSelector month={month} year={year} />
          <Button asChild className="hidden sm:flex">
            <Link href="/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Transacao
            </Link>
          </Button>
        </div>
      </div>

      <TransactionsList transactions={transactions || []} />
    </div>
  );
}
