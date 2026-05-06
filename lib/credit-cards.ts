import type { CreditCard } from "@/lib/types";
import { toDateString } from "@/lib/utils";

/**
 * Returns the next upcoming payment due date for a card.
 * Uses midnight of today to avoid timezone drift.
 */
export function getNextPaymentDate(card: CreditCard, today: Date = new Date()): Date {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const year = todayMidnight.getFullYear();
  const month = todayMidnight.getMonth(); // 0-indexed

  const paymentThisMonth = new Date(year, month, card.payment_day);

  if (todayMidnight <= paymentThisMonth) {
    return paymentThisMonth;
  }

  // This month's payment already passed — next is next month
  return new Date(year, month + 1, card.payment_day);
}

/**
 * Returns the billing period (month/year) that a given payment date covers.
 *
 * Logic:
 *   - If payment_day > cut_day: statement closes and payment lands in the same month.
 *     e.g. cut=10, pay=25 → April statement closes Apr 10, pay Apr 25 → billing = April
 *   - If payment_day <= cut_day: payment is in the month AFTER the statement closes.
 *     e.g. cut=25, pay=15 → April statement closes Apr 25, pay May 15 → billing = April
 */
export function getBillingPeriodForPayment(
  card: CreditCard,
  paymentDate: Date,
): { billingMonth: number; billingYear: number } {
  if (card.payment_day > card.cut_day) {
    return {
      billingMonth: paymentDate.getMonth() + 1,
      billingYear: paymentDate.getFullYear(),
    };
  }

  // Payment is in next month relative to billing period
  const billingDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth() - 1, 1);
  return {
    billingMonth: billingDate.getMonth() + 1,
    billingYear: billingDate.getFullYear(),
  };
}

/**
 * Days until payment (positive = future, 0 = today, negative = overdue).
 */
export function getDaysUntilPayment(nextPaymentDate: Date, today: Date = new Date()): number {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const paymentMidnight = new Date(
    nextPaymentDate.getFullYear(),
    nextPaymentDate.getMonth(),
    nextPaymentDate.getDate(),
  );
  return Math.round(
    (paymentMidnight.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * Returns alert severity based on days until payment and paid status.
 * null = no alert needed.
 */
export function getPaymentAlertLevel(
  daysUntil: number,
  isPaid: boolean,
): "urgent" | "warning" | null {
  if (isPaid) return null;
  if (daysUntil <= 5) return "urgent";
  if (daysUntil <= 10) return "warning";
  return null;
}

/**
 * Returns start and end dates of a billing period.
 * Period runs from (cut_day+1) of the month before billingMonth to cut_day of billingMonth.
 *
 * e.g. cut_day=5, billing=May 2026 → start=Apr 6, end=May 5
 * e.g. cut_day=28, billing=Apr 2026 → start=Mar 29, end=Apr 28
 */
export function getBillingPeriodDates(
  card: CreditCard,
  billingMonth: number,
  billingYear: number,
): { startDate: string; endDate: string } {
  const end = new Date(billingYear, billingMonth - 1, card.cut_day);
  const start = new Date(billingYear, billingMonth - 2, card.cut_day + 1);
  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
  };
}

export function formatBillingPeriod(month: number, year: number): string {
  const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${MONTHS[month - 1]} ${year}`;
}
