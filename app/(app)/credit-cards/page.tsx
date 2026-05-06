import { createClient } from "@/lib/supabase/server";
import { CreditCardsList } from "@/components/credit-cards-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { CreditCard, CreditCardWithStatus } from "@/lib/types";
import {
  getNextPaymentDate,
  getBillingPeriodForPayment,
  getBillingPeriodDates,
  getDaysUntilPayment,
} from "@/lib/credit-cards";
import { toDateString } from "@/lib/utils";

export default async function CreditCardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: cards } = (await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at")) as { data: CreditCard[] | null };

  const today = new Date();

  const cardsWithStatus: CreditCardWithStatus[] = await Promise.all(
    (cards || []).map(async (card) => {
      const nextPayment = getNextPaymentDate(card, today);
      const { billingMonth, billingYear } = getBillingPeriodForPayment(card, nextPayment);
      const daysUntil = getDaysUntilPayment(nextPayment, today);

      // Check if payment registered for this billing period
      const { data: payment } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("payment_for_card_id", card.id)
        .eq("payment_billing_month", billingMonth)
        .eq("payment_billing_year", billingYear)
        .limit(1)
        .maybeSingle();

      // Sum expenses charged to this card in the current billing period (not calendar month)
      const { startDate, endDate } = getBillingPeriodDates(card, billingMonth, billingYear);

      const { data: expenses } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("credit_card_id", card.id)
        .eq("type", "expense")
        .gte("date", startDate)
        .lte("date", endDate);

      const monthlyTotal = (expenses || []).reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      );

      return {
        ...card,
        next_payment_date: toDateString(nextPayment),
        billing_month: billingMonth,
        billing_year: billingYear,
        days_until_payment: daysUntil,
        is_paid: !!payment,
        monthly_total: monthlyTotal,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Tarjetas de Credito</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Gestiona tus tarjetas y fechas de pago
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/credit-cards/new">
            <Plus className="mr-2 h-4 w-4" />
            Agregar tarjeta
          </Link>
        </Button>
      </div>

      <CreditCardsList cards={cardsWithStatus} />
    </div>
  );
}
