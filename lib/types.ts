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

export interface CreditCard {
  id: string;
  user_id: string;
  bank_name: string;
  card_name: string;
  last_four: string | null;
  cut_day: number;
  payment_day: number;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface CreditCardWithStatus extends CreditCard {
  next_payment_date: string;
  billing_month: number;
  billing_year: number;
  days_until_payment: number;
  is_paid: boolean;
  monthly_total: number;
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
  credit_card_id?: string | null;
  payment_for_card_id?: string | null;
  payment_billing_month?: number | null;
  payment_billing_year?: number | null;
  credit_card?: CreditCard;
  payment_for_card?: CreditCard;
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

export interface MonthlyFinanceSummary {
  month: string;
  monthIndex: number;
  income: number;
  expenses: number;
  net: number;
  accumulated: number;
}
