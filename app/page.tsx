import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  LineChart,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "FinControl",
  description:
    "Controla ingresos, gastos y categorias con una experiencia ligera, pastel y enfocada en finanzas personales.",
  alternates: {
    canonical: "/",
  },
};

const features = [
  {
    icon: LineChart,
    title: "Panel claro",
    description:
      "Visualiza tus movimientos con una estructura simple y datos faciles de leer.",
  },
  {
    icon: BadgeCheck,
    title: "Categorias ordenadas",
    description:
      "Agrupa gastos e ingresos para identificar rapidamente en que se va tu dinero.",
  },
  {
    icon: ShieldCheck,
    title: "Acceso privado",
    description:
      "Tu informacion se mantiene separada por usuario con autenticacion y control de acceso.",
  },
];

const metrics = [
  { value: "+11", label: "categorias base" },
  { value: "2", label: "tipos de movimiento" },
  { value: "1", label: "panel unificado" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,248,236,0.95),_rgba(247,243,234,0.92)_40%,_rgba(235,243,255,0.9)_100%)] text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-14 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm shadow-sm backdrop-blur">
              <Wallet className="h-4 w-4 text-primary" />
              FinControl para finanzas personales
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Lleva ingresos, gastos y categorias con una vista limpia y
                rapida.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Una app pensada para controlar tu dinero sin ruido visual: panel
                resumido, categorias automatizadas y un flujo directo para
                registrar cada movimiento.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/auth/sign-up">
                  Crear cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Iniciar sesion</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <Card
                  key={metric.label}
                  className="border-border/70 bg-white/70 backdrop-blur"
                >
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-white/80 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-accent/20 to-secondary/30 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Resumen mensual
                  </p>
                  <p className="text-2xl font-semibold">Visibilidad total</p>
                </div>
                <div className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-foreground shadow-sm">
                  Abril 2026
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Ingresos", "+ $8,450"],
                  ["Gastos", "- $3,120"],
                  ["Balance", "$5,330"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/70 bg-white/75 p-4"
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-2 text-xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm"
                  >
                    <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="font-semibold">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
