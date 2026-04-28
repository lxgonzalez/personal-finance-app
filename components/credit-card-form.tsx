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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Loader2, CreditCard } from "lucide-react";
import type { CreditCard as CreditCardType } from "@/lib/types";

interface CreditCardFormProps {
  card?: CreditCardType;
}

const PRESET_COLORS = [
  "#1E3A5F",
  "#1A472A",
  "#4A0E0E",
  "#2D1B69",
  "#0F4C75",
  "#6366F1",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#EC4899",
];

const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

export function CreditCardForm({ card }: CreditCardFormProps) {
  const [bankName, setBankName] = useState(card?.bank_name || "");
  const [cardName, setCardName] = useState(card?.card_name || "");
  const [lastFour, setLastFour] = useState(card?.last_four || "");
  const [cutDay, setCutDay] = useState(card?.cut_day?.toString() || "");
  const [paymentDay, setPaymentDay] = useState(card?.payment_day?.toString() || "");
  const [color, setColor] = useState(card?.color || PRESET_COLORS[0]);
  const [isActive, setIsActive] = useState(card?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLastFourChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setLastFour(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!bankName.trim()) {
      setError("El nombre del banco es obligatorio");
      setIsLoading(false);
      return;
    }
    if (!cardName.trim()) {
      setError("El nombre de la tarjeta es obligatorio");
      setIsLoading(false);
      return;
    }
    if (!cutDay) {
      setError("Selecciona el dia de corte");
      setIsLoading(false);
      return;
    }
    if (!paymentDay) {
      setError("Selecciona el dia de pago");
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

    const cardData = {
      user_id: user.id,
      bank_name: bankName.trim(),
      card_name: cardName.trim(),
      last_four: lastFour.length === 4 ? lastFour : null,
      cut_day: parseInt(cutDay),
      payment_day: parseInt(paymentDay),
      color,
      is_active: isActive,
    };

    let result;
    if (card) {
      result = await supabase
        .from("credit_cards")
        .update(cardData)
        .eq("id", card.id);
    } else {
      result = await supabase.from("credit_cards").insert(cardData);
    }

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    router.push("/credit-cards");
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bankName">Banco</Label>
              <Input
                id="bankName"
                type="text"
                placeholder="Ej: Banco Nacional, Scotiabank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Nombre de la tarjeta</Label>
              <Input
                id="cardName"
                type="text"
                placeholder="Ej: Visa Platinum, Mastercard Gold"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastFour">
              Ultimos 4 digitos{" "}
              <span className="text-muted-foreground text-sm font-normal">(opcional)</span>
            </Label>
            <Input
              id="lastFour"
              type="text"
              inputMode="numeric"
              placeholder="1234"
              value={lastFour}
              onChange={(e) => handleLastFourChange(e.target.value)}
              maxLength={4}
              className="max-w-[120px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dia de corte</Label>
              <p className="text-xs text-muted-foreground">
                Dia del mes en que cierra tu estado de cuenta
              </p>
              <Select value={cutDay} onValueChange={setCutDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      Dia {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dia de pago</Label>
              <p className="text-xs text-muted-foreground">
                Dia limite para pagar tu tarjeta
              </p>
              <Select value={paymentDay} onValueChange={setPaymentDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el dia" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      Dia {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Color de la tarjeta</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-full border-2 border-transparent p-0.5"
                  aria-label="Color personalizado"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div
              className="relative h-36 w-full max-w-xs rounded-2xl p-5 sm:h-40"
              style={{ background: `linear-gradient(135deg, ${color}ee, ${color}99)` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">
                    {bankName || "Banco"}
                  </p>
                  <p className="text-sm font-bold text-white">
                    {cardName || "Tarjeta"}
                  </p>
                </div>
                <CreditCard className="h-6 w-6 text-white/80" />
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="font-mono text-base tracking-widest text-white">
                  •••• •••• •••• {lastFour || "••••"}
                </p>
                {cutDay && paymentDay && (
                  <div className="mt-1 flex gap-4 text-[10px] text-white/70">
                    <span>Corte: dia {cutDay}</span>
                    <span>Pago: dia {paymentDay}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {card && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Tarjeta activa</p>
                <p className="text-sm text-muted-foreground">
                  Las tarjetas inactivas no muestran alertas
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
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
              ) : card ? (
                "Guardar"
              ) : (
                "Agregar tarjeta"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
