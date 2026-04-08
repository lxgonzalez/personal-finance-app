import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/category-form";
import { notFound, redirect } from "next/navigation";
import type { Category } from "@/lib/types";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single() as { data: Category | null };

  if (!category) {
    notFound();
  }

  if (category.is_default) {
    redirect("/categories");
  }

  if (category.user_id !== user.id) {
    redirect("/categories");
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Categoria</h1>
        <p className="text-muted-foreground">
          Modifica los datos de la categoria
        </p>
      </div>

      <CategoryForm category={category} />
    </div>
  );
}
