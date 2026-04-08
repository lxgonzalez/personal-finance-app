"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowUpDown,
  Tags,
  Plus,
  CalendarDays,
} from "lucide-react";
import { buildPeriodHref } from "@/lib/period";
import { usePeriodStore } from "@/lib/stores/period-store";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/transactions", label: "Movimientos", icon: ArrowUpDown },
  { href: "/transactions/new", label: "Nueva", icon: Plus, isAction: true },
  { href: "/categories", label: "Categorias", icon: Tags },
];

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function MobileNav() {
  const pathname = usePathname();
  const month = usePeriodStore((state) => state.month);
  const year = usePeriodStore((state) => state.year);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-5 items-end gap-1 px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map((item, index) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          const baseClasses = cn(
            "flex w-full flex-col items-center justify-center rounded-2xl px-2 py-2 text-center transition-colors",
            isActive ? "text-primary" : "text-muted-foreground",
          );

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={buildPeriodHref(item.href, month, year)}
                className="col-start-3 row-start-1 -mt-7 flex justify-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-background">
                  <Icon className="h-6 w-6" />
                </div>
              </Link>
            );
          }

          const gridPositionClass =
            index === 0
              ? "col-start-1"
              : index === 1
                ? "col-start-2"
                : "col-start-4";

          return (
            <Link
              key={item.href}
              href={buildPeriodHref(item.href, month, year)}
              className={cn(baseClasses, gridPositionClass)}
            >
              <Icon className="h-5 w-5" />
              <span className="mt-1 text-[11px] leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        <div className="col-start-5 flex justify-center">
          <div className="flex min-w-0 flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-muted-foreground transition-colors">
            <CalendarDays className="h-5 w-5" />
            <span className="mt-1 text-[11px] leading-none">
              {MONTHS[month - 1]} {year}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
