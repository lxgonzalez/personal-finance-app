"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Category, TransactionType } from "@/lib/types";

interface CategoryFormProps {
  category?: Category;
  defaultType?: TransactionType;
}

const ICONS = [
  "🛒", "🍔", "🏠", "🚗", "💊", "📚", "🎬", "✈️", "👕", "💼",
  "💰", "🎁", "🏋️", "🎮", "📱", "💡", "🔧", "🎨", "🐕", "🌿"
];

const COLORS = [
  "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#6366F1", "#F97316"
];

export function CategoryForm({ category, defaultType = "expense" }: CategoryFormProps) {
  const [type, setType] = useState<TransactionType>(category?.type || defaultType);
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || ICONS[0]);
  const [color, setColor] = useState(category?.color || COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Necesitas iniciar sesion");
      setIsLoading(false);
      return;
    }

    const categoryData = {
      user_id: user.id,
      name,
      type,
      icon,
      color,
      is_default: false,
    };

    let result;
    if (category) {
      result = await supabase
        .from("categories")
        .update(categoryData)
        .eq("id", category.id);
    } else {
      result = await supabase
        .from("categories")
        .insert(categoryData);
    }

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    router.push("/categories");
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

          {!category && (
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">
                  Gasto
                </TabsTrigger>
                <TabsTrigger value="income" className="flex-1">
                  Ingreso
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la categoria</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Alimentacion, Transporte, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icono</Label>
            <div className="grid grid-cols-10 gap-2">
              {ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-2 text-xl rounded-lg border-2 transition-colors ${
                    icon === i
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-muted hover:bg-muted/80"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Vista previa</p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: color + "20" }}
              >
                {icon}
              </div>
              <span className="font-medium">{name || "Nombre de la categoria"}</span>
            </div>
          </div>

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
              ) : category ? (
                "Guardar"
              ) : (
                "Crear"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
