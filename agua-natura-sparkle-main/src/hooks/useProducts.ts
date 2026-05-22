import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PublicProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  sort_order: number;
  image_url: string | null;
  stock: number;
};

export const useProducts = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,name,description,price,available,sort_order,image_url,stock")
      .eq("available", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setProducts((data ?? []) as PublicProduct[]);
        setLoading(false);
      });
  }, []);

  return { products, loading };
};
