import { createClient } from "@/lib/supabase/server";
import { CategoriesList } from "@/components/categories-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/lib/types";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},is_default.eq.true`)
    .order("type")
    .order("name") as { data: Category[] | null };

  const expenseCategories = (categories || []).filter((c) => c.type === "expense");
  const incomeCategories = (categories || []).filter((c) => c.type === "income");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie suas categorias de receitas e despesas
          </p>
        </div>
        <Button asChild>
          <Link href="/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <CategoriesList 
          title="Categorias de Despesas" 
          categories={expenseCategories} 
          type="expense"
        />
        <CategoriesList 
          title="Categorias de Receitas" 
          categories={incomeCategories} 
          type="income"
        />
      </div>
    </div>
  );
}
