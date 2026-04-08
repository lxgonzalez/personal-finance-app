"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPeriodHref } from "@/lib/period";
import { usePeriodStore } from "@/lib/stores/period-store";

interface MonthSelectorProps {
  month: number;
  year: number;
  syncStore?: boolean;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function MonthSelector({
  month,
  year,
  syncStore = false,
}: MonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const setPeriod = usePeriodStore((state) => state.setPeriod);

  useEffect(() => {
    if (syncStore) {
      setPeriod(month, year);
    }
  }, [month, year, setPeriod, syncStore]);

  const navigateMonth = (direction: "prev" | "next") => {
    let newMonth = month;
    let newYear = year;

    if (direction === "prev") {
      if (month === 1) {
        newMonth = 12;
        newYear = year - 1;
      } else {
        newMonth = month - 1;
      }
    } else {
      if (month === 12) {
        newMonth = 1;
        newYear = year + 1;
      } else {
        newMonth = month + 1;
      }
    }

    setPeriod(newMonth, newYear);
    router.push(buildPeriodHref(pathname, newMonth, newYear));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateMonth("prev")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="w-36 text-center">
        <span className="font-medium">
          {MONTHS[month - 1]} {year}
        </span>
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateMonth("next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
