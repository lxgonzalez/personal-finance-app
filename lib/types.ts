export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  category?: Category;
}

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface MonthSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
}
