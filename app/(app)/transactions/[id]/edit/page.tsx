import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "@/components/transaction-form";
import { notFound } from "next/navigation";
import type { Category, Transaction } from "@/lib/types";

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: transaction } = (await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()) as { data: Transaction | null };

  if (!transaction) {
    notFound();
  }

  const { data: categories } = (await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name")) as { data: Category[] | null };

  return (
    <div className="max-w-lg mx-auto px-1 sm:px-0">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Editar Transaccion</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Modifica los datos de la transaccion
        </p>
      </div>

      <TransactionForm
        categories={categories || []}
        transaction={transaction}
        month={query.month ? parseInt(query.month) : undefined}
        year={query.year ? parseInt(query.year) : undefined}
      />
    </div>
  );
}
