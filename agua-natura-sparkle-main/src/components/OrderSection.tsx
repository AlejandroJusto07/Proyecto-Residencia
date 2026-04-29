import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

const PRODUCTS = [
  { name: "Garrafón 20L", price: 22 },
  { name: "Garrafón 10L", price: 17 },
  { name: "Botella 1L", price: 12 },
  { name: "Botella 600ml", price: 10 },
  { name: "Hielo 10kg", price: 50 },
  { name: "Powerade 1L", price: 40 },
  { name: "Coca-Cola Lata", price: 20 },
  { name: "Cheetos Flamin' Hot Crunchy", price: 20 },
  { name: "Ding Dongs", price: 15 },
  { name: "Hostess Twinkies", price: 15 },
  { name: "PieSnack", price: 30 },
];

type Item = { producto: string; cantidad: string };

const OrderSection = () => {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  });
  const [items, setItems] = useState<Item[]>([{ producto: "", cantidad: "1" }]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () =>
    setItems((prev) => [...prev, { producto: "", cantidad: "1" }]);

  const removeItem = (index: number) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const total = items.reduce((sum, it) => {
    const p = PRODUCTS.find((x) => x.name === it.producto);
    const qty = parseInt(it.cantidad) || 0;
    return sum + (p ? p.price * qty : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter((it) => it.producto && parseInt(it.cantidad) > 0);
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto a tu pedido.");
      return;
    }

    const lines = validItems.map((it) => {
      const p = PRODUCTS.find((x) => x.name === it.producto);
      const subtotal = p ? p.price * (parseInt(it.cantidad) || 0) : 0;
      return `• ${it.cantidad} x ${it.producto}${p ? ` — $${subtotal} MXN` : ""}`;
    });

    const msg =
      `Hola, quiero hacer un pedido:\n\n` +
      `👤 Nombre: ${form.nombre}\n` +
      `📞 Teléfono: ${form.telefono}\n` +
      `📍 Dirección: ${form.direccion}\n\n` +
      `🛒 Productos:\n${lines.join("\n")}\n\n` +
      `💰 Total: $${total} MXN`;

    window.open(`https://wa.me/526643850934?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("¡Redirigiendo a WhatsApp para confirmar tu pedido!");
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
            Agrega todos los productos que necesites y confirma por WhatsApp.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl shadow-lg p-8 space-y-5"
        >
          <div>
            <label className="block font-heading font-semibold text-sm text-foreground mb-1">Nombre</label>
            <input
              name="nombre"
              required
              placeholder="Tu nombre completo"
              value={form.nombre}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block font-heading font-semibold text-sm text-foreground mb-1">Teléfono</label>
            <input
              name="telefono"
              required
              type="tel"
              placeholder="664 123 4567"
              value={form.telefono}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block font-heading font-semibold text-sm text-foreground mb-1">Dirección de entrega</label>
            <input
              name="direccion"
              required
              placeholder="Calle, número, colonia"
              value={form.direccion}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="block font-heading font-semibold text-sm text-foreground">Productos</label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <select
                  required
                  value={item.producto}
                  onChange={(e) => updateItem(index, "producto", e.target.value)}
                  className={`${inputClass} flex-1`}
                >
                  <option value="">Selecciona un producto</option>
                  {PRODUCTS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} — ${p.price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  required
                  value={item.cantidad}
                  onChange={(e) => updateItem(index, "cantidad", e.target.value)}
                  className={`${inputClass} w-20`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                  className="p-3 rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 text-primary font-heading font-semibold text-sm hover:opacity-80 transition-opacity"
            >
              <Plus className="h-4 w-4" /> Agregar otro producto
            </button>
          </div>

          <div className="flex justify-between items-center border-t border-border pt-4">
            <span className="font-heading font-semibold text-foreground">Total estimado:</span>
            <span className="font-heading font-bold text-2xl text-primary">${total} MXN</span>
          </div>

          <button
            type="submit"
            className="w-full gradient-water text-primary-foreground font-heading font-bold py-3.5 rounded-full text-lg hover:opacity-90 transition-opacity"
          >
            Enviar Pedido por WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
};

export default OrderSection;
