import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/summary-cards";
import { ExpenseChart } from "@/components/expense-chart";
import { RecentTransactions } from "@/components/recent-transactions";
import { MonthSelector } from "@/components/month-selector";
import { MonthlyAccumulationChart } from "@/components/monthly-accumulation-chart";
import type {
  TransactionWithCategory,
  Category,
  MonthlyFinanceSummary,
} from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];
  const yearStartDate = new Date(year, 0, 1).toISOString().split("T")[0];
  const yearEndDate = new Date(year, 11, 31).toISOString().split("T")[0];

  const [{ data: transactions }, { data: yearlyTransactions }] =
    (await Promise.all([
      supabase
        .from("transactions")
        .select("*, category:categories(*)")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false }),
      supabase
        .from("transactions")
        .select("*, category:categories(*)")
        .eq("user_id", user.id)
        .gte("date", yearStartDate)
        .lte("date", yearEndDate)
        .order("date", { ascending: false }),
    ])) as [
      { data: TransactionWithCategory[] | null },
      { data: TransactionWithCategory[] | null },
    ];

  const safeTransactions = transactions || [];
  const safeYearTransactions = yearlyTransactions || [];

  const totalIncome = safeTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = safeTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const monthlySummary: MonthlyFinanceSummary[] = Array.from(
    { length: 12 },
    (_, index) => {
      const monthIndex = index + 1;
      const monthTransactions = safeYearTransactions.filter(
        (transaction) => Number(transaction.date.slice(5, 7)) === monthIndex,
      );

      const income = monthTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      const expenses = monthTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

      return {
        month: [
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
        ][index],
        monthIndex,
        income,
        expenses,
        net: income - expenses,
        accumulated: 0,
      };
    },
  ).map((entry, index, entries) => ({
    ...entry,
    accumulated: entries
      .slice(0, index + 1)
      .reduce((sum, item) => sum + item.net, 0),
  }));

  const accumulatedBalance = monthlySummary[month - 1]?.accumulated ?? 0;

  const expensesByCategory = safeTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const catId = t.category_id;
        if (!acc[catId]) {
          acc[catId] = { category: t.category, total: 0 };
        }
        acc[catId].total += Number(t.amount);
        return acc;
      },
      {} as Record<string, { category: Category; total: number }>,
    );

  const categoryData = Object.values(expensesByCategory)
    .map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="mx-auto max-w-6xl space-y-6 overflow-x-hidden px-1 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Panel de Control</h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Vision general de tus finanzas
          </p>
        </div>
        <div className="w-full sm:w-auto pb-1 sm:pb-0">
          <MonthSelector
            month={month}
            year={year}
            syncStore={Boolean(params.month || params.year)}
          />
        </div>
      </div>

      <SummaryCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        balance={balance}
        accumulatedBalance={accumulatedBalance}
      />

      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <div className="min-w-0">
          <ExpenseChart categoryData={categoryData} />
        </div>
        <div className="min-w-0">
          <MonthlyAccumulationChart data={monthlySummary} />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-1">
        <RecentTransactions
          transactions={safeTransactions.slice(0, 5)}
          month={month}
          year={year}
        />
      </div>
    </div>
  );
}
