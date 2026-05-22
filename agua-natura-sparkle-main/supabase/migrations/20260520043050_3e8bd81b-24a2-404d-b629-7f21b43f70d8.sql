ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_stock_non_negative;
ALTER TABLE public.products
  ADD CONSTRAINT products_stock_non_negative CHECK (stock >= 0);

CREATE OR REPLACE FUNCTION public.decrement_stock(_product_id uuid, _qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current integer;
  _name text;
BEGIN
  SELECT stock, name INTO _current, _name
    FROM public.products
   WHERE id = _product_id
   FOR UPDATE;

  IF _current IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;

  IF _current < _qty THEN
    RAISE EXCEPTION 'Inventario insuficiente para %: disponible %, solicitado %', _name, _current, _qty;
  END IF;

  UPDATE public.products
     SET stock = stock - _qty
   WHERE id = _product_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO anon, authenticated;