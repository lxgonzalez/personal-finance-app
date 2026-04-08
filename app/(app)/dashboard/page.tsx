import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/summary-cards";
import { ExpenseChart } from "@/components/expense-chart";
import { RecentTransactions } from "@/components/recent-transactions";
import { MonthSelector } from "@/components/month-selector";
import type { TransactionWithCategory, Category } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
  const endDate = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false }) as { data: TransactionWithCategory[] | null };

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.eq.${user.id},is_default.eq.true`) as { data: Category[] | null };

  const safeTransactions = transactions || [];
  const safeCategories = categories || [];

  const totalIncome = safeTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = safeTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = safeTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const catId = t.category_id;
      if (!acc[catId]) {
        acc[catId] = { category: t.category, total: 0 };
      }
      acc[catId].total += Number(t.amount);
      return acc;
    }, {} as Record<string, { category: Category; total: number }>);

  const categoryData = Object.values(expensesByCategory)
    .map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visao geral das suas financas
          </p>
        </div>
        <MonthSelector month={month} year={year} />
      </div>

      <SummaryCards 
        totalIncome={totalIncome} 
        totalExpenses={totalExpenses} 
        balance={balance} 
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseChart categoryData={categoryData} />
        <RecentTransactions transactions={safeTransactions.slice(0, 5)} />
      </div>
    </div>
  );
}
