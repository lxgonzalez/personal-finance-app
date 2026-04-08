-- This function creates default categories for new users
-- It will be called via a trigger when a new user signs up

CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH default_categories (name, type, icon, color) AS (
    VALUES
      ('Comida', 'expense', '🍔', '#f97316'),
      ('Transporte', 'expense', '🚗', '#3b82f6'),
      ('Vivienda', 'expense', '🏠', '#8b5cf6'),
      ('Entretenimiento', 'expense', '🎮', '#ec4899'),
      ('Salud', 'expense', '💊', '#ef4444'),
      ('Educacion', 'expense', '📚', '#14b8a6'),
      ('Servicios', 'expense', '💡', '#eab308'),
      ('Compras', 'expense', '🛒', '#f43f5e'),
      ('Ahorro', 'expense', '💰', '#22c55e'),
      ('Salario', 'income', '💼', '#10b981'),
      ('Otros', 'expense', '🎁', '#6b7280')
  )
  INSERT INTO categories (user_id, name, type, icon, color, is_default)
  SELECT
    NEW.id,
    default_categories.name,
    default_categories.type,
    default_categories.icon,
    default_categories.color,
    true
  FROM default_categories
  WHERE NOT EXISTS (
    SELECT 1
    FROM categories existing
    WHERE existing.user_id = NEW.id
      AND existing.name = default_categories.name
      AND existing.type = default_categories.type
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;

CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- Backfill default categories for existing users
WITH default_categories (name, type, icon, color) AS (
  VALUES
    ('Comida', 'expense', '🍔', '#f97316'),
    ('Transporte', 'expense', '🚗', '#3b82f6'),
    ('Vivienda', 'expense', '🏠', '#8b5cf6'),
    ('Entretenimiento', 'expense', '🎮', '#ec4899'),
    ('Salud', 'expense', '💊', '#ef4444'),
    ('Educacion', 'expense', '📚', '#14b8a6'),
    ('Servicios', 'expense', '💡', '#eab308'),
    ('Compras', 'expense', '🛒', '#f43f5e'),
    ('Ahorro', 'expense', '💰', '#22c55e'),
    ('Salario', 'income', '💼', '#10b981'),
    ('Otros', 'expense', '🎁', '#6b7280')
)
INSERT INTO categories (user_id, name, type, icon, color, is_default)
SELECT
  users.id,
  default_categories.name,
  default_categories.type,
  default_categories.icon,
  default_categories.color,
  true
FROM auth.users AS users
CROSS JOIN default_categories
WHERE NOT EXISTS (
  SELECT 1
  FROM categories existing
  WHERE existing.user_id = users.id
    AND existing.name = default_categories.name
    AND existing.type = default_categories.type
);
