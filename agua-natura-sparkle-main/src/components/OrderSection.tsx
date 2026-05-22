import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

type Item = { producto: string; cantidad: string };
type Entrega = "sitio" | "domicilio";

const OrderSection = () => {
  const { products: PRODUCTS } = useProducts();
  const [form, setForm] = useState({ nombre: "", telefono: "", direccion: "" });
  const [entrega, setEntrega] = useState<Entrega>("sitio");
  const [items, setItems] = useState<Item[]>([{ producto: "", cantidad: "1" }]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "telefono") {
      setForm({ ...form, telefono: value.replace(/\D/g, "").slice(0, 10) });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const updateItem = (index: number, field: keyof Item, value: string) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));

  const addItem = () => setItems((prev) => [...prev, { producto: "", cantidad: "1" }]);

  const removeItem = (index: number) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const total = items.reduce((sum, it) => {
    const p = PRODUCTS.find((x) => x.name === it.producto);
    const qty = parseInt(it.cantidad) || 0;
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.producto && parseInt(it.cantidad) > 0);
    if (validItems.length === 0) return toast.error("Agrega al menos un producto.");
    if (form.telefono.length !== 10) return toast.error("El teléfono debe tener 10 dígitos.");
    if (entrega === "domicilio" && !form.direccion.trim())
      return toast.error("Por favor ingresa tu dirección de entrega.");

    // Validar stock localmente y agregar cantidades por producto
    const aggregated = new Map<string, number>();
    for (const it of validItems) {
      const qty = parseInt(it.cantidad) || 0;
      aggregated.set(it.producto, (aggregated.get(it.producto) ?? 0) + qty);
    }
    for (const [name, qty] of aggregated) {
      const p = PRODUCTS.find((x) => x.name === name);
      if (!p) return toast.error(`Producto no disponible: ${name}`);
      if ((p.stock ?? 0) < qty)
        return toast.error(`Inventario insuficiente para ${name}. Disponible: ${p.stock}`);
    }

    setSubmitting(true);
    const orderId = crypto.randomUUID();
    const { error } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        customer_name: form.nombre,
        phone: form.telefono,
        delivery_type: entrega,
        address: entrega === "domicilio" ? form.direccion : "",
        total,
        source: "web",
      });

    if (error) {
      setSubmitting(false);
      return toast.error(error?.message ?? "No se pudo enviar el pedido");
    }

    const rows = validItems.map((it) => {
      const p = PRODUCTS.find((x) => x.name === it.producto);
      const qty = parseInt(it.cantidad) || 0;
      return {
        order_id: orderId,
        product_id: p?.id ?? null,
        product_name: it.producto,
        unit_price: p?.price ?? 0,
        quantity: qty,
        subtotal: (p?.price ?? 0) * qty,
      };
    });

    const { error: itemsErr } = await supabase.from("order_items").insert(rows);
    if (itemsErr) {
      setSubmitting(false);
      return toast.error(itemsErr.message);
    }

    // Descontar inventario de forma atómica por producto
    for (const [name, qty] of aggregated) {
      const p = PRODUCTS.find((x) => x.name === name);
      if (!p) continue;
      const { error: decErr } = await supabase.rpc("decrement_stock", {
        _product_id: p.id,
        _qty: qty,
      });
      if (decErr) {
        setSubmitting(false);
        return toast.error(decErr.message);
      }
    }

    setSubmitting(false);
    toast.success("¡Pedido recibido! Te contactamos por WhatsApp.");

    // Abrir WhatsApp con el resumen del pedido
    const lineas = validItems.map((it) => {
      const p = PRODUCTS.find((x) => x.name === it.producto);
      const qty = parseInt(it.cantidad) || 0;
      return `• ${qty} x ${it.producto} — $${(p?.price ?? 0) * qty}`;
    }).join("\n");
    const entregaTxt = entrega === "domicilio" ? `Domicilio: ${form.direccion}` : "Recoger en sitio";
    const msg =
      `Hola, soy ${form.nombre}.%0A` +
      `Tel: ${form.telefono}%0A` +
      `${entregaTxt}%0A%0A` +
      `Pedido:%0A${encodeURIComponent(lineas)}%0A%0A` +
      `Total: $${total} MXN`;
    window.open(`https://wa.me/526643850934?text=${msg}`, "_blank", "noopener,noreferrer");

    setForm({ nombre: "", telefono: "", direccion: "" });
    setItems([{ producto: "", cantidad: "1" }]);
    setEntrega("sitio");
  };


  const inputClass =
    "w-full rounded-lg border border-border bg-card px-4 py-3 font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";

  return (
    <section id="pedido" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Pedido <span className="text-gradient-water">en Línea</span>
          </h2>
          <p className="text-muted-foreground">
            Llena tus datos y registramos tu pedido al instante.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-lg p-8 space-y-5">
          <div>
            <label className="block font-heading font-semibold text-sm text-foreground mb-1">Nombre</label>
            <input name="nombre" required placeholder="Tu nombre completo" value={form.nombre} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block font-heading font-semibold text-sm text-foreground mb-1">Teléfono</label>
            <input
              name="telefono" required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10}
              placeholder="6641234567" value={form.telefono} onChange={handleChange} className={inputClass}
            />
            <p className="text-xs text-muted-foreground mt-1">10 dígitos, solo números.</p>
          </div>

          <div>
            <label className="block font-heading font-semibold text-sm text-foreground mb-2">Tipo de entrega</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setEntrega("sitio")}
                className={`rounded-lg border px-4 py-3 font-heading font-semibold text-sm transition-colors ${
                  entrega === "sitio" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
                }`}>En sitio</button>
              <button type="button" onClick={() => setEntrega("domicilio")}
                className={`rounded-lg border px-4 py-3 font-heading font-semibold text-sm transition-colors ${
                  entrega === "domicilio" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"
                }`}>A domicilio</button>
            </div>
          </div>

          {entrega === "domicilio" && (
            <div>
              <label className="block font-heading font-semibold text-sm text-foreground mb-1">Dirección de entrega</label>
              <input name="direccion" required placeholder="Calle, número, colonia" value={form.direccion} onChange={handleChange} className={inputClass} />
            </div>
          )}

          <div className="space-y-3 pt-2">
            <label className="block font-heading font-semibold text-sm text-foreground">Productos</label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <select required value={item.producto} onChange={(e) => updateItem(index, "producto", e.target.value)} className={`${inputClass} flex-1`}>
                  <option value="">Selecciona un producto</option>
                  {PRODUCTS.map((p) => (
                    <option key={p.name} value={p.name} disabled={(p.stock ?? 0) <= 0}>
                      {p.name} — ${p.price}{(p.stock ?? 0) <= 0 ? " (Agotado)" : ` · ${p.stock} disp.`}
                    </option>
                  ))}
                </select>
                <input type="number" min={1} step={1} required value={item.cantidad}
                  onChange={(e) => {
                    const n = Math.max(1, Math.floor(Number(e.target.value) || 1));
                    updateItem(index, "cantidad", String(n));
                  }}
                  onKeyDown={(e) => { if (["e","E","+","-",".",","].includes(e.key)) e.preventDefault(); }}
                  className={`${inputClass} w-14 px-2 text-center`} />
                <button type="button" onClick={() => removeItem(index)} disabled={items.length === 1}
                  className="p-3 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Eliminar producto">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="flex items-center gap-2 text-primary font-heading font-semibold text-sm hover:opacity-80 transition-opacity">
              <Plus className="h-4 w-4" /> Agregar otro producto
            </button>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-4">
            <span className="font-heading font-semibold text-foreground">Total estimado:</span>
            <span className="font-heading font-bold text-2xl text-primary">${total} MXN</span>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full gradient-water text-primary-foreground font-heading font-bold py-3.5 rounded-full text-lg hover:opacity-90 transition-opacity disabled:opacity-60">
            {submitting ? "Enviando..." : "Enviar Pedido"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default OrderSection;
