
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON public.products FOR SELECT
  USING (available = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial products
INSERT INTO public.products (name, description, price, available, sort_order) VALUES
  ('Garrafón 20L', 'Agua purificada de la más alta calidad en presentación de 20 litros. Ideal para el hogar y la oficina.', 22, true, 1),
  ('Garrafón 10L', 'Agua purificada en presentación de 10 litros. Práctico y fácil de transportar.', 17, true, 2),
  ('Botella 1L', 'Perfecta para llevar a donde vayas. Agua fresca y pura en formato de 1 litro.', 12, true, 3),
  ('Botella 600ml', 'Agua purificada en presentación práctica de 600ml. Ideal para uso personal.', 10, true, 4),
  ('Hielo 10kg', 'Hielo cristalino hecho con agua purificada. Perfecto para tus reuniones y eventos.', 50, true, 5),
  ('Powerade 1L', 'Bebida deportiva para reponer electrolitos. Presentación de 1 litro.', 40, true, 6),
  ('Coca-Cola Lata', 'Refrescante Coca-Cola en lata, bien fría para acompañar tus comidas.', 20, true, 7),
  ('Cheetos Flamin'' Hot Crunchy', 'Botana crujiente con el sabor picante e intenso de Flamin'' Hot.', 20, true, 8),
  ('Ding Dongs', 'Pastelitos de chocolate con relleno cremoso. El snack dulce ideal.', 15, true, 9),
  ('Hostess Twinkies', 'Clásicos pastelitos esponjosos con relleno de crema. Dulce e irresistible.', 15, true, 10),
  ('PieSnack', 'Delicioso pay individual, perfecto para un antojo dulce en cualquier momento.', 30, true, 11);
