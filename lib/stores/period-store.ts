"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PeriodState = {
  month: number;
  year: number;
  setPeriod: (month: number, year: number) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
};

const getCurrentPeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

export const usePeriodStore = create<PeriodState>()(
  persist(
    (set, get) => ({
      ...getCurrentPeriod(),
      setPeriod: (month, year) => set({ month, year }),
      goToPreviousMonth: () => {
        const { month, year } = get();
        if (month === 1) {
          set({ month: 12, year: year - 1 });
          return;
        }

        set({ month: month - 1, year });
      },
      goToNextMonth: () => {
        const { month, year } = get();
        if (month === 12) {
          set({ month: 1, year: year + 1 });
          return;
        }

        set({ month: month + 1, year });
      },
    }),
    {
      name: "fincontrol-period",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ month: state.month, year: state.year }),
    },
  ),
);
