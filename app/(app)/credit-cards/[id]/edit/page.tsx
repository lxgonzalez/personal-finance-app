import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreditCardForm } from "@/components/credit-card-form";
import type { CreditCard } from "@/lib/types";

export default async function EditCreditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: card } = (await supabase
    .from("credit_cards")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()) as { data: CreditCard | null };

  if (!card) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6 px-1 sm:px-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold sm:text-3xl">Editar Tarjeta</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {card.bank_name} · {card.card_name}
        </p>
      </div>
      <CreditCardForm card={card} />
    </div>
  );
}
