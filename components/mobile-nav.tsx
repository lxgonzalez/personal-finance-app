"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowUpDown,
  Tags,
  Plus,
  CreditCard,
} from "lucide-react";
import { buildPeriodHref } from "@/lib/period";
import { usePeriodStore } from "@/lib/stores/period-store";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowUpDown },
  { href: "/transactions/new", label: "Nueva", icon: Plus, isAction: true },
  { href: "/categories", label: "Categorias", icon: Tags },
  { href: "/credit-cards", label: "Tarjetas", icon: CreditCard },
];

export function MobileNav() {
  const pathname = usePathname();
  const month = usePeriodStore((state) => state.month);
  const year = usePeriodStore((state) => state.year);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div
        className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]"
        style={{ gridTemplateRows: "1fr" }}
      >
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={buildPeriodHref(item.href, month, year)}
                className="col-start-3 flex items-center justify-center py-2"
                aria-label="Nueva transaccion"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95">
                  <Icon className="h-5 w-5" />
                </div>
              </Link>
            );
          }

          const colStart = index === 0 ? 1 : index === 1 ? 2 : index === 3 ? 4 : 5;

          return (
            <Link
              key={item.href}
              href={buildPeriodHref(item.href, month, year)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 transition-colors active:scale-95",
                `col-start-${colStart}`,
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-xl p-1.5 transition-colors",
                isActive ? "bg-primary/10" : "",
              )}>
                <Icon className="h-[22px] w-[22px]" />
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none tracking-tight",
                isActive ? "text-primary" : "text-muted-foreground/70",
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
