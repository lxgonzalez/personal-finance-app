-- This function creates default categories for new users
-- It will be called via a trigger when a new user signs up

CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
    (NEW.id, 'Comida', 'expense', '🍔', '#f97316', true),
    (NEW.id, 'Transporte', 'expense', '🚗', '#3b82f6', true),
    (NEW.id, 'Vivienda', 'expense', '🏠', '#8b5cf6', true),
    (NEW.id, 'Entretenimiento', 'expense', '🎮', '#ec4899', true),
    (NEW.id, 'Salud', 'expense', '💊', '#ef4444', true),
    (NEW.id, 'Educacion', 'expense', '📚', '#14b8a6', true),
    (NEW.id, 'Servicios', 'expense', '💡', '#eab308', true),
    (NEW.id, 'Compras', 'expense', '🛒', '#f43f5e', true),
    (NEW.id, 'Ahorro', 'expense', '💰', '#22c55e', true),
    (NEW.id, 'Salario', 'income', '💼', '#10b981', true),
    (NEW.id, 'Otros', 'expense', '🎁', '#6b7280', true);
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;

CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();
