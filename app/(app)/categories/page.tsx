import { createClient } from "@/lib/supabase/server";
import { CategoriesList } from "@/components/categories-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/lib/types";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: categories } = (await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("type")
    .order("name")) as { data: Category[] | null };

  const expenseCategories = (categories || []).filter(
    (c) => c.type === "expense",
  );
  const incomeCategories = (categories || []).filter(
    (c) => c.type === "income",
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Categorias</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Administra tus categorias de ingresos y gastos
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Categoria
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <CategoriesList
          title="Categorias de Gastos"
          categories={expenseCategories}
          type="expense"
        />
        <CategoriesList
          title="Categorias de Ingresos"
          categories={incomeCategories}
          type="income"
        />
      </div>
    </div>
  );
}
