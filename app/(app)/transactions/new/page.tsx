import { createClient } from "@/lib/supabase/server";
import { TransactionForm } from "@/components/transaction-form";
import type { Category } from "@/lib/types";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: categories } = (await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name")) as { data: Category[] | null };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nueva Transaccion</h1>
        <p className="text-muted-foreground">Agrega un nuevo ingreso o gasto</p>
      </div>

      <TransactionForm categories={categories || []} />
    </div>
  );
}
