"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthSelectorProps {
  month: number;
  year: number;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function MonthSelector({ month, year }: MonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

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

    router.push(`${pathname}?month=${newMonth}&year=${newYear}`);
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
      <div className="text-center min-w-[140px]">
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
