-- Credit cards table
CREATE TABLE IF NOT EXISTS credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  card_name TEXT NOT NULL,
  last_four TEXT CHECK (last_four IS NULL OR last_four ~ '^[0-9]{4}$'),
  cut_day INTEGER NOT NULL CHECK (cut_day BETWEEN 1 AND 28),
  payment_day INTEGER NOT NULL CHECK (payment_day BETWEEN 1 AND 28),
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend transactions table for credit card tracking
-- credit_card_id: expense was charged to this card (does not affect cash)
-- payment_for_card_id: this transaction is a cash payment for a card balance
-- payment_billing_month/year: which billing period is being paid
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS credit_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_for_card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_billing_month INTEGER CHECK (payment_billing_month IS NULL OR payment_billing_month BETWEEN 1 AND 12),
  ADD COLUMN IF NOT EXISTS payment_billing_year INTEGER;

-- Row Level Security
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit cards" ON credit_cards;
CREATE POLICY "Users can view their own credit cards" ON credit_cards
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credit cards" ON credit_cards;
CREATE POLICY "Users can insert their own credit cards" ON credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credit cards" ON credit_cards;
CREATE POLICY "Users can update their own credit cards" ON credit_cards
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own credit cards" ON credit_cards;
CREATE POLICY "Users can delete their own credit cards" ON credit_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_credit_card_id ON transactions(credit_card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_for_card_id ON transactions(payment_for_card_id);
