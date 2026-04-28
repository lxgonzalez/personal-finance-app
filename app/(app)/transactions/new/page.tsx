import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "@/components/transaction-form";
import type { Category, CreditCard } from "@/lib/types";

export default async function NewTransactionPage({
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

  const [{ data: categories }, { data: creditCards }] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", user.id).order("name") as Promise<{ data: Category[] | null }>,
    supabase.from("credit_cards").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at") as Promise<{ data: CreditCard[] | null }>,
  ]);

  return (
    <div className="max-w-lg mx-auto px-1 sm:px-0">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Nueva Transaccion</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Agrega un nuevo ingreso o gasto
        </p>
      </div>

      <TransactionForm
        categories={categories || []}
        creditCards={creditCards || []}
        month={params.month ? parseInt(params.month) : undefined}
        year={params.year ? parseInt(params.year) : undefined}
      />
    </div>
  );
}
