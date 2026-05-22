
-- Orders + items tables
CREATE TYPE public.order_status AS ENUM ('pendiente', 'entregado', 'cancelado');
CREATE TYPE public.delivery_type AS ENUM ('sitio', 'domicilio');
CREATE TYPE public.order_source AS ENUM ('web', 'manual');

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  delivery_type public.delivery_type NOT NULL DEFAULT 'sitio',
  address TEXT NOT NULL DEFAULT '',
  total NUMERIC NOT NULL DEFAULT 0,
  status public.order_status NOT NULL DEFAULT 'pendiente',
  source public.order_source NOT NULL DEFAULT 'web',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public can create orders (web form)
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON public.order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admins manage everything
CREATE POLICY "Admins can view orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view order items" ON public.order_items
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update order items" ON public.order_items
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete order items" ON public.order_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
