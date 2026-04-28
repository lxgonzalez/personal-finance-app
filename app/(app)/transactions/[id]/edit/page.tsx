import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "@/components/transaction-form";
import { notFound } from "next/navigation";
import type { Category, CreditCard, Transaction } from "@/lib/types";

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

  const [{ data: categories }, { data: creditCards }] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", user.id).order("name") as Promise<{ data: Category[] | null }>,
    supabase.from("credit_cards").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at") as Promise<{ data: CreditCard[] | null }>,
  ]);

  return (
    <div className="mx-auto max-w-lg px-1 sm:px-0">
      <div className="mb-5 space-y-0.5">
        <h1 className="text-xl font-bold sm:text-2xl">Editar Transaccion</h1>
        <p className="text-sm text-muted-foreground">Modifica los datos</p>
      </div>

      <TransactionForm
        categories={categories || []}
        creditCards={creditCards || []}
        transaction={transaction}
        month={query.month ? parseInt(query.month) : undefined}
        year={query.year ? parseInt(query.year) : undefined}
      />
    </div>
  );
}
