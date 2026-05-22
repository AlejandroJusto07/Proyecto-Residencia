import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  sort_order: number;
  image_url: string | null;
  stock: number;
};

const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setFetching(true);
    const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    else setProducts((data ?? []) as Product[]);
    setFetching(false);
  };

  const updateLocal = (id: string, patch: Partial<Product>) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const saveProduct = async (p: Product) => {
    const { error } = await supabase.from("products").update({
      name: p.name, description: p.description, price: p.price,
      available: p.available, sort_order: p.sort_order, image_url: p.image_url,
      stock: p.stock,
    }).eq("id", p.id);
    if (error) toast.error(error.message);
    else toast.success(`"${p.name}" guardado`);
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Eliminado");
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    }
  };

  const addProduct = async () => {
    const maxOrder = products.reduce((m, p) => Math.max(m, p.sort_order), 0);
    const { data, error } = await supabase.from("products").insert({
      name: "Nuevo producto", description: "", price: 0, available: true, sort_order: maxOrder + 1, stock: 0,
    }).select().single();
    if (error) toast.error(error.message);
    else if (data) {
      setProducts((prev) => [...prev, data as Product]);
      toast.success("Producto agregado");
    }
  };

  const uploadImage = async (p: Product, file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("La imagen debe pesar menos de 5MB");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${p.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) return toast.error(upErr.message);
    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    const url = pub.publicUrl;
    const { error: updErr } = await supabase.from("products").update({ image_url: url }).eq("id", p.id);
    if (updErr) toast.error(updErr.message);
    else {
      updateLocal(p.id, { image_url: url });
      toast.success("Imagen actualizada");
    }
  };

  const removeImage = async (p: Product) => {
    const { error } = await supabase.from("products").update({ image_url: null }).eq("id", p.id);
    if (error) toast.error(error.message);
    else {
      updateLocal(p.id, { image_url: null });
      toast.success("Imagen eliminada");
    }
  };

  const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-2xl text-foreground">Productos</h2>
          <p className="text-sm text-muted-foreground">Edita precio, descripción, disponibilidad e imágenes.</p>
        </div>
        <button onClick={addProduct} className="flex items-center gap-2 gradient-water text-primary-foreground font-heading font-semibold text-sm px-4 py-2.5 rounded-full hover:opacity-90">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>

      {fetching ? (
        <p className="text-muted-foreground">Cargando productos...</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className={`bg-card rounded-xl border border-border p-4 ${!p.available ? "opacity-60" : ""}`}>
              <div className="grid sm:grid-cols-[100px_1fr_100px_100px_100px_auto] gap-3 items-start">
                <div className="space-y-2">
                  <div className="w-24 h-24 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden relative">
                    {p.image_url ? (
                      <>
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                        <button type="button" onClick={() => removeImage(p)}
                          className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                          aria-label="Quitar imagen">
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin foto</span>
                    )}
                  </div>
                  <label className="flex items-center justify-center gap-1 text-xs cursor-pointer rounded-md border border-border px-2 py-1 hover:bg-muted transition-colors">
                    <Upload className="h-3 w-3" />
                    Subir
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(p, f); e.target.value = ""; }} />
                  </label>
                </div>
                <div className="space-y-2">
                  <input value={p.name} onChange={(e) => updateLocal(p.id, { name: e.target.value })} className={`${inputClass} font-semibold`} placeholder="Nombre" />
                  <textarea value={p.description} onChange={(e) => updateLocal(p.id, { description: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Descripción" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Precio</label>
                  <input type="number" step="0.01" min="0" value={p.price}
                    onChange={(e) => updateLocal(p.id, { price: parseFloat(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Stock</label>
                  <input type="number" min="0" value={p.stock}
                    onChange={(e) => updateLocal(p.id, { stock: Math.max(0, parseInt(e.target.value) || 0) })}
                    className={`${inputClass} ${p.stock <= 0 ? "text-destructive font-semibold" : ""}`} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Orden</label>
                  <input type="number" value={p.sort_order}
                    onChange={(e) => updateLocal(p.id, { sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
                </div>
                <div className="flex sm:flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={p.available} onChange={(e) => updateLocal(p.id, { available: e.target.checked })} />
                    Disponible
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-3 justify-end">
                <button onClick={() => deleteProduct(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-destructive border border-border hover:border-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
                <button onClick={() => saveProduct(p)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90">
                  <Save className="h-3.5 w-3.5" /> Guardar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsAdmin;
