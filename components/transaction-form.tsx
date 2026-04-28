"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CreditCard, ChevronDown } from "lucide-react";
import type {
  Category,
  CreditCard as CreditCardType,
  Transaction,
  TransactionType,
} from "@/lib/types";
import { buildPeriodHref } from "@/lib/period";
import { usePeriodStore } from "@/lib/stores/period-store";
import { cn } from "@/lib/utils";

interface TransactionFormProps {
  categories: Category[];
  creditCards?: CreditCardType[];
  transaction?: Transaction;
  month?: number;
  year?: number;
}

type CardMode = "none" | "charge" | "payment";

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getInitialCardMode(transaction?: Transaction): CardMode {
  if (transaction?.payment_for_card_id) return "payment";
  if (transaction?.credit_card_id) return "charge";
  return "none";
}

export function TransactionForm({
  categories,
  creditCards = [],
  transaction,
  month,
  year,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(
    transaction?.type || "expense",
  );
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [description, setDescription] = useState(transaction?.description || "");
  const [categoryId, setCategoryId] = useState(transaction?.category_id || "");
  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().split("T")[0],
  );

  const [cardMode, setCardMode] = useState<CardMode>(getInitialCardMode(transaction));
  const [creditCardId, setCreditCardId] = useState(
    transaction?.credit_card_id || transaction?.payment_for_card_id || "",
  );
  const now = new Date();
  const [billingMonth, setBillingMonth] = useState(
    transaction?.payment_billing_month?.toString() || (now.getMonth() + 1).toString(),
  );
  const [billingYear, setBillingYear] = useState(
    transaction?.payment_billing_year?.toString() || now.getFullYear().toString(),
  );

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const storeMonth = usePeriodStore((state) => state.month);
  const storeYear = usePeriodStore((state) => state.year);

  const activeCards = creditCards.filter((c) => c.is_active);
  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
  const filteredCategories = categories.filter((cat) => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!categoryId) {
      setError("Selecciona una categoria");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Necesitas iniciar sesion");
      setIsLoading(false);
      return;
    }

    const transactionData: Record<string, unknown> = {
      user_id: user.id,
      category_id: categoryId,
      type,
      amount: parseFloat(amount.replace(",", ".")),
      description,
      date,
      credit_card_id: null,
      payment_for_card_id: null,
      payment_billing_month: null,
      payment_billing_year: null,
    };

    if (type === "expense" && cardMode === "charge" && creditCardId) {
      transactionData.credit_card_id = creditCardId;
    } else if (type === "expense" && cardMode === "payment" && creditCardId) {
      transactionData.payment_for_card_id = creditCardId;
      transactionData.payment_billing_month = parseInt(billingMonth);
      transactionData.payment_billing_year = parseInt(billingYear);
    }

    let result;
    if (transaction) {
      result = await supabase
        .from("transactions")
        .update(transactionData)
        .eq("id", transaction.id);
    } else {
      result = await supabase.from("transactions").insert(transactionData);
    }

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    router.push(
      buildPeriodHref("/transactions", month ?? storeMonth, year ?? storeYear),
    );
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Type selector */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setCategoryId("");
            }}
            className={cn(
              "rounded-xl py-2.5 text-sm font-semibold transition-all",
              type === t
                ? t === "expense"
                  ? "bg-card text-destructive shadow-sm"
                  : "bg-card text-success shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {t === "expense" ? "Gasto" : "Ingreso"}
          </button>
        ))}
      </div>

      {/* Amount — big and prominent */}
      <div className="rounded-2xl bg-muted/50 px-5 py-4">
        <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Monto
        </p>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-3xl font-light",
            type === "expense" ? "text-destructive" : "text-success",
          )}>
            $
          </span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className={cn(
              "w-full bg-transparent text-4xl font-bold tabular-nums outline-none placeholder:text-muted-foreground/30",
              type === "expense" ? "text-destructive" : "text-success",
            )}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Descripcion
        </Label>
        <Input
          id="description"
          type="text"
          placeholder="Ej: Supermercado, Salario..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* Category + Date — side by side on mobile */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Categoria
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-12 rounded-xl text-base">
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Fecha
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="h-12 rounded-xl text-base"
          />
        </div>
      </div>

      {/* Credit card section */}
      {type === "expense" && activeCards.length > 0 && (
        <div className="overflow-hidden rounded-2xl border">
          <div className="flex items-center gap-2 bg-muted/30 px-4 py-3">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tarjeta de credito</span>
            <span className="ml-auto text-xs text-muted-foreground">opcional</span>
          </div>

          <div className="space-y-3 p-4">
            {/* Card mode pills */}
            <div className="flex gap-2">
              {(["none", "charge", "payment"] as CardMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setCardMode(mode);
                    setCreditCardId("");
                  }}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-medium transition-all",
                    cardMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80",
                  )}
                >
                  {mode === "none" ? "Sin tarjeta" : mode === "charge" ? "Cargo" : "Pago"}
                </button>
              ))}
            </div>

            {cardMode !== "none" && (
              <Select value={creditCardId} onValueChange={setCreditCardId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecciona la tarjeta" />
                </SelectTrigger>
                <SelectContent>
                  {activeCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: card.color }}
                        />
                        <span>
                          {card.bank_name} · {card.card_name}
                          {card.last_four ? ` ••${card.last_four}` : ""}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {cardMode === "payment" && creditCardId && (
              <div className="grid grid-cols-2 gap-2">
                <Select value={billingMonth} onValueChange={setBillingMonth}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_ES.map((m, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={billingYear} onValueChange={setBillingYear}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {cardMode === "charge" && (
              <p className="text-xs text-muted-foreground">
                Gasto vinculado a la tarjeta. El efectivo no cambia hasta que registres el pago.
              </p>
            )}
            {cardMode === "payment" && (
              <p className="text-xs text-muted-foreground">
                Pago en efectivo de la tarjeta. Selecciona el mes del estado de cuenta que pagas.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 rounded-xl"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : transaction ? (
            "Guardar"
          ) : (
            "Agregar"
          )}
        </Button>
      </div>
    </form>
  );
}
