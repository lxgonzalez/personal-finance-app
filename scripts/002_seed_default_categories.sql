-- This function creates default categories for new users
-- It will be called via a trigger when a new user signs up

CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Comida', 'utensils', '#f97316'),
    (NEW.id, 'Transporte', 'car', '#3b82f6'),
    (NEW.id, 'Vivienda', 'home', '#8b5cf6'),
    (NEW.id, 'Entretenimiento', 'gamepad-2', '#ec4899'),
    (NEW.id, 'Salud', 'heart-pulse', '#ef4444'),
    (NEW.id, 'Educacion', 'graduation-cap', '#14b8a6'),
    (NEW.id, 'Servicios', 'zap', '#eab308'),
    (NEW.id, 'Compras', 'shopping-bag', '#f43f5e'),
    (NEW.id, 'Ahorro', 'piggy-bank', '#22c55e'),
    (NEW.id, 'Salario', 'wallet', '#10b981'),
    (NEW.id, 'Otros', 'circle', '#6b7280');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;

CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();
