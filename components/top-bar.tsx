"use client";

import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { usePeriodStore } from "@/lib/stores/period-store";
import { buildPeriodHref } from "@/lib/period";
import type { User } from "@supabase/supabase-js";

const MONTHS_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const PERIOD_PAGES = ["/dashboard", "/transactions"];

export function TopBar({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const month = usePeriodStore((state) => state.month);
  const year = usePeriodStore((state) => state.year);
  const goToPreviousMonth = usePeriodStore((state) => state.goToPreviousMonth);
  const goToNextMonth = usePeriodStore((state) => state.goToNextMonth);

  const showPeriod = PERIOD_PAGES.some((p) => pathname.startsWith(p));

  const handlePrev = () => {
    goToPreviousMonth();
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    router.push(buildPeriodHref(pathname, newMonth, newYear));
  };

  const handleNext = () => {
    goToNextMonth();
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    router.push(buildPeriodHref(pathname, newMonth, newYear));
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <span className="text-base font-bold">FinControl</span>
        </div>

        {showPeriod && (
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handlePrev}
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[72px] text-center text-sm font-semibold tabular-nums">
              {MONTHS_SHORT[month - 1]} {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleNext}
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase()}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
