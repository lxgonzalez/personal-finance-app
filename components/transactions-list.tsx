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
import { TrendingUp, TrendingDown, Trash2, Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { TransactionWithCategory } from "@/lib/types";

interface TransactionsListProps {
  transactions: TransactionWithCategory[];
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
  }).format(new Date(dateString));
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

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
            <Link href="/transactions/new">Agregar transaccion</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const groupedByDate = transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, TransactionWithCategory[]>);

  return (
    <>
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dayTransactions]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {formatDate(date)}
            </h3>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-full shrink-0",
                          transaction.type === "income"
                            ? "bg-success/10"
                            : "bg-destructive/10"
                        )}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold whitespace-nowrap",
                          transaction.type === "income"
                            ? "text-success"
                            : "text-destructive"
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/transactions/${transaction.id}/edit`}>
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
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar transaccion</AlertDialogTitle>
            <AlertDialogDescription>
              Estas seguro de que quieres eliminar esta transaccion? Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
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
