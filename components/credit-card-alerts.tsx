"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, CreditCard, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreditCardWithStatus } from "@/lib/types";
import { formatBillingPeriod } from "@/lib/credit-cards";
import { cn } from "@/lib/utils";

interface CreditCardAlertsProps {
  cards: CreditCardWithStatus[];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
}

export function CreditCardAlerts({ cards }: CreditCardAlertsProps) {
  const activeCards = cards.filter((c) => c.is_active);

  if (activeCards.length === 0) return null;

  // Only show cards that need attention (within 10 days) or for info
  const alertCards = activeCards.filter((c) => !c.is_paid && c.days_until_payment <= 10);
  const paidCards = activeCards.filter((c) => c.is_paid);
  const upcomingCards = activeCards.filter(
    (c) => !c.is_paid && c.days_until_payment > 10,
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <CreditCard className="h-5 w-5 text-primary" />
          Tarjetas de Credito
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Urgent / warning alerts */}
        {alertCards.map((card) => {
          const isUrgent = card.days_until_payment <= 5;
          const isOverdue = card.days_until_payment <= 0;

          return (
            <div
              key={card.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4",
                isUrgent
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-amber-500/30 bg-amber-500/5",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1.5",
                  isUrgent ? "bg-destructive/10" : "bg-amber-500/10",
                )}
              >
                <AlertTriangle
                  className={cn(
                    "h-4 w-4",
                    isUrgent ? "text-destructive" : "text-amber-600 dark:text-amber-400",
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">
                    {card.bank_name} · {card.card_name}
                  </span>
                  {card.last_four && (
                    <span className="text-xs text-muted-foreground font-mono">
                      ••{card.last_four}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm font-medium mt-0.5",
                    isUrgent
                      ? "text-destructive"
                      : "text-amber-700 dark:text-amber-300",
                  )}
                >
                  {isOverdue
                    ? "Pago vencido"
                    : isUrgent
                      ? `Paga hoy o en ${card.days_until_payment} dia${card.days_until_payment === 1 ? "" : "s"} — ${formatDate(card.next_payment_date)}`
                      : `${card.days_until_payment} dias para pagar — ${formatDate(card.next_payment_date)}`}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Periodo: {formatBillingPeriod(card.billing_month, card.billing_year)}
                </p>
              </div>
              <div
                className="h-3 w-3 rounded-full shrink-0 mt-1"
                style={{ backgroundColor: card.color }}
              />
            </div>
          );
        })}

        {/* Upcoming (> 10 days) */}
        {upcomingCards.map((card) => (
          <div
            key={card.id}
            className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4"
          >
            <div className="mt-0.5 rounded-full bg-muted p-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">
                  {card.bank_name} · {card.card_name}
                </span>
                {card.last_four && (
                  <span className="text-xs text-muted-foreground font-mono">
                    ••{card.last_four}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {card.days_until_payment} dias para pagar — {formatDate(card.next_payment_date)}
              </p>
            </div>
            <div
              className="h-3 w-3 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: card.color }}
            />
          </div>
        ))}

        {/* Paid cards */}
        {paidCards.map((card) => (
          <div
            key={card.id}
            className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4"
          >
            <div className="mt-0.5 rounded-full bg-success/10 p-1.5">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">
                  {card.bank_name} · {card.card_name}
                </span>
                {card.last_four && (
                  <span className="text-xs text-muted-foreground font-mono">
                    ••{card.last_four}
                  </span>
                )}
              </div>
              <p className="text-sm text-success mt-0.5">
                Pago registrado — {formatBillingPeriod(card.billing_month, card.billing_year)}
              </p>
            </div>
            <div
              className="h-3 w-3 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: card.color }}
            />
          </div>
        ))}

        <Link
          href="/credit-cards"
          className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          Ver todas las tarjetas →
        </Link>
      </CardContent>
    </Card>
  );
}
