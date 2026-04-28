"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CreditCard } from "lucide-react";
import type { Category, CreditCard as CreditCardType, Transaction, TransactionType } from "@/lib/types";
import { buildPeriodHref } from "@/lib/period";
import { usePeriodStore } from "@/lib/stores/period-store";

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
  const [description, setDescription] = useState(
    transaction?.description || "",
  );
  const [categoryId, setCategoryId] = useState(transaction?.category_id || "");
  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().split("T")[0],
  );

  // Credit card state
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
  // Years for billing period select: current year ± 1
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
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={type}
            onValueChange={(v) => {
              setType(v as TransactionType);
              setCategoryId("");
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                Gasto
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                Ingreso
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Input
              id="description"
              type="text"
              placeholder="Ej: Supermercado, Salario, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoria" />
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

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Credit card section — only for expenses when cards exist */}
          {type === "expense" && activeCards.length > 0 && (
            <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Tarjeta de credito</Label>
                <span className="text-xs text-muted-foreground">(opcional)</span>
              </div>

              <Tabs
                value={cardMode}
                onValueChange={(v) => {
                  setCardMode(v as CardMode);
                  setCreditCardId("");
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="none" className="flex-1 text-xs">
                    Sin tarjeta
                  </TabsTrigger>
                  <TabsTrigger value="charge" className="flex-1 text-xs">
                    Cargo a tarjeta
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="flex-1 text-xs">
                    Pago de tarjeta
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {cardMode !== "none" && (
                <Select value={creditCardId} onValueChange={setCreditCardId}>
                  <SelectTrigger>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mes del estado de cuenta</Label>
                    <Select value={billingMonth} onValueChange={setBillingMonth}>
                      <SelectTrigger>
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
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ano</Label>
                    <Select value={billingYear} onValueChange={setBillingYear}>
                      <SelectTrigger>
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
                </div>
              )}

              {cardMode === "charge" && (
                <p className="text-xs text-muted-foreground">
                  El gasto se vincula a la tarjeta. El saldo en efectivo no cambia hasta que registres el pago.
                </p>
              )}
              {cardMode === "payment" && (
                <p className="text-xs text-muted-foreground">
                  Registra el pago en efectivo de tu tarjeta y elimina la alerta de pago pendiente.
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
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
      </CardContent>
    </Card>
  );
}
