"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, parseLocalDate } from "@/lib/utils";
import Link from "next/link";
import type { TransactionWithCategory } from "@/lib/types";
import { buildPeriodHref } from "@/lib/period";
import { usePeriodStore } from "@/lib/stores/period-store";

interface TransactionsListProps {
  transactions: TransactionWithCategory[];
  month?: number;
  year?: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parseLocalDate(dateString));
}

function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat("es-US", {
    day: "2-digit",
    month: "short",
  }).format(parseLocalDate(dateString));
}

export function TransactionsList({
  transactions,
  month,
  year,
}: TransactionsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const storeMonth = usePeriodStore((state) => state.month);
  const storeYear = usePeriodStore((state) => state.year);
  const activeMonth = month ?? storeMonth;
  const activeYear = year ?? storeYear;

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const supabase = createClient();
    await supabase.from("transactions").delete().eq("id", deleteId);

    setDeleteId(null);
    setIsDeleting(false);
    router.refresh();
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            No hay transacciones en este periodo
          </p>
          <Button asChild>
            <Link
              href={buildPeriodHref(
                "/transactions/new",
                activeMonth,
                activeYear,
              )}
            >
              Agregar transaccion
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groupedByDate = transactions.reduce(
    (acc, transaction) => {
      const date = transaction.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    },
    {} as Record<string, TransactionWithCategory[]>,
  );

  return (
    <>
      <div className="space-y-4">
        {Object.entries(groupedByDate).map(([date, dayTransactions]) => (
          <div key={date} className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              {formatDate(date)}
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              {dayTransactions.map((transaction, index) => {
                const category = transaction.category;
                const isFirst = index === 0;
                const isLast = index === dayTransactions.length - 1;

                return (
                  <div
                    key={transaction.id}
                    className={cn(
                      "flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/30",
                      !isFirst && "border-t border-border/60",
                      isFirst && isLast && "rounded-2xl",
                      isFirst && !isLast && "rounded-t-2xl",
                      isLast && !isFirst && "rounded-b-2xl",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border",
                          transaction.type === "income"
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-destructive/20 bg-destructive/10 text-destructive",
                        )}
                      >
                        {category?.icon ? (
                          <span className="text-xl leading-none">
                            {category.icon}
                          </span>
                        ) : transaction.type === "income" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="truncate font-medium">
                            {transaction.description}
                          </p>
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                              transaction.type === "income"
                                ? "bg-success/10 text-success"
                                : "bg-destructive/10 text-destructive",
                            )}
                          >
                            {transaction.type === "income"
                              ? "Ingreso"
                              : "Gasto"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatShortDate(date)}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-foreground/80">
                            <span>{category?.icon || "•"}</span>
                            <span className="truncate">
                              {category?.name || "Sin categoria"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <span
                        className={cn(
                          "whitespace-nowrap text-sm font-semibold tabular-nums sm:text-base",
                          transaction.type === "income"
                            ? "text-success"
                            : "text-destructive",
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={buildPeriodHref(
                                `/transactions/${transaction.id}/edit`,
                                activeMonth,
                                activeYear,
                              )}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(transaction.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar transaccion</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que quieres eliminar esta transaccion? Esta accion
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
