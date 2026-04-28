"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Pencil, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CreditCardWithStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CreditCardsListProps {
  cards: CreditCardWithStatus[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export function CreditCardsList({ cards }: CreditCardsListProps) {
  const router = useRouter();

  const handleDelete = async (id: string, cardName: string) => {
    if (!confirm(`Eliminar la tarjeta "${cardName}"? Esta accion no se puede deshacer.`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);

    if (!error) {
      router.refresh();
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="font-medium text-muted-foreground">No tienes tarjetas registradas</p>
        <p className="mt-1 text-sm text-muted-foreground/70">
          Agrega tu primera tarjeta de credito
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const alertLevel = card.is_paid
          ? null
          : card.days_until_payment <= 5
            ? "urgent"
            : card.days_until_payment <= 10
              ? "warning"
              : null;

        return (
          <div key={card.id} className="flex flex-col gap-3">
            {/* Card visual */}
            <div
              className="relative h-40 rounded-2xl p-5 shadow-md"
              style={{ background: `linear-gradient(135deg, ${card.color}ee, ${card.color}88)` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">{card.bank_name}</p>
                  <p className="text-sm font-bold text-white">{card.card_name}</p>
                </div>
                <CreditCard className="h-6 w-6 text-white/80" />
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="font-mono text-base tracking-widest text-white">
                  •••• •••• •••• {card.last_four || "••••"}
                </p>
                <div className="mt-1 flex gap-4 text-[10px] text-white/70">
                  <span>Corte: dia {card.cut_day}</span>
                  <span>Pago: dia {card.payment_day}</span>
                </div>
              </div>
              {!card.is_active && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                  <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                </div>
              )}
            </div>

            {/* Status & actions */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Gastos del periodo</p>
                  <p className="text-base font-bold">{formatCurrency(card.monthly_total)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Proximo pago</p>
                  <p className="text-sm font-semibold">{formatDate(card.next_payment_date)}</p>
                </div>
              </div>

              {card.is_paid ? (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Pago registrado</span>
                </div>
              ) : alertLevel === "urgent" ? (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">
                    {card.days_until_payment <= 0
                      ? "Pago vencido"
                      : `Vence en ${card.days_until_payment} dia${card.days_until_payment === 1 ? "" : "s"}`}
                  </span>
                </div>
              ) : alertLevel === "warning" ? (
                <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">
                    {card.days_until_payment} dias para pagar
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  <span>{card.days_until_payment} dias para pagar</span>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/credit-cards/${card.id}/edit`}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Editar
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("text-destructive hover:bg-destructive/10 hover:text-destructive")}
                  onClick={() => handleDelete(card.id, card.card_name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
