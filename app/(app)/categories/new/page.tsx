import { CategoryForm } from "@/components/category-form";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const defaultType = params.type === "income" ? "income" : "expense";

  return (
    <div className="max-w-lg mx-auto px-1 sm:px-0">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Nueva Categoria</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Crea una categoria personalizada
        </p>
      </div>

      <CategoryForm defaultType={defaultType} />
    </div>
  );
}
