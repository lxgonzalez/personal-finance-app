"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CalendarClock,
  Banknote,
} from "lucide-react";
import type { CreditCardWithStatus } from "@/lib/types";
import { formatBillingPeriod } from "@/lib/credit-cards";
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
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatusBadge({ card }: { card: CreditCardWithStatus }) {
  if (card.is_paid) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
        <CheckCircle2 className="h-3 w-3" />
        Pagado
      </div>
    );
  }
  if (card.days_until_payment <= 0) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Vencido
      </div>
    );
  }
  if (card.days_until_payment <= 5) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-medium text-destructive">
        <AlertTriangle className="h-3 w-3" />
        {card.days_until_payment}d
      </div>
    );
  }
  if (card.days_until_payment <= 10) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        {card.days_until_payment}d
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {card.days_until_payment}d
    </div>
  );
}

export function CreditCardsList({ cards }: CreditCardsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string, cardName: string) => {
    if (!confirm(`Eliminar la tarjeta "${cardName}"? Esta accion no se puede deshacer.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("credit_cards").delete().eq("id", id);
    if (!error) router.refresh();
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <CreditCard className="mb-3 h-12 w-12 text-muted-foreground/30" />
        <p className="font-semibold text-muted-foreground">Sin tarjetas registradas</p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Agrega tu primera tarjeta de credito
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const isExpanded = expandedId === card.id;

        return (
          <div key={card.id} className="flex flex-col">
            {/* Card visual — always visible, clickable to expand */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : card.id)}
              className="group relative w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
              aria-expanded={isExpanded}
            >
              <div
                className="relative h-44 w-full rounded-2xl p-5 shadow-md transition-transform duration-200 active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${card.color}f0, ${card.color}80)`,
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-white/60">
                      {card.bank_name}
                    </p>
                    <p className="text-base font-bold text-white">{card.card_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge card={card} />
                    <CreditCard className="h-5 w-5 text-white/60" />
                  </div>
                </div>

                {/* Card number */}
                <p className="mt-4 font-mono text-lg tracking-[0.2em] text-white/90">
                  •••• •••• •••• {card.last_four || "••••"}
                </p>

                {/* Bottom row */}
                <div className="mt-2 flex items-end justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-white/50 uppercase tracking-wider">Gastos del mes</p>
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(card.monthly_total)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5">
                    <span className="text-xs text-white/80">Ver detalles</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 text-white/80 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </div>
                </div>

                {/* Inactive overlay */}
                {!card.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50">
                    <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                  </div>
                )}
              </div>
            </button>

            {/* Expandable details */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              <div className="mt-2 space-y-3 rounded-2xl border bg-card p-4">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Proximo pago
                    </div>
                    <p className="text-sm font-semibold">
                      {formatDate(card.next_payment_date)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Banknote className="h-3.5 w-3.5" />
                      Periodo
                    </div>
                    <p className="text-sm font-semibold">
                      {formatBillingPeriod(card.billing_month, card.billing_year)}
                    </p>
                  </div>
                </div>

                {/* Dates info */}
                <div className="flex gap-4 rounded-xl bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                  <span>Corte: dia <strong className="text-foreground">{card.cut_day}</strong></span>
                  <span>Pago: dia <strong className="text-foreground">{card.payment_day}</strong></span>
                </div>

                {/* Payment status */}
                {card.is_paid ? (
                  <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Pago registrado para este periodo</span>
                  </div>
                ) : card.days_until_payment <= 0 ? (
                  <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Pago vencido — registralo cuanto antes</span>
                  </div>
                ) : card.days_until_payment <= 5 ? (
                  <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">
                      Vence en {card.days_until_payment} dia{card.days_until_payment === 1 ? "" : "s"}
                    </span>
                  </div>
                ) : card.days_until_payment <= 10 ? (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2.5 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="font-medium">
                      {card.days_until_payment} dias para pagar
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                    <span>{card.days_until_payment} dias para el proximo pago</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 h-10 rounded-xl">
                    <Link href={`/credit-cards/${card.id}/edit`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(card.id, card.card_name)}
                    aria-label="Eliminar tarjeta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
