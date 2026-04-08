"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Category, TransactionType } from "@/lib/types";

interface CategoryFormProps {
  category?: Category;
  defaultType?: TransactionType;
}

const PRESET_ICONS = [
  { value: "🛒", label: "Compras" },
  { value: "🍔", label: "Comida" },
  { value: "🏠", label: "Hogar" },
  { value: "🚗", label: "Transporte" },
  { value: "💊", label: "Salud" },
  { value: "📚", label: "Educacion" },
  { value: "🎬", label: "Entretenimiento" },
  { value: "✈️", label: "Viajes" },
  { value: "👕", label: "Ropa" },
  { value: "💼", label: "Trabajo" },
  { value: "💰", label: "Ahorro" },
  { value: "🎁", label: "Regalos" },
  { value: "🏋️", label: "Deporte" },
  { value: "🎮", label: "Gaming" },
  { value: "📱", label: "Servicios" },
  { value: "💡", label: "Luz" },
  { value: "🔧", label: "Mantenimiento" },
  { value: "🎨", label: "Creativo" },
  { value: "🐕", label: "Mascotas" },
  { value: "🌿", label: "Bienestar" },
];

const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#6366F1",
  "#F97316",
];

type RGB = {
  r: number;
  g: number;
  b: number;
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function rgbToHex({ r, g, b }: RGB) {
  const toHex = (channel: number) =>
    clampChannel(channel).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex: string): RGB {
  const normalized = hex.replace("#", "");
  const isValid = /^[0-9A-Fa-f]{6}$/.test(normalized);

  if (!isValid) {
    return { r: 59, g: 130, b: 246 };
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

export function CategoryForm({
  category,
  defaultType = "expense",
}: CategoryFormProps) {
  const [type, setType] = useState<TransactionType>(
    category?.type || defaultType,
  );
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || PRESET_ICONS[0].value);
  const [color, setColor] = useState(
    (category?.color || PRESET_COLORS[0]).toUpperCase(),
  );
  const [rgb, setRgb] = useState<RGB>(() =>
    hexToRgb(category?.color || PRESET_COLORS[0]),
  );
  const [iconMode, setIconMode] = useState<"preset" | "custom">(() => {
    const initialIcon = category?.icon || PRESET_ICONS[0].value;
    return PRESET_ICONS.some((preset) => preset.value === initialIcon)
      ? "preset"
      : "custom";
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setRgb(hexToRgb(color));
  }, [color]);

  const updateRgbChannel = (channel: keyof RGB, value: number) => {
    const nextRgb = {
      ...rgb,
      [channel]: clampChannel(value),
    };

    setRgb(nextRgb);
    setColor(rgbToHex(nextRgb));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const trimmedName = name.trim();
    const trimmedIcon = icon.trim();

    if (!trimmedName) {
      setError("El nombre de la categoria es obligatorio");
      setIsLoading(false);
      return;
    }

    if (!trimmedIcon) {
      setError("Debes seleccionar o escribir un icono");
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

    const categoryData = {
      user_id: user.id,
      name: trimmedName,
      type,
      icon: trimmedIcon,
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
      result = await supabase.from("categories").insert(categoryData);
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
            <Tabs
              value={type}
              onValueChange={(v) => setType(v as TransactionType)}
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

          <div className="space-y-3">
            <Label>Icono</Label>
            <Tabs
              value={iconMode}
              onValueChange={(value) =>
                setIconMode(value as "preset" | "custom")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preset">Galeria</TabsTrigger>
                <TabsTrigger value="custom">Personalizado</TabsTrigger>
              </TabsList>
            </Tabs>

            {iconMode === "preset" ? (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {PRESET_ICONS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setIcon(preset.value)}
                    className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border p-2 transition-all ${
                      icon === preset.value
                        ? "border-primary bg-linear-to-b from-primary/20 via-primary/10 to-background shadow-sm"
                        : "border-border bg-linear-to-b from-muted/50 to-background hover:border-primary/40 hover:from-primary/5"
                    }`}
                    aria-label={`Icono ${preset.label}`}
                  >
                    <span
                      className={`pointer-events-none absolute inset-x-2 top-1 h-5 rounded-full blur-lg transition-opacity ${
                        icon === preset.value
                          ? "bg-primary/40 opacity-100"
                          : "bg-transparent opacity-0"
                      }`}
                    />
                    <span className="text-xl sm:text-2xl">{preset.value}</span>
                    <span
                      className={`mt-1 truncate text-[10px] sm:text-xs ${
                        icon === preset.value
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <Label htmlFor="custom-icon">Tu icono</Label>
                <Input
                  id="custom-icon"
                  type="text"
                  maxLength={8}
                  placeholder="Ej: 🧋, 🏄 o cualquier emoji"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Puedes usar emojis o simbolos cortos para identificar tu
                  categoria.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value.toUpperCase())}
                  className="h-11 w-20 p-1"
                  aria-label="Selector de color"
                />
                <Badge variant="outline" className="font-mono text-xs">
                  {color}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Rojo</span>
                    <span className="font-mono text-muted-foreground">
                      {rgb.r}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={255}
                    step={1}
                    value={[rgb.r]}
                    onValueChange={([value]) => updateRgbChannel("r", value)}
                    aria-label="Canal rojo"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Verde</span>
                    <span className="font-mono text-muted-foreground">
                      {rgb.g}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={255}
                    step={1}
                    value={[rgb.g]}
                    onValueChange={([value]) => updateRgbChannel("g", value)}
                    aria-label="Canal verde"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Azul</span>
                    <span className="font-mono text-muted-foreground">
                      {rgb.b}
                    </span>
                  </div>
                  <Slider
                    min={0}
                    max={255}
                    step={1}
                    value={[rgb.b]}
                    onValueChange={([value]) => updateRgbChannel("b", value)}
                    aria-label="Canal azul"
                  />
                </div>
              </div>
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
              <span className="font-medium">
                {name || "Nombre de la categoria"}
              </span>
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
