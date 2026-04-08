import { CategoryForm } from "@/components/category-form";

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const defaultType = params.type === "income" ? "income" : "expense";

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nueva Categoria</h1>
        <p className="text-muted-foreground">
          Crea una categoria personalizada
        </p>
      </div>

      <CategoryForm defaultType={defaultType} />
    </div>
  );
}
