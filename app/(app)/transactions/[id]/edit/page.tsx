import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "@/components/transaction-form";
import { notFound } from "next/navigation";
import type { Category, Transaction } from "@/lib/types";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: transaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single() as { data: Transaction | null };

  if (!transaction) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order("name") as { data: Category[] | null };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Transacao</h1>
        <p className="text-muted-foreground">
          Altere os dados da transacao
        </p>
      </div>

      <TransactionForm 
        categories={categories || []} 
        transaction={transaction}
      />
    </div>
  );
}
