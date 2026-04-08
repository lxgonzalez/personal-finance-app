-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT 'circle',
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE categories
SET type = 'expense'
WHERE type IS NULL;

ALTER TABLE categories
  ALTER COLUMN type SET NOT NULL;

DO $$
BEGIN
  ALTER TABLE categories
    ADD CONSTRAINT categories_type_check CHECK (type IN ('income', 'expense'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Categories policies
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;
CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
